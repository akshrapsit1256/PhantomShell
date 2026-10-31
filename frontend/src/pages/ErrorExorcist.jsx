import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GhostMascot from '../components/GhostMascot';
import MarkdownView from '../components/MarkdownView';
import SaveJournalModal from '../components/SaveJournalModal';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Flame,
  Search,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const SAMPLE_ERRORS = [
  {
    label: 'Python IndexError',
    error: 'IndexError: list index out of range\n  File "solution.py", line 14, in binary_search\n    mid_val = arr[mid]',
    code: 'def binary_search(arr, target):\n    low, high = 0, len(arr)\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1',
    lang: 'Python',
    intent: 'Implementing binary search to find target in sorted list'
  },
  {
    label: 'Java NullPointerException',
    error: 'Exception in thread "main" java.lang.NullPointerException: Cannot invoke "com.example.User.getName()" because "user" is null\n\tat com.example.App.process(App.java:23)',
    code: 'public void process(List<User> users) {\n    for (User user : users) {\n        System.out.println(user.getName().toUpperCase());\n    }\n}',
    lang: 'Java',
    intent: 'Iterating over user list and printing names'
  },
  {
    label: 'React Undefined State',
    error: 'TypeError: Cannot read properties of undefined (reading \'map\')\n    at UserList (UserList.jsx:12:1)\n    at renderWithHooks (react-dom.development.js:14985:18)',
    code: 'function UserList() {\n  const [data, setData] = useState();\n  useEffect(() => {\n    fetchUsers().then(res => setData(res.data));\n  }, []);\n  return <div>{data.map(u => <p key={u.id}>{u.name}</p>)}</div>;\n}',
    lang: 'JavaScript',
    intent: 'Fetching users on mount and displaying list'
  },
  {
    label: 'Docker Port Conflict',
    error: 'Error response from daemon: driver failed programming external connectivity on endpoint web-service: Bind for 0.0.0.0:8000 failed: port is already allocated',
    code: 'docker run -d -p 8000:8000 --name web-service my-fastapi-image',
    lang: 'Docker',
    intent: 'Starting local FastAPI container on port 8000'
  }
];

