import pytest
from services.prompt_service import (
    build_system_prompt,
    build_chat_prompt,
    get_active_personality,
    PERSONALITIES
)
from services.error_analysis_service import parse_error_sections
from services.command_analysis_service import parse_command_sections
from services.code_analysis_service import parse_code_sections
from models.errors import ErrorAnalysisRequest
from models.commands import CommandExplainRequest
from models.code_analysis import CodeAnalysisRequest

def test_personalities():
    for name in ["Friendly Ghost", "Ancient Phantom", "Sassy Poltergeist"]:
        prompt = build_system_prompt(name)
        assert len(prompt) > 50
        assert "DO NOT execute" in prompt

def test_chat_prompt_generation():
    prompt = build_chat_prompt(
        message="Explain recursion",
        language="Python",
        topic="Data Structures and Algorithms"
    )
    assert "Recursion" in prompt or "recursion" in prompt
    assert "Python" in prompt
    assert "Data Structures" in prompt

def test_error_sections_parsing():
    sample_response = """
### 1. Error Summary
IndentationError in Python script.

### 2. Evidence
Line 4: unindent does not match any outer indentation level.

### 3. Likely Cause
Mixed tabs and spaces on line 4.

### 4. Investigation Steps
1. Open file in editor.
2. Enable whitespace rendering.

### 5. Possible Fixes
1. Convert all tabs to 4 spaces.

### 6. Edge Cases
Pasting code from websites often introduces hidden tab characters.

### 7. Missing Information
Editor configuration or surrounding block indentation.

### 8. Confidence
High. The error message specifically points to mismatched indentation.
"""
    req = ErrorAnalysisRequest(error_message="IndentationError: unindent does not match")
    parsed = parse_error_sections(sample_response, req)
    assert "IndentationError" in parsed.error_summary
    assert parsed.confidence == "High"
    assert len(parsed.investigation_steps) >= 1
    assert len(parsed.possible_fixes) >= 1

def test_command_sections_parsing():
    sample_cmd_response = """
### 1. Purpose
Removes a directory and its contents recursively and forcefully.

### 2. Breakdown
* `rm`: Remove file or directory utility
* `-r`: Recursive removal
* `-f`: Force removal without prompt

### 3. Expected Behavior
Deletes the target folder without confirmation.

### 4. Risks
High risk of catastrophic data loss if executed on root or parent directory.

### 5. Safer Alternative
Use `rm -i` or move to trash.

### 6. Example
`rm -r ./temp_build`

### 7. Environment Notes
In Windows PowerShell, `rm` is an alias for `Remove-Item`.
"""
    req = CommandExplainRequest(command="rm -rf /tmp/test")
    parsed = parse_command_sections(sample_cmd_response, req)
    assert "Removes" in parsed.purpose
    assert parsed.risk_level == "High Risk"
    assert len(parsed.breakdown) >= 1
