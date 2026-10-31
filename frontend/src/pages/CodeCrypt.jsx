import React, { useState } from 'react';
import GhostMascot from '../components/GhostMascot';
import MarkdownView from '../components/MarkdownView';
import SaveJournalModal from '../components/SaveJournalModal';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Code2,
  Play,
  RotateCcw,
  Copy,
  Check,
  Bookmark,
  Sparkles,
  Shield,
  Layers,
  ArrowRightLeft,
  FileCode,
  Bug,
  BookOpen,
  Loader2
} from 'lucide-react';

const ANALYSIS_ACTIONS = [
  'Explain Code',
  'Find Potential Bugs',
  'Complexity Analysis',
  'Find Edge Cases',
  'Improve Readability',
  'Compare Approaches',
  'Convert Language',
  'Explain Algorithm',
  'Suggest Unit Tests',
  'Security Review'
];

const LANGUAGES = [
  'Auto Detect',
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'C',
  'Go',
  'Rust',
  'SQL',
  'C#',
  'PHP',
  'Ruby',
  'Kotlin',
  'Swift',
  'Bash'
];

const SAMPLE_SNIPPETS = [
  {
    label: 'Two Sum (Hash Map)',
    lang: 'Python',
    action: 'Explain Algorithm',
    code: `def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in lookup:\n            return [lookup[complement], i]\n        lookup[num] = i\n    return []`
  },
  {
    label: 'Fibonacci DP (Memoization)',
    lang: 'JavaScript',
    action: 'Complexity Analysis',
    code: `function fib(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n  return memo[n];\n}`
  },
  {
    label: 'SQL Injection Vulnerability',
    lang: 'Python',
    action: 'Security Review',
    code: `import sqlite3\n\ndef get_user_profile(user_input_id):\n    conn = sqlite3.connect("users.db")\n    cursor = conn.cursor()\n    # Insecure query composition\n    query = f"SELECT id, username, email FROM users WHERE id = '{user_input_id}'"\n    cursor.execute(query)\n    return cursor.fetchone()`
  },
  {
    label: 'Buggy Array Rotation',
    lang: 'C++',
    action: 'Find Potential Bugs',
    code: `void rotate(int nums[], int n, int k) {\n    // Buggy off-by-one and negative k handling\n    int temp[n];\n    for (int i = 0; i < n; i++) {\n        temp[(i + k) % n] = nums[i];\n    }\n    for (int i = 0; i <= n; i++) {\n        nums[i] = temp[i];\n    }\n}`
  }
];

