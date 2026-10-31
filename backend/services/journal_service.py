from datetime import datetime, timezone
from typing import List, Optional, Tuple
from database import get_db_connection, detect_potential_secrets
from models.journal import JournalEntry, JournalEntryCreate, SecretCheckResponse

class JournalService:
    @staticmethod
    def check_for_secrets(text: str) -> SecretCheckResponse:
        findings = detect_potential_secrets(text)
        has_secrets = len(findings) > 0
        warning = None
        if has_secrets:
            warning = (
                "Spooky Warning: Potential secrets detected in this entry ("
                + ", ".join(findings)
                + "). Never store active API keys, tokens, or credentials in local history."
            )
        return SecretCheckResponse(
            has_potential_secrets=has_secrets,
            findings=findings,
            warning_message=warning
        )

    @staticmethod
    def create_entry(entry: JournalEntryCreate) -> JournalEntry:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute(
            """
            INSERT INTO journal_entries (title, entry_type, language_or_subject, original_prompt, ai_response, tags, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entry.title,
                entry.entry_type,
                entry.language_or_subject,
                entry.original_prompt,
                entry.ai_response,
                entry.tags or "",
                now
            )
        )
        conn.commit()
        entry_id = cursor.lastrowid
        conn.close()

        return JournalEntry(
            id=entry_id,
            title=entry.title,
            entry_type=entry.entry_type,
            language_or_subject=entry.language_or_subject,
            original_prompt=entry.original_prompt,
            ai_response=entry.ai_response,
            tags=entry.tags or "",
            created_at=now
        )

    @staticmethod
    def list_entries(
        search: Optional[str] = None,
        entry_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[JournalEntry], int]:
        conn = get_db_connection()
        cursor = conn.cursor()

        query_conditions = []
        params = []

        if entry_type and entry_type != "all":
            query_conditions.append("entry_type = ?")
            params.append(entry_type)

        if search:
            query_conditions.append("(title LIKE ? OR original_prompt LIKE ? OR ai_response LIKE ? OR tags LIKE ?)")
            pattern = f"%{search}%"
            params.extend([pattern, pattern, pattern, pattern])

        where_clause = f"WHERE {' AND '.join(query_conditions)}" if query_conditions else ""

        # Total count query
        count_sql = f"SELECT COUNT(*) FROM journal_entries {where_clause}"
        cursor.execute(count_sql, params)
        total_count = cursor.fetchone()[0]

        # Select rows
        select_sql = f"""
            SELECT id, title, entry_type, language_or_subject, original_prompt, ai_response, tags, created_at
            FROM journal_entries
            {where_clause}
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        """
        cursor.execute(select_sql, params + [limit, offset])
        rows = cursor.fetchall()
        conn.close()

        entries = [
            JournalEntry(
                id=r["id"],
                title=r["title"],
                entry_type=r["entry_type"],
                language_or_subject=r["language_or_subject"],
                original_prompt=r["original_prompt"],
                ai_response=r["ai_response"],
                tags=r["tags"],
                created_at=r["created_at"]
            )
            for r in rows
        ]
        return entries, total_count

    @staticmethod
    def get_entry_by_id(entry_id: int) -> Optional[JournalEntry]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, title, entry_type, language_or_subject, original_prompt, ai_response, tags, created_at
            FROM journal_entries WHERE id = ?
            """,
            (entry_id,)
        )
        r = cursor.fetchone()
        conn.close()
        if not r:
            return None
        return JournalEntry(
            id=r["id"],
            title=r["title"],
            entry_type=r["entry_type"],
            language_or_subject=r["language_or_subject"],
            original_prompt=r["original_prompt"],
            ai_response=r["ai_response"],
            tags=r["tags"],
            created_at=r["created_at"]
        )

    @staticmethod
    def delete_entry(entry_id: int) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM journal_entries WHERE id = ?", (entry_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

journal_service = JournalService()
