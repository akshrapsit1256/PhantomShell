import re
from typing import Dict, Any, List, Optional
from services.ollama_service import ollama_service
from services.prompt_service import get_active_personality, build_system_prompt
from models.code_analysis import CodeAnalysisRequest, CodeAnalysisResponse

ACTION_PROMPT_DIRECTIVES = {
    "Explain Code": "Explain this code step-by-step, outlining the flow of execution, role of key variables, and purpose of each function block.",
    "Find Potential Bugs": "Thoroughly inspect this code for logic bugs, off-by-one errors, null/undefined pointers, unhandled edge cases, resource leaks, and silent failures.",
    "Complexity Analysis": "Perform a rigorous Big-O time and space complexity analysis. Break down both the best, average, and worst-case time complexity, and auxiliary space complexity with mathematical reasoning.",
    "Find Edge Cases": "Identify critical edge cases (e.g. empty inputs, single element, negative numbers, extreme values, duplicates, cycles, overflow) that could break this code.",
    "Improve Readability": "Propose refactoring to enhance readability, idiomatic style, and naming conventions without altering the underlying runtime behavior.",
    "Compare Approaches": "Evaluate different algorithmic approaches (e.g. iterative vs recursive, space vs time trade-offs, alternative data structures) to solve this problem.",
    "Convert Language": "Translate this code into the requested target language. Ensure idiomatic conventions of the target language are followed and highlight platform-specific nuances.",
    "Explain Algorithm": "Identify and explain the underlying Data Structure & Algorithm (DSA) paradigm (e.g. Two Pointers, Sliding Window, DFS/BFS, Dynamic Programming, Greedy, Divide & Conquer), explaining its invariant and mechanism.",
    "Suggest Unit Tests": "Generate comprehensive unit test cases covering happy paths, boundaries, and negative tests for this code.",
    "Security Review": "Audit this snippet for security vulnerabilities such as injection, memory unsafety, buffer overflow, uncontrolled recursion, or insecure defaults."
}

def build_code_prompt(req: CodeAnalysisRequest) -> str:
    parts = [
        f"Perform an expert '{req.action}' analysis on the following code snippet.",
        f"Source Programming Language: {req.language or 'Auto Detect'}"
    ]
    if req.action == "Convert Language" and req.target_language:
        parts.append(f"Target Translation Language: {req.target_language}")
    if req.context:
        parts.append(f"User Context / Focus: {req.context}")

    action_directive = ACTION_PROMPT_DIRECTIVES.get(
        req.action,
        "Analyze this code carefully, explaining its logic, structure, and potential improvements."
    )
    parts.append(f"Specific Task: {action_directive}")

    parts.append(f"\n```\n{req.code}\n```\n")

    parts.append("""
Organize your response with clean markdown headings:

### Summary
(A concise overview of the analysis or translation)

### Detailed Analysis
(Step-by-step evaluation, explanation of mechanics, trade-offs, and design decisions)

### Complexity Notes
(Time and space complexity breakdown if applicable)

### Proposed Code / Solution
(If recommending changes, tests, or language conversion, provide the complete, clean, syntax-highlighted code block here. Clearly explain how it differs from the original code)

### Edge Cases & Assumptions
(Bullet points detailing input limits, assumptions made, and boundary cases)
""")
    return "\n\n".join(parts)

def parse_code_sections(raw_text: str, req: CodeAnalysisRequest) -> CodeAnalysisResponse:
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

    summary = extract_section(r"Summary", [r"Detailed Analysis", r"Complexity Notes"])
    detailed = extract_section(r"Detailed Analysis", [r"Complexity Notes", r"Proposed Code"])
    complexity = extract_section(r"Complexity Notes", [r"Proposed Code", r"Edge Cases"])
    proposed_code = extract_section(r"Proposed Code", [r"Edge Cases"])
    edge_cases_raw = extract_section(r"Edge Cases", [])

    edge_cases_list = []
    if edge_cases_raw:
        for line in edge_cases_raw.split("\n"):
            line = line.strip()
            if line:
                cleaned = re.sub(r"^(\*|\-|\d+\.)\s*", "", line)
                if cleaned:
                    edge_cases_list.append(cleaned)

    if not summary:
        summary = f"Completed {req.action} on the supplied code snippet."
    if not detailed:
        detailed = raw_text

    return CodeAnalysisResponse(
        action=req.action,
        language=req.language or "Auto Detect",
        target_language=req.target_language,
        summary=summary,
        detailed_analysis=detailed,
        complexity_notes=complexity or None,
        proposed_code=proposed_code or None,
        edge_cases=edge_cases_list if edge_cases_list else None,
        raw_markdown=raw_text
    )

async def analyze_code(req: CodeAnalysisRequest) -> CodeAnalysisResponse:
    personality = get_active_personality(req.personality)
    system_prompt = build_system_prompt(personality)
    prompt = build_code_prompt(req)

    raw_response = await ollama_service.generate(prompt=prompt, system_prompt=system_prompt)
    return parse_code_sections(raw_response, req)
