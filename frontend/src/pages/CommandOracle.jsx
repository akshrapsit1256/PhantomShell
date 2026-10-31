import React, { useState } from 'react';
import GhostMascot from '../components/GhostMascot';
import MarkdownView from '../components/MarkdownView';
import SaveJournalModal from '../components/SaveJournalModal';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Cpu,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Bookmark,
  RotateCcw,
  Terminal,
  Info,
  Loader2,
  Flame
} from 'lucide-react';

const SAMPLE_COMMANDS = [
  {
    label: 'Destructive git reset',
    cmd: 'git reset --hard HEAD~1',
    env: 'Git',
    context: 'Trying to discard the latest commit that had bad changes'
  },
  {
    label: 'Recursive file deletion',
    cmd: 'rm -rf ./build/dist',
    env: 'Bash',
    context: 'Cleaning build artifacts before a fresh build'
  },
  {
    label: 'Docker cleanup',
    cmd: 'docker system prune -a --volumes',
    env: 'Docker',
    context: 'Freeing disk space by removing unused containers and images'
  },
  {
    label: 'Windows port lookup',
    cmd: 'netstat -ano | findstr :8000',
    env: 'Windows PowerShell',
    context: 'Finding which process ID is using port 8000'
  },
  {
    label: 'Permission change',
    cmd: 'chmod -R 777 /var/www/html',
    env: 'Linux shell',
    context: 'Fixing permission denied error on web directory'
  }
];

