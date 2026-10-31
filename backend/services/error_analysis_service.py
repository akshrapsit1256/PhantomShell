import re
from typing import Dict, Any, List
from services.ollama_service import ollama_service
from services.prompt_service import get_active_personality, build_system_prompt
from models.errors import ErrorAnalysisRequest, ErrorAnalysisResponse

def build_error_prompt(req: ErrorAnalysisRequest) -> str:
    parts = [
        "Analyze the following software error or crash log with the precision of an expert debugger.",
        f"Language/Environment: {req.language_or_env or 'Auto Detect'}"
    ]
    if req.user_intent:
        parts.append(f"User Goal/Intent: {req.user_intent}")
    if req.version_info:
        parts.append(f"Version Information: {req.version_info}")
    
    parts.append(f"\n--- ERROR MESSAGE / TRACEBACK ---\n{req.error_message}\n--- END ERROR ---")

    if req.code_snippet:
        parts.append(f"\n--- RELEVANT CODE SNIPPET ---\n{req.code_snippet}\n--- END CODE ---")

    parts.append("""
You MUST organize your response strictly using these 8 numbered markdown headings:

### 1. Error Summary
(Explain clearly what this error means in plain technical terms)

### 2. Evidence
(Cite exact error lines, exception classes, line numbers, or code patterns directly from the input)

### 3. Likely Cause
(Explain the most probable root cause of the failure based on the evidence)

### 4. Investigation Steps
(Numbered step-by-step verification checklist for the user to confirm the hypothesis)

### 5. Possible Fixes
(Specific actionable code corrections or configuration adjustments. If suggesting commands, describe exactly what they do and highlight any risks)

### 6. Edge Cases
(Related conditions, race conditions, null issues, or environment discrepancies that cause the same symptom)

### 7. Missing Information
(What additional context, stack traces, configs, or versions would be needed if this hypothesis cannot be verified)

### 8. Confidence
(State confidence: High, Medium, or Low, followed by an honest explanation of any uncertainty)
""")
    return "\n\n".join(parts)

def parse_error_sections(raw_text: str, req: ErrorAnalysisRequest) -> ErrorAnalysisResponse:
    """Extract sections cleanly from markdown response with robust fallbacks."""
    def extract_section(title_pattern: str, next_patterns: List[str]) -> str:
        pattern = rf"(?:###\s*\d*\.?\s*{title_pattern}|##\s*\d*\.?\s*{title_pattern}|\*\*\d*\.?\s*{title_pattern}\*\*)"
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if not match:
            return ""
        start = match.end()
        # Find next heading
        end = len(raw_text)
        for next_p in next_patterns:
            np = rf"(?:###\s*\d*\.?\s*{next_p}|##\s*\d*\.?\s*{next_p}|\*\*\d*\.?\s*{next_p}\*\*)"
            next_match = re.search(np, raw_text[start:], re.IGNORECASE)
            if next_match:
                end = min(end, start + next_match.start())
        return raw_text[start:end].strip()

    summary = extract_section(r"Error Summary", [r"Evidence", r"Likely Cause"])
    evidence = extract_section(r"Evidence", [r"Likely Cause", r"Investigation Steps"])
    likely_cause = extract_section(r"Likely Cause", [r"Investigation Steps", r"Possible Fixes"])
    investigation_raw = extract_section(r"Investigation Steps", [r"Possible Fixes", r"Edge Cases"])
    fixes_raw = extract_section(r"Possible Fixes", [r"Edge Cases", r"Missing Information"])
    edge_cases_raw = extract_section(r"Edge Cases", [r"Missing Information", r"Confidence"])
    missing_info = extract_section(r"Missing Information", [r"Confidence"])
    confidence_raw = extract_section(r"Confidence", [])

    # Process lists
    def to_list(text: str) -> List[str]:
        items = []
        for line in text.split("\n"):
            line = line.strip()
            if not line:
                continue
            cleaned = re.sub(r"^(\d+\.|\-|\*)\s*", "", line).strip()
            if cleaned:
                items.append(cleaned)
        return items if items else [text] if text else []

    investigation_steps = to_list(investigation_raw)
    possible_fixes = to_list(fixes_raw)
    edge_cases = to_list(edge_cases_raw)

    # Determine confidence level
    conf_level = "Medium"
    if re.search(r"\bhigh\b", confidence_raw, re.IGNORECASE):
        conf_level = "High"
    elif re.search(r"\blow\b", confidence_raw, re.IGNORECASE):
        conf_level = "Low"

    # Fallbacks if model didn't use strict headers
    if not summary:
        summary = raw_text[:300].strip() + ("..." if len(raw_text) > 300 else "")
    if not likely_cause:
        likely_cause = "Analysis generated. See detailed investigation below."
    if not investigation_steps:
        investigation_steps = ["Review the provided traceback carefully.", "Check related dependencies and syntax."]
    if not possible_fixes:
        possible_fixes = ["Inspect the code around the failing line and apply defensive null/bounds checks."]

    return ErrorAnalysisResponse(
        error_summary=summary or "An error occurred during execution.",
        evidence=evidence or "Traceback and error snippet supplied by user.",
        likely_cause=likely_cause,
        investigation_steps=investigation_steps,
        possible_fixes=possible_fixes,
        edge_cases=edge_cases if edge_cases else ["Unchecked null/undefined references", "Version mismatch between dependencies"],
        missing_information=missing_info or "Full stack trace, exact dependency versions, or surrounding module imports if the issue persists.",
        confidence=conf_level,
        confidence_rationale=confidence_raw or f"Estimated confidence is {conf_level} based on available traceback details.",
        raw_markdown=raw_text,
        language_or_env=req.language_or_env or "Auto Detect"
    )

async def analyze_error(req: ErrorAnalysisRequest) -> ErrorAnalysisResponse:
    personality = get_active_personality(req.personality)
    system_prompt = build_system_prompt(personality)
    prompt = build_error_prompt(req)

    raw_response = await ollama_service.generate(prompt=prompt, system_prompt=system_prompt)
    return parse_error_sections(raw_response, req)
