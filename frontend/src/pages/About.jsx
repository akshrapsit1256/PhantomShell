import React from 'react';
import GhostMascot from '../components/GhostMascot';
import {
  Sparkles,
  Shield,
  Code2,
  Terminal,
  Flame,
  Cpu,
  BookOpen,
  Server,
  Layers,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export default function About() {
  return (
    <div className="page-wrapper">
      {/* Header Banner - Compact with strictly 70px Mascot */}
      <section
        className="phantom-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(33, 21, 47, 0.7) 0%, rgba(17, 18, 27, 0.9) 100%)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="pill pill-ghost" style={{ fontSize: '0.74rem' }}>
              <Sparkles size={11} /> Universal AI Developer Companion
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            PhantomShell 👻
          </h1>
          <p style={{ margin: '6px 0 2px', fontSize: '1.02rem', color: 'var(--spectral-cyan)', fontWeight: 600 }}>
            "Your terminal has a ghost. Fortunately, it knows how to debug."
          </p>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--ghost-purple-light)', fontStyle: 'italic' }}>
            "Summon answers. Exorcise errors. Master the unknown."
          </p>
        </div>

        {/* Mascot strictly 70px (within 60-90px limit) */}
        <div style={{ flexShrink: 0 }}>
          <GhostMascot size={70} mood="happy" />
        </div>
      </section>

      {/* Overview & Mission */}
      <section className="phantom-card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '10px', color: 'var(--moonlight-white)' }}>
          Product Vision
        </h2>
        <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--moonlight-white)', margin: 0 }}>
          PhantomShell is a privacy-first, local developer companion designed to live alongside your terminal. Instead of sending proprietary code or private tracebacks to external cloud services, PhantomShell connects directly to your local Ollama runtime to explain code, investigate complex errors, break down terminal flags, and analyze algorithms across dozens of programming languages.
        </p>
      </section>

      {/* Feature Capabilities Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        <div className="phantom-card" style={{ padding: '16px', borderTop: '3px solid var(--ghost-purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Terminal size={18} className="text-ghost" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Haunted Terminal</h3>
          </div>
          <p style={{ fontSize: '0.84rem', margin: 0, color: 'var(--muted-gray)' }}>
            Dynamic conversation with customizable ghost personalities across 25+ programming languages and 20+ computer science disciplines.
          </p>
        </div>

        <div className="phantom-card" style={{ padding: '16px', borderTop: '3px solid var(--error-red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Flame size={18} className="text-error" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Error Exorcist</h3>
          </div>
          <p style={{ fontSize: '0.84rem', margin: 0, color: 'var(--muted-gray)' }}>
            Rigorous 8-section diagnostic evaluation of compiler errors, stack traces, and runtime exceptions with confidence scoring.
          </p>
        </div>

        <div className="phantom-card" style={{ padding: '16px', borderTop: '3px solid var(--spectral-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={18} className="text-cyan" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Command Oracle</h3>
          </div>
          <p style={{ fontSize: '0.84rem', margin: 0, color: 'var(--muted-gray)' }}>
            Safe, non-executing breakdowns of shell flags, destructive risk identification, and dry-run alternatives for PowerShell, Bash, and Docker.
          </p>
        </div>

        <div className="phantom-card" style={{ padding: '16px', borderTop: '3px solid var(--toxic-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Code2 size={18} className="text-toxic" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Code Crypt</h3>
          </div>
          <p style={{ fontSize: '0.84rem', margin: 0, color: 'var(--muted-gray)' }}>
            Deep-dive DSA analysis, Big-O time and space complexity evaluations, unit test generation, and multi-language translations.
          </p>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="phantom-card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} className="text-cyan" />
          <span>Architecture & Technology Stack</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'var(--bg-midnight)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: 700, color: 'var(--spectral-cyan)', fontSize: '0.88rem' }}>Frontend</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--moonlight-white)', marginTop: '4px' }}>
              React 19, Vite, Lucide React, React Router
            </div>
          </div>

          <div style={{ background: 'var(--bg-midnight)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: 700, color: 'var(--ghost-purple)', fontSize: '0.88rem' }}>Backend</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--moonlight-white)', marginTop: '4px' }}>
              FastAPI, Python, Uvicorn, Pydantic
            </div>
          </div>

          <div style={{ background: 'var(--bg-midnight)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: 700, color: 'var(--toxic-green)', fontSize: '0.88rem' }}>Database</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--moonlight-white)', marginTop: '4px' }}>
              SQLite (Zero external server needed)
            </div>
          </div>

          <div style={{ background: 'var(--bg-midnight)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: 700, color: 'var(--pumpkin-orange)', fontSize: '0.88rem' }}>Local AI Runtime</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--moonlight-white)', marginTop: '4px' }}>
              Ollama API (Default: <code>gemma2:2b</code>)
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI & Known Limitations */}
      <section className="phantom-card" style={{ padding: '20px', borderLeft: '4px solid var(--pumpkin-orange)' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} className="text-orange" />
          <span>Local Model Transparency & Known Limitations</span>
        </h2>
        <div style={{ fontSize: '0.88rem', color: 'var(--moonlight-white)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.55' }}>
          <p style={{ margin: 0 }}>
            PhantomShell leverages local language models such as <code>gemma2:2b</code>. Lightweight local models run efficiently on consumer hardware without internet connectivity, but their reasoning capabilities, context windows, and language nuances differ from multi-billion parameter cloud clusters.
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Local models may occasionally make reasoning errors or misinterpret unfamiliar framework versions.</li>
            <li>Always verify AI-suggested code and dry-run critical database migrations before running them in production.</li>
            <li>PhantomShell distinguishes evidence from assumptions and never fabricates executed tool output.</li>
          </ul>
        </div>
      </section>

      {/* Licensing Information */}
      <section className="phantom-card" style={{ padding: '16px 20px', fontSize: '0.84rem', color: 'var(--muted-gray)' }}>
        <strong style={{ color: 'var(--moonlight-white)' }}>License Information:</strong> This software is crafted as an open developer companion. A formal open-source license (such as MIT or Apache 2.0) must be selected and added by the repository owner before redistribution.
      </section>
    </div>
  );
}
