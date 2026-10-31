import re
from typing import Dict, Any, List
from services.ollama_service import ollama_service
from services.prompt_service import get_active_personality, build_system_prompt
from models.commands import CommandExplainRequest, CommandExplainResponse

def build_command_prompt(req: CommandExplainRequest) -> str:
    parts = [
        "Explain the following command or configuration snippet with supernatural clarity and developer safety in mind.",
        f"Target Shell / Environment: {req.environment or 'Auto Detect'}"
    ]
    if req.context:
        parts.append(f"Context / Intended Goal: {req.context}")
    
    parts.append(f"\n```bash\n{req.command}\n```\n")

    parts.append("""
You MUST organize your response strictly using these 7 numbered markdown headings:

### 1. Purpose
(A crisp, plain-language description of what this command is designed to achieve)

### 2. Breakdown
(Bullet points breaking down each binary, flag, argument, pipeline, and subshell component)

### 3. Expected Behavior
(What specifically happens on a normal, successful execution on the target operating system or tool)

### 4. Risks
(Identify any destructive, security-sensitive, irreversible, or unexpected effects. Explicitly evaluate whether it modifies files, changes permissions, deletes data, or transmits network payloads)

### 5. Safer Alternative
(Provide a safer alternative, dry-run flag, inspection command, or backup step if applicable, or state None if standard)

### 6. Example
(A clean, illustrative example showing safe or typical invocation)

### 7. Environment Notes
(Important platform differences, e.g. PowerShell vs CMD vs Bash vs Linux differences, syntax quirks, or path conventions)
""")
    return "\n\n".join(parts)

def parse_command_sections(raw_text: str, req: CommandExplainRequest) -> CommandExplainResponse:
    def extract_section(title_pattern: str, next_patterns: List[str]) -> str:
        pattern = rf"(?:###\s*\d*\.?\s*{title_pattern}|##\s*\d*\.?\s*{title_pattern}|\*\*\d*\.?\s*{title_pattern}\*\*)"
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if not match:
            return ""
        start = match.end()
        end = len(raw_text)
        for next_p in next_patterns:
            np = rf"(?:###\s*\d*\.?\s*{next_p}|##\s*\d*\.?\s*{next_p}|\*\*\d*\.?\s*{next_p}\*\*)"
            next_match = re.search(np, raw_text[start:], re.IGNORECASE)
            if next_match:
                end = min(end, start + next_match.start())
        return raw_text[start:end].strip()

    purpose = extract_section(r"Purpose", [r"Breakdown", r"Expected Behavior"])
    breakdown_raw = extract_section(r"Breakdown", [r"Expected Behavior", r"Risks"])
    expected_behavior = extract_section(r"Expected Behavior", [r"Risks", r"Safer Alternative"])
    risks_raw = extract_section(r"Risks", [r"Safer Alternative", r"Example"])
    safer_alt = extract_section(r"Safer Alternative", [r"Example", r"Environment Notes"])
    example_raw = extract_section(r"Example", [r"Environment Notes"])
    env_notes = extract_section(r"Environment Notes", [])

    # Parse breakdown bullets
    breakdown_list = []
    for line in breakdown_raw.split("\n"):
        line = line.strip()
        if not line:
            continue
        line_clean = re.sub(r"^(\*|\-|\d+\.)\s*", "", line)
        if ":" in line_clean:
            part, desc = line_clean.split(":", 1)
            breakdown_list.append({"part": part.strip("` *"), "description": desc.strip()})
        elif line_clean:
            breakdown_list.append({"part": "Component", "description": line_clean})

    if not breakdown_list and req.command:
        # Default split
        tokens = req.command.split()
        if tokens:
            breakdown_list.append({"part": tokens[0], "description": "Primary binary or command"})
            if len(tokens) > 1:
                breakdown_list.append({"part": " ".join(tokens[1:]), "description": "Arguments and flags"})

    # Determine risk level
    risk_level = "Safe"
    high_risk_words = ["destructive", "delete", "remove", "drop table", "truncate", "format", "rm -rf", "kill", "high risk", "dangerous", "unrecoverable"]
    caution_words = ["caution", "overwrite", "modify", "network", "permission", "restart", "stop service"]
    
    combined_risks = (risks_raw + " " + req.command).lower()
    if any(w in combined_risks for w in high_risk_words):
        risk_level = "High Risk"
    elif any(w in combined_risks for w in caution_words):
        risk_level = "Caution"

    if not purpose:
        purpose = raw_text[:250].strip()
    if not expected_behavior:
        expected_behavior = "Executes the specified command according to the environment's shell rules."
    if not risks_raw:
        risks_raw = "Review command syntax carefully before running."

    return CommandExplainResponse(
        purpose=purpose,
        breakdown=breakdown_list,
        expected_behavior=expected_behavior,
        risks=risks_raw,
        risk_level=risk_level,
        safer_alternative=safer_alt or None,
        example=example_raw or None,
        environment_notes=env_notes or f"Applicable for {req.environment or 'standard command shells'}.",
        raw_markdown=raw_text,
        environment=req.environment or "Auto Detect"
    )

async def explain_command(req: CommandExplainRequest) -> CommandExplainResponse:
    personality = get_active_personality(req.personality)
    system_prompt = build_system_prompt(personality)
    prompt = build_command_prompt(req)

    raw_response = await ollama_service.generate(prompt=prompt, system_prompt=system_prompt)
    return parse_command_sections(raw_response, req)
