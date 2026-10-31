import sqlite3
import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from config import settings

def get_utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create journal entries table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            entry_type TEXT NOT NULL,
            language_or_subject TEXT NOT NULL,
            original_prompt TEXT NOT NULL,
            ai_response TEXT NOT NULL,
            tags TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
    """)

    # Create indexes for fast filtering and searching
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_journal_type ON journal_entries (entry_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_journal_created ON journal_entries (created_at)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_journal_lang ON journal_entries (language_or_subject)")

    # Create app settings table for dynamic overrides
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    # Populate defaults if missing
    now_str = get_utc_now_iso()
    cursor.execute("INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)",
                   ("personality", settings.DEFAULT_PERSONALITY, now_str))
    cursor.execute("INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)",
                   ("ollama_model", settings.OLLAMA_MODEL, now_str))
    cursor.execute("INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)",
                   ("ollama_base_url", settings.OLLAMA_BASE_URL, now_str))

    conn.commit()
    conn.close()

# Secret detection scanner for private local history
SECRET_PATTERNS = [
    (r"(?i)(?:api[_-]?key|apikey|secret[_-]?key)\s*[:=]\s*['\"]?[a-zA-Z0-9_\-]{16,}['\"]?", "Potential API or Secret Key"),
    (r"(?i)bearer\s+[a-zA-Z0-9_\-\.]{25,}", "Bearer Token"),
    (r"(?i)ghp_[a-zA-Z0-9]{36}", "GitHub Personal Access Token"),
    (r"(?i)xox[baprs]-[a-zA-Z0-9\-]{10,}", "Slack Token"),
    (r"-----BEGIN (?:RSA|OPENSSH|DSA|EC) PRIVATE KEY-----", "Private Key Header"),
    (r"(?i)aws[_-]?(?:access[_-]?key[_-]?id|secret[_-]?access[_-]?key)\s*[:=]\s*['\"]?[A-Za-z0-9/+=]{16,}['\"]?", "AWS Credentials"),
    (r"(?i)password\s*[:=]\s*['\"][^'\"]{6,}['\"]", "Hardcoded Password Assignment")
]

def detect_potential_secrets(text: str) -> List[str]:
    """Scan text for high-risk secret patterns to warn user before saving."""
    findings = []
    for pattern, description in SECRET_PATTERNS:
        if re.search(pattern, text):
            findings.append(description)
    return findings