export default function CommandOracle() {
  const { activePersonality, addToast } = useApp();

  const [command, setCommand] = useState('');
  const [environment, setEnvironment] = useState('Auto Detect');
  const [context, setContext] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleLoadSample = (sample) => {
    setCommand(sample.cmd);
    setEnvironment(sample.env);
    setContext(sample.context);
    setResult(null);
  };

  const handleReset = () => {
    setCommand('');
    setContext('');
    setResult(null);
  };

  const handleExplain = async (e) => {
    if (e) e.preventDefault();
    if (!command.trim()) {
      addToast({ title: 'Input Required', message: 'Please enter a command to consult the Oracle.', type: 'warning' });
      return;
    }

    setIsExplaining(true);
    setResult(null);

    try {
      const data = await api.explainCommand({
        command: command.trim(),
        environment,
        context: context.trim() || undefined,
        personality: activePersonality
      });
      setResult(data);
    } catch (err) {
      addToast({
        title: 'Oracle Consultation Failed',
        message: err.message || 'The ghost was unable to analyze this command.',
        type: 'error'
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCopyExplanation = () => {
    if (!result) return;
    const text = `### Command Purpose\n${result.purpose}\n\n### Expected Behavior\n${result.expected_behavior}\n\n### Risks (${result.risk_level})\n${result.risks}\n\n### Safer Alternative\n${result.safer_alternative || 'None required.'}\n\n### Environment Notes\n${result.environment_notes}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({ title: 'Copied', message: 'Command explanation copied to clipboard.', type: 'info' });
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'High Risk':
        return <span className="pill pill-error"><Flame size={12} /> High Risk</span>;
      case 'Caution':
        return <span className="pill pill-orange"><AlertTriangle size={12} /> Caution</span>;
      case 'Safe':
      default:
        return <span className="pill pill-toxic"><CheckCircle2 size={12} /> Safe</span>;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <GhostMascot size={36} mood="oracle" />
          <div className="page-header-titles">
            <h1>Command Oracle</h1>
            <p>Understand complex CLI commands, shell flags, and configuration scripts before you run them.</p>
          </div>
        </div>

        <button onClick={handleReset} className="btn btn-secondary btn-sm" disabled={isExplaining}>
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Safety Banner */}
      <div
        style={{
          background: 'rgba(101, 231, 255, 0.08)',
          border: '1px solid rgba(101, 231, 255, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <Shield size={20} className="text-cyan" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem' }}>
          <strong style={{ color: 'var(--spectral-cyan)' }}>Strict Safety Sandbox Guarantee:</strong>{' '}
          PhantomShell is an explanation companion. It <strong>never executes commands</strong>, never triggers shell actions, and never touches your local filesystem.
        </div>
      </div>

      {/* Sample Commands */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted-gray)', fontWeight: 600 }}>
          Inspect Example:
        </span>
        {SAMPLE_COMMANDS.map((s, idx) => (
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

      {/* Command Input Form */}
      <form onSubmit={handleExplain} className="phantom-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-group">
          <label className="phantom-label">
            Command or Configuration Snippet <span className="text-error">*</span>
          </label>
          <textarea
            className="phantom-textarea code-font"
            rows={3}
            placeholder="e.g. docker run --rm -v $(pwd):/app -p 3000:3000 node:20 npm test"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            required
            disabled={isExplaining}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div className="form-group">
            <label className="phantom-label">Execution Environment</label>
            <select
              className="phantom-select"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              disabled={isExplaining}
            >
              <option value="Auto Detect">Auto Detect</option>
              <option value="Windows PowerShell">Windows PowerShell</option>
              <option value="Windows Command Prompt">Windows Command Prompt (cmd)</option>
              <option value="Bash">Bash</option>
              <option value="Linux shell">Linux shell</option>
              <option value="Git">Git</option>
              <option value="Docker">Docker</option>
              <option value="Node.js / npm">Node.js / npm</option>
              <option value="Python / pip">Python / pip</option>
              <option value="Maven / Gradle">Maven / Gradle</option>
              <option value="SQL">SQL</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="phantom-label">Context or User Intent (Optional)</label>
            <input
              type="text"
              className="phantom-input"
              placeholder="e.g. I want to clear cached dependencies without breaking existing setup"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={isExplaining}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!command.trim() || isExplaining}
            style={{ minWidth: '160px' }}
          >
            {isExplaining ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Consulting Oracle...</span>
              </>
            ) : (
              <>
                <Cpu size={16} />
                <span>Explain Command</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Output Sections */}
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
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={18} className="text-cyan" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>Analysis for {result.environment}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-gray)' }}>
                  Evaluated with ghost safety heuristics
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getRiskBadge(result.risk_level)}

              <button onClick={handleCopyExplanation} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} className="text-toxic" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button onClick={() => setIsSaveModalOpen(true)} className="btn btn-primary btn-sm">
                <Bookmark size={14} />
                <span>Save to Journal</span>
              </button>
            </div>
          </div>

          {/* 1. Purpose & Expected Behavior */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            <div className="phantom-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--spectral-cyan)', marginBottom: '8px' }}>
                1. Purpose
              </h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                <MarkdownView content={result.purpose || 'Command purpose explained.'} />
              </div>
            </div>

            <div className="phantom-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--ghost-purple-light)', marginBottom: '8px' }}>
                2. Expected Behavior
              </h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                <MarkdownView content={result.expected_behavior || 'Standard command execution flow.'} />
              </div>
            </div>
          </div>

          {/* 3. Breakdown of Parts and Flags */}
          <div className="phantom-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--moonlight-white)', marginBottom: '10px' }}>
              3. Command Component Breakdown
            </h3>
            {result.breakdown && result.breakdown.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-midnight)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '12px'
                    }}
                  >
                    <code
                      style={{
                        background: 'rgba(101, 231, 255, 0.12)',
                        color: 'var(--spectral-cyan)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.part}
                    </code>
                    <span style={{ fontSize: '0.86rem', color: 'var(--moonlight-white)', flex: 1 }}>
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.86rem', color: 'var(--muted-gray)' }}>No flags or subcommands detected.</p>
            )}
          </div>

          {/* 4. Risks & 5. Safer Alternative */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            <div
              className="phantom-card"
              style={{
                padding: '16px',
                borderLeft: `4px solid ${result.risk_level === 'High Risk' ? 'var(--error-red)' : 'var(--pumpkin-orange)'}`
              }}
            >
              <h3 style={{ fontSize: '0.95rem', color: result.risk_level === 'High Risk' ? 'var(--error-red)' : 'var(--pumpkin-orange)', marginBottom: '8px' }}>
                4. Risks & Destructive Effects
              </h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                <MarkdownView content={result.risks || 'No severe side-effects detected.'} />
              </div>
            </div>

            <div
              className="phantom-card"
              style={{ padding: '16px', borderLeft: '4px solid var(--toxic-green)' }}
            >
              <h3 style={{ fontSize: '0.95rem', color: 'var(--toxic-green)', marginBottom: '8px' }}>
                5. Safer Inspection / Dry-Run Alternative
              </h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                <MarkdownView content={result.safer_alternative || 'This command is already safe.'} />
              </div>
            </div>
          </div>

          {/* 6. Example & 7. Environment Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {result.example && (
              <div className="phantom-card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--ghost-purple)', marginBottom: '8px' }}>
                  6. Usage Example
                </h3>
                <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                  <MarkdownView content={result.example} />
                </div>
              </div>
            )}

            <div className="phantom-card" style={{ padding: '16px', gridColumn: result.example ? 'auto' : '1 / -1' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--muted-gray)', marginBottom: '8px' }}>
                7. Platform & Environment Notes
              </h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                <MarkdownView content={result.environment_notes || 'Standard behavior across POSIX and Windows.'} />
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
          initialTitle={`Command: ${command.slice(0, 40)}`}
          entryType="command"
          languageOrSubject={result.environment || environment}
          originalPrompt={`COMMAND:\n${command}\n\nCONTEXT:\n${context}`}
          aiResponse={`PURPOSE:\n${result.purpose}\n\nRISKS (${result.risk_level}):\n${result.risks}\n\nALTERNATIVE:\n${result.safer_alternative || 'None'}`}
          defaultTags={`command, ${result.environment || 'shell'}, oracle`}
        />
      )}
    </div>
  );
}
