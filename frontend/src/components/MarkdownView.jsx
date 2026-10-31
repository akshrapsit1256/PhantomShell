import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: '12px 0',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-card)',
        background: 'var(--bg-terminal)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.75rem',
          color: 'var(--muted-gray)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
          <Terminal size={12} className="text-ghost" />
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'transparent',
            border: 'none',
            color: copied ? 'var(--toxic-green)' : 'var(--muted-gray)',
            cursor: 'pointer',
            fontSize: '0.73rem',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
          title="Copy code snippet"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre
        style={{
          padding: '14px',
          margin: 0,
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.86rem',
          lineHeight: '1.5',
          color: '#E5E4EE'
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownView({ content, className = '' }) {
  if (!content) return null;

  // Split content by code blocks ```lang ... ```
  const parts = [];
  const regex = /```([a-zA-Z0-9_\-\+\#]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      value: match[2].trimEnd()
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex)
    });
  }

  const renderFormattedText = (text, partKey) => {
    const lines = text.split('\n');

    return (
      <div key={partKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Empty line
          if (!trimmed) {
            return <div key={idx} style={{ height: '4px' }} />;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h3
                key={idx}
                style={{
                  color: 'var(--moonlight-white)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  marginTop: '8px',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ color: 'var(--ghost-purple)' }}>#</span>
                {renderInlineStyles(trimmed.slice(4))}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2
                key={idx}
                style={{
                  color: 'var(--moonlight-white)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  marginTop: '12px',
                  marginBottom: '4px',
                  borderBottom: '1px solid rgba(169, 112, 255, 0.15)',
                  paddingBottom: '4px'
                }}
              >
                {renderInlineStyles(trimmed.slice(3))}
              </h2>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h1
                key={idx}
                style={{
                  color: 'var(--moonlight-white)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  marginTop: '14px',
                  marginBottom: '6px'
                }}
              >
                {renderInlineStyles(trimmed.slice(2))}
              </h1>
            );
          }

          // Blockquote or Callout
          if (trimmed.startsWith('> ')) {
            return (
              <div
                key={idx}
                style={{
                  borderLeft: '3px solid var(--ghost-purple)',
                  background: 'rgba(169, 112, 255, 0.06)',
                  padding: '8px 12px',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  color: 'var(--moonlight-white)',
                  fontStyle: 'italic',
                  margin: '4px 0'
                }}
              >
                {renderInlineStyles(trimmed.slice(2))}
              </div>
            );
          }

          // Unordered list item
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  paddingLeft: '6px',
                  color: 'var(--moonlight-white)'
                }}
              >
                <span style={{ color: 'var(--ghost-purple)', marginTop: '2px', fontSize: '0.8rem' }}>•</span>
                <span style={{ flex: 1 }}>{renderInlineStyles(trimmed.slice(2))}</span>
              </div>
            );
          }

          // Ordered list item (e.g. "1. ")
          const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (orderedMatch) {
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  paddingLeft: '6px',
                  color: 'var(--moonlight-white)'
                }}
              >
                <span style={{ color: 'var(--toxic-green)', fontWeight: 600, fontSize: '0.85rem', minWidth: '18px' }}>
                  {orderedMatch[1]}.
                </span>
                <span style={{ flex: 1 }}>{renderInlineStyles(orderedMatch[2])}</span>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} style={{ color: 'var(--moonlight-white)', margin: 0, lineHeight: '1.6' }}>
              {renderInlineStyles(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for inline `code`, **bold**, *italic*
  const renderInlineStyles = (str) => {
    // Regex matches inline code `...`, bold **...**, or plain text
    const inlineParts = [];
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let curr = 0;
    let m;

    while ((m = inlineRegex.exec(str)) !== null) {
      if (m.index > curr) {
        inlineParts.push(str.slice(curr, m.index));
      }
      const token = m[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        inlineParts.push(
          <code
            key={m.index}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              padding: '2px 5px',
              fontSize: '0.85em',
              fontFamily: 'var(--font-mono)',
              color: 'var(--spectral-cyan)'
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        inlineParts.push(
          <strong key={m.index} style={{ color: 'var(--moonlight-white)', fontWeight: 700 }}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        inlineParts.push(
          <em key={m.index} style={{ color: 'var(--ghost-purple-light)' }}>
            {token.slice(1, -1)}
          </em>
        );
      }
      curr = inlineRegex.lastIndex;
    }

    if (curr < str.length) {
      inlineParts.push(str.slice(curr));
    }

    return inlineParts;
  };

  return (
    <div className={`markdown-view-container ${className}`} style={{ width: '100%', wordBreak: 'break-word' }}>
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return <CodeBlock key={pIdx} language={part.language} code={part.value} />;
        }
        return renderFormattedText(part.value, pIdx);
      })}
    </div>
  );
}