export default function CodeCrypt() {
  const { activePersonality, addToast } = useApp();

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Auto Detect');
  const [action, setAction] = useState('Explain Code');
  const [targetLanguage, setTargetLanguage] = useState('Python');
  const [context, setContext] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleLoadSample = (sample) => {
    setCode(sample.code);
    setLanguage(sample.lang);
    setAction(sample.action);
    setContext('');
    setResult(null);
  };

  const handleReset = () => {
    setCode('');
    setContext('');
    setResult(null);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      addToast({ title: 'Input Required', message: 'Please enter a code snippet into the Code Crypt.', type: 'warning' });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const data = await api.analyzeCode({
        code: code.trim(),
        language,
        action,
        target_language: action === 'Convert Language' ? targetLanguage : undefined,
        context: context.trim() || undefined,
        personality: activePersonality
      });
      setResult(data);
    } catch (err) {
      addToast({
        title: 'Code Crypt Analysis Failed',
        message: err.message || 'The ghost was unable to process this snippet.',
        type: 'error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const text = `### ${result.action} (${result.language})\n\n### Summary\n${result.summary}\n\n### Detailed Analysis\n${result.detailed_analysis}\n\n### Complexity Notes\n${result.complexity_notes || 'N/A'}\n\n### Proposed Code\n${result.proposed_code || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({ title: 'Copied', message: 'Code Crypt analysis copied to clipboard.', type: 'info' });
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <GhostMascot size={36} mood="crypt" />
          <div className="page-header-titles">
            <h1>Code Crypt</h1>
            <p>Analyze algorithms, uncover logic bugs, evaluate Big-O complexity, and review security.</p>
          </div>
        </div>

        <button onClick={handleReset} className="btn btn-secondary btn-sm" disabled={isAnalyzing}>
          <RotateCcw size={14} />
          <span>Reset Code</span>
        </button>
      </div>

      {/* Sample Snippets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted-gray)', fontWeight: 600 }}>
          Load DSA Sample:
        </span>
        {SAMPLE_SNIPPETS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            className="tag-btn"
            onClick={() => handleLoadSample(s)}
            style={{ fontSize: '0.76rem' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Code Input & Controls */}
      <form onSubmit={handleAnalyze} className="phantom-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-group">
          <label className="phantom-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Code Snippet or Algorithm Implementation <span className="text-error">*</span></span>
            <span style={{ color: 'var(--muted-gray)', fontWeight: 400 }}>Monospaced syntax editor</span>
          </label>
          <textarea
            className="phantom-textarea code-font"
            rows={8}
            placeholder="// Paste function, algorithm, or class implementation here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={isAnalyzing}
          />
        </div>

        {/* Action, Source Lang, and Target Lang Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div className="form-group">
            <label className="phantom-label">Analysis Objective</label>
            <select
              className="phantom-select"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              disabled={isAnalyzing}
            >
              {ANALYSIS_ACTIONS.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="phantom-label">Source Language</label>
            <select
              className="phantom-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isAnalyzing}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {action === 'Convert Language' && (
            <div className="form-group">
              <label className="phantom-label">Target Language</label>
              <select
                className="phantom-select"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={isAnalyzing}
              >
                {LANGUAGES.filter((l) => l !== 'Auto Detect').map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group" style={{ gridColumn: action === 'Convert Language' ? 'span 1' : 'span 2' }}>
            <label className="phantom-label">Focus / Context (Optional)</label>
            <input
              type="text"
              className="phantom-input"
              placeholder="e.g. Check for recursion stack overflow or explain space trade-off"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted-gray)' }}>
            Preserves your original code and details suggested modifications without executing them.
          </span>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!code.trim() || isAnalyzing}
            style={{ minWidth: '160px' }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deciphering Code...</span>
              </>
            ) : (
              <>
                <Code2 size={16} />
                <span>Analyze Code</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Analysis Output */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Action Ribbon */}
          <div
            className="phantom-card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              borderLeft: '4px solid var(--toxic-green)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={18} className="text-toxic" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>
                  {result.action} · <span className="text-mono">{result.language}</span>
                  {result.target_language && (
                    <span> → <span className="text-mono text-cyan">{result.target_language}</span></span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-gray)' }}>
                  Code Crypt Evaluation Complete
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={handleCopyResult} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} className="text-toxic" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button onClick={() => setIsSaveModalOpen(true)} className="btn btn-primary btn-sm">
                <Bookmark size={14} />
                <span>Save to Journal</span>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="phantom-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--ghost-purple-light)', marginBottom: '8px' }}>
              Summary
            </h3>
            <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
              <MarkdownView content={result.summary || 'Analysis generated.'} />
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="phantom-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--spectral-cyan)', marginBottom: '8px' }}>
              Detailed Analysis & Logic Flow
            </h3>
            <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
              <MarkdownView content={result.detailed_analysis || 'No detailed steps parsed.'} />
            </div>
          </div>

          {/* Complexity Notes & Edge Cases Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {result.complexity_notes && (
              <div className="phantom-card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--pumpkin-orange)', marginBottom: '8px' }}>
                  Big-O Complexity Notes
                </h3>
                <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                  <MarkdownView content={result.complexity_notes} />
                </div>
              </div>
            )}

            {result.edge_cases && result.edge_cases.length > 0 && (
              <div className="phantom-card" style={{ padding: '16px', gridColumn: result.complexity_notes ? 'auto' : '1 / -1' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--toxic-green)', marginBottom: '8px' }}>
                  Edge Cases & Assumptions
                </h3>
                <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'var(--moonlight-white)' }}>
                  {result.edge_cases.map((ec, idx) => (
                    <li key={idx}>{ec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Proposed Code / Solution */}
          {result.proposed_code && (
            <div className="phantom-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--toxic-green)', marginBottom: '8px' }}>
                Proposed Solution / Code Snippet
              </h3>
              <MarkdownView content={result.proposed_code} />
            </div>
          )}
        </div>
      )}

      {/* Save Modal */}
      {result && (
        <SaveJournalModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          initialTitle={`${result.action}: ${result.summary?.slice(0, 45) || 'Code Analysis'}`}
          entryType="code"
          languageOrSubject={result.language || language}
          originalPrompt={`CODE:\n${code}\n\nACTION:\n${result.action}\n\nCONTEXT:\n${context}`}
          aiResponse={`SUMMARY:\n${result.summary}\n\nANALYSIS:\n${result.detailed_analysis}\n\nCOMPLEXITY:\n${result.complexity_notes || 'N/A'}\n\nPROPOSED:\n${result.proposed_code || 'None'}`}
          defaultTags={`dsa, ${result.action.toLowerCase().replace(/\s+/g, '-')}, ${result.language.toLowerCase()}`}
        />
      )}
    </div>
  );
}