export default function ErrorExorcist() {
  const navigate = useNavigate();
  const { activePersonality, addToast } = useApp();

  const [errorMessage, setErrorMessage] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [languageOrEnv, setLanguageOrEnv] = useState('Auto Detect');
  const [userIntent, setUserIntent] = useState('');
  const [versionInfo, setVersionInfo] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleLoadSample = (sample) => {
    setErrorMessage(sample.error);
    setCodeSnippet(sample.code);
    setLanguageOrEnv(sample.lang);
    setUserIntent(sample.intent);
    setResult(null);
  };

  const handleReset = () => {
    setErrorMessage('');
    setCodeSnippet('');
    setUserIntent('');
    setVersionInfo('');
    setResult(null);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!errorMessage.trim()) {
      addToast({ title: 'Input Required', message: 'Please supply an error message or traceback to analyze.', type: 'warning' });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const data = await api.analyzeError({
        error_message: errorMessage.trim(),
        code_snippet: codeSnippet.trim() || undefined,
        language_or_env: languageOrEnv,
        user_intent: userIntent.trim() || undefined,
        version_info: versionInfo.trim() || undefined,
        personality: activePersonality
      });
      setResult(data);
    } catch (err) {
      addToast({
        title: 'Error Analysis Failed',
        message: err.message || 'The ghost was unable to complete the analysis.',
        type: 'error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!result) return;
    const formatted = `### Error Summary\n${result.error_summary}\n\n### Likely Cause\n${result.likely_cause}\n\n### Investigation Steps\n${result.investigation_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n### Possible Fixes\n${result.possible_fixes.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n### Confidence: ${result.confidence} (${result.confidence_rationale})`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({ title: 'Copied', message: 'Error analysis copied to clipboard.', type: 'info' });
  };

  const handleFollowUpInChat = () => {
    // Navigate to terminal with prefilled question
    navigate('/terminal');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <GhostMascot size={36} mood="exorcist" />
          <div className="page-header-titles">
            <h1>Error Exorcist</h1>
            <p>Paste stack traces, compiler output, or runtime crashes to uncover root causes and fixes.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleReset} className="btn btn-secondary btn-sm" disabled={isAnalyzing}>
            <RotateCcw size={14} />
            <span>Reset Inputs</span>
          </button>
        </div>
      </div>

      {/* Sample Quick Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted-gray)', fontWeight: 600 }}>
          Load Real Sample:
        </span>
        {SAMPLE_ERRORS.map((s, idx) => (
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

      {/* Main Analysis Form */}
      <form onSubmit={handleAnalyze} className="phantom-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-group">
          <label className="phantom-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Error Message or Stack Trace <span className="text-error">*</span></span>
            <span style={{ color: 'var(--muted-gray)', fontWeight: 400 }}>Supports tracebacks, logs, compiler errors</span>
          </label>
          <textarea
            className="phantom-textarea code-font"
            rows={5}
            placeholder="Paste your error message, traceback, or compiler output here..."
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            required
            disabled={isAnalyzing}
          />
        </div>

        <div className="form-group">
          <label className="phantom-label">
            Related Code Snippet (Optional)
          </label>
          <textarea
            className="phantom-textarea code-font"
            rows={4}
            placeholder="Paste the surrounding code or function where the error occurs..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div className="form-group">
            <label className="phantom-label">Language / Environment</label>
            <select
              className="phantom-select"
              value={languageOrEnv}
              onChange={(e) => setLanguageOrEnv(e.target.value)}
              disabled={isAnalyzing}
            >
              <option value="Auto Detect">Auto Detect</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="C / C++">C / C++</option>
              <option value="C# / .NET">C# / .NET</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
              <option value="Docker">Docker</option>
              <option value="SQL">SQL</option>
              <option value="PowerShell">PowerShell</option>
              <option value="Git">Git</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="phantom-label">What were you trying to do? (Optional)</label>
            <input
              type="text"
              className="phantom-input"
              placeholder="e.g. Updating user record via REST endpoint"
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <div className="form-group">
            <label className="phantom-label">Version / Tool Info (Optional)</label>
            <input
              type="text"
              className="phantom-input"
              placeholder="e.g. Python 3.12, Node 20, Vite 5"
              value={versionInfo}
              onChange={(e) => setVersionInfo(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-gray)' }}>
            <ShieldAlert size={14} className="text-orange" />
            <span>PhantomShell never executes supplied code or commands automatically.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!errorMessage.trim() || isAnalyzing}
            style={{ minWidth: '160px' }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Exorcising Error...</span>
              </>
            ) : (
              <>
                <Flame size={16} />
                <span>Analyze Error</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Analysis Results Display (8 Structured Sections) */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Ribbon & Confidence Header */}
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
              <CheckCircle2 size={20} className="text-toxic" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>Exorcism Complete</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-gray)' }}>
                  Language / Runtime: <strong style={{ color: 'var(--moonlight-white)' }}>{result.language_or_env}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className={`pill ${
                  result.confidence === 'High' ? 'pill-toxic' : result.confidence === 'Medium' ? 'pill-orange' : 'pill-error'
                }`}
              >
                Confidence: {result.confidence}
              </span>

              <button onClick={handleCopyAnalysis} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} className="text-toxic" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button onClick={() => setIsSaveModalOpen(true)} className="btn btn-primary btn-sm">
                <Bookmark size={14} />
                <span>Save to Journal</span>
              </button>

              <button onClick={handleFollowUpInChat} className="btn btn-ghost btn-sm">
                <MessageSquare size={14} />
                <span>Follow-up in Chat</span>
              </button>
            </div>
          </div>

          {/* 8-Section Structured Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {/* 1. Error Summary */}
            <div className="phantom-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--ghost-purple-light)', marginBottom: '8px' }}>
                1. Error Summary
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                {result.error_summary || 'Analysis complete.'}
              </p>
            </div>

            {/* 2. Evidence */}
            <div className="phantom-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--ghost-purple-light)', marginBottom: '8px' }}>
                2. Evidence in Input
              </h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                <MarkdownView content={result.evidence || 'No explicit line evidence extracted.'} />
              </div>
            </div>

            {/* 3. Likely Cause */}
            <div className="phantom-card" style={{ padding: '16px', gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--pumpkin-orange)', marginBottom: '8px' }}>
                3. Likely Root Cause
              </h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--moonlight-white)' }}>
                <MarkdownView content={result.likely_cause || 'Root cause analyzed.'} />
              </div>
            </div>

            {/* 4. Investigation Steps */}
            <div className="phantom-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--spectral-cyan)', marginBottom: '8px' }}>
                4. Investigation Steps
              </h3>
              {result.investigation_steps && result.investigation_steps.length > 0 ? (
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: 'var(--moonlight-white)' }}>
                  {result.investigation_steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p style={{ fontSize: '0.86rem', margin: 0 }}>Review call stack and verified parameters.</p>
              )}
            </div>

            {/* 5. Possible Fixes */}
            <div className="phantom-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--toxic-green)', marginBottom: '8px' }}>
                5. Possible Fixes & Solutions
              </h3>
              {result.possible_fixes && result.possible_fixes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.possible_fixes.map((fix, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-midnight)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', fontSize: '0.85rem' }}>
                      <MarkdownView content={fix} />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.86rem', margin: 0 }}>Follow the suggested code adjustments above.</p>
              )}
            </div>

            {/* 6. Edge Cases */}
            <div className="phantom-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--ghost-purple)', marginBottom: '8px' }}>
                6. Edge Cases & Boundary Conditions
              </h3>
              {result.edge_cases && result.edge_cases.length > 0 ? (
                <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'var(--moonlight-white)' }}>
                  {result.edge_cases.map((ec, idx) => (
                    <li key={idx}>{ec}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Check empty input and extreme parameters.</p>
              )}
            </div>

            {/* 7. Missing Information */}
            <div className="phantom-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--muted-gray)', marginBottom: '8px' }}>
                7. Missing Information
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--moonlight-white)' }}>
                {result.missing_information || 'Sufficient context was provided in the error message.'}
              </p>
            </div>

            {/* 8. Confidence Rationale */}
            <div className="phantom-card" style={{ padding: '16px', gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--moonlight-white)', marginBottom: '6px' }}>
                8. Confidence & Rationale
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted-gray)' }}>
                <strong>Assessment ({result.confidence}):</strong> {result.confidence_rationale || 'Analysis based on common patterns and error indicators.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {result && (
        <SaveJournalModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          initialTitle={`Error Fix: ${result.error_summary?.slice(0, 50) || 'Error Investigation'}`}
          entryType="error"
          languageOrSubject={result.language_or_env || languageOrEnv}
          originalPrompt={`ERROR:\n${errorMessage}\n\nCODE:\n${codeSnippet}`}
          aiResponse={`CAUSE:\n${result.likely_cause}\n\nFIXES:\n${result.possible_fixes?.join('\n')}`}
          defaultTags={`error, debugging, ${result.language_or_env || 'code'}`}
        />
      )}
    </div>
  );
}
