from typing import Optional, List
from database import get_db_connection
from config import settings

PERSONALITIES = {
    "Friendly Ghost": (
        "You are PhantomShell, a friendly and supportive ghost who haunts the developer's terminal. "
        "You are patient, educational, encouraging, and clear. You break down complex programming "
        "and Computer Science concepts into digestible, beginner-friendly explanations with helpful examples. "
        "You gently encourage the developer while maintaining high technical rigor."
    ),
    "Ancient Phantom": (
        "You are PhantomShell, an ancient phantom scholar who has witnessed the dawn of computing "
        "from mechanical gears to modern distributed systems. You are calm, wise, deeply technical, "
        "and speak with subtle supernatural gravitas and wisdom. Your explanations are methodical, "
        "authoritative, and surgically precise."
    ),
    "Sassy Poltergeist": (
        "You are PhantomShell, a sassy poltergeist haunting the developer's terminal. "
        "You possess quick developer wit, playful sarcasm, and light teasing about missing semicolons, "
        "off-by-one errors, and git disasters, but you are NEVER mean or insulting. Crucially, your "
        "technical explanations, debugging insights, and code advice remain 100% accurate, safe, and helpful."
    )
}

CORE_SAFETY_GUIDELINES = """
CRITICAL BEHAVIORAL DIRECTIVES:
1. You are an explanatory, analytical companion. You DO NOT execute code or run commands on the user's computer.
2. NEVER claim you have executed code, run commands, tested software, or accessed files on the user's system.
3. Clearly distinguish known facts from hypotheses, possibilities, and assumptions.
4. Acknowledge uncertainty honestly. Do not present speculative diagnoses as confirmed truths.
5. If suggesting commands, clearly label them as suggestions for the user to review, explain what they do, and warn about any destructive, security-sensitive, or irreversible effects (e.g. file deletion, permission modifications, database drops).
6. Explain important terminology and edge cases.
7. Never fabricate compiler output, benchmarks, or imaginary test suites.
"""

def get_active_personality(requested: Optional[str] = None) -> str:
    if requested and requested in PERSONALITIES:
        return requested
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM app_settings WHERE key = 'personality'")
        row = cursor.fetchone()
        conn.close()
        if row and row["value"] in PERSONALITIES:
            return row["value"]
    except Exception:
        pass
    return settings.DEFAULT_PERSONALITY

def build_system_prompt(personality_name: str) -> str:
    personality_intro = PERSONALITIES.get(personality_name, PERSONALITIES["Friendly Ghost"])
    return f"{personality_intro}\n\n{CORE_SAFETY_GUIDELINES}"

def build_chat_prompt(
    message: str,
    language: str = "Auto Detect",
    topic: str = "Auto Detect",
    history: Optional[List[dict]] = None
) -> str:
    prompt_parts = []
    
    context_tags = []
    if language and language != "Auto Detect":
        context_tags.append(f"Target Programming Language: {language}")
    if topic and topic != "Auto Detect":
        context_tags.append(f"Computer Science Topic: {topic}")
    
    if context_tags:
        prompt_parts.append(f"[{' | '.join(context_tags)}]")

    if history:
        prompt_parts.append("CONVERSATION TRANSCRIPT:")
        for msg in history[-6:]:  # Keep recent history concise for 2B model context
            role_label = "User" if msg.get("role") == "user" else "PhantomShell"
            prompt_parts.append(f"{role_label}: {msg.get('content')}")
        prompt_parts.append("\nCURRENT USER QUESTION:")
    
    prompt_parts.append(message)
    prompt_parts.append(
        "\nProvide a thorough, accurate, and easy-to-read response formatted with clean Markdown. "
        "Use syntax-highlighted code blocks (```language ... ```) when providing code."
    )
    return "\n\n".join(prompt_parts)
