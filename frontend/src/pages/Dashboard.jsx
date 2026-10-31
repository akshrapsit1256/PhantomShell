import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GhostMascot from '../components/GhostMascot';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Terminal,
  Flame,
  Cpu,
  Code2,
  RefreshCw,
  ArrowRight,
  Database,
  Server,
  Sparkles,
  BookOpen,
  Calendar,
  Tag
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { health, refreshHealth, isHealthLoading } = useApp();
  const [recentEntries, setRecentEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.listJournal({ limit: 4 })
      .then((data) => {
        if (isMounted) setRecentEntries(data.entries || []);
      })
      .catch(() => {
        if (isMounted) setRecentEntries([]);
      })
      .finally(() => {
        if (isMounted) setLoadingEntries(false);
      });
    return () => { isMounted = false; };
  }, []);

  const featureCards = [
    {
      title: 'Haunted Terminal',
      description: 'Ask the ghost about programming and Computer Science.',
      path: '/terminal',
      icon: Terminal,
      color: 'var(--ghost-purple)',
      accentBorder: 'rgba(169, 112, 255, 0.35)',
      mood: 'happy'
    },
    {
      title: 'Error Exorcist',
      description: 'Investigate errors and discover possible fixes.',
      path: '/errors',
      icon: Flame,
      color: 'var(--error-red)',
      accentBorder: 'rgba(255, 93, 115, 0.35)',
      mood: 'exorcist'
    },
    {
      title: 'Command Oracle',
      description: 'Understand commands before you run them.',
      path: '/commands',
      icon: Cpu,
      color: 'var(--spectral-cyan)',
      accentBorder: 'rgba(101, 231, 255, 0.35)',
      mood: 'oracle'
    },
    {
      title: 'Code Crypt',
      description: 'Explore code, analyze algorithms, and discover edge cases.',
      path: '/code-crypt',
      icon: Code2,
      color: 'var(--toxic-green)',
      accentBorder: 'rgba(184, 255, 92, 0.35)',
      mood: 'crypt'
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Compact Welcome Section - Small 72px Mascot */}
      <section
        className="phantom-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(33, 21, 47, 0.6) 0%, rgba(17, 18, 27, 0.85) 100%)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span className="pill pill-ghost" style={{ fontSize: '0.72rem' }}>
              <Sparkles size={11} /> Universal AI Developer Companion
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Welcome to the Haunted Lab
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: 'var(--muted-gray)' }}>
            Every bug leaves a trace. Every mystery has an explanation.
          </p>
        </div>

        {/* Mascot strictly 72px (within 60-90px limit) */}
        <div style={{ flexShrink: 0 }}>
          <GhostMascot size={72} mood="happy" />
        </div>
      </section>

      {/* Four Main Feature Cards - Compact Grid for Laptop Displays */}
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}
        >
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.path}
                className="phantom-card phantom-card-interactive"
                onClick={() => navigate(card.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  padding: '18px 20px',
                  borderTop: `3px solid ${card.color}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${card.accentBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    {/* Small Decorative Mascot 34px */}
                    <GhostMascot size={34} mood={card.mood} animated={false} glow={false} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', color: 'var(--moonlight-white)' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--muted-gray)', margin: 0, lineHeight: 1.45 }}>
                    {card.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: card.color,
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <span>Open Chamber</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Status Dashboard Section */}
      <section className="phantom-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} className="text-cyan" />
            <span>Haunted Infrastructure Status</span>
          </h2>
          <button
            onClick={refreshHealth}
            disabled={isHealthLoading}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={13} className={isHealthLoading ? 'animate-spin' : ''} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}
        >
          {/* Backend Status */}
          <div style={{ background: 'var(--bg-charcoal)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              FastAPI Backend
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: health.backend_status === 'Running' ? 'var(--toxic-green)' : 'var(--error-red)',
                  boxShadow: health.backend_status === 'Running' ? '0 0 8px var(--toxic-green)' : 'none'
                }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{health.backend_status}</span>
            </div>
          </div>

          {/* Ollama Status */}
          <div style={{ background: 'var(--bg-charcoal)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Local AI Ghost
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: health.ollama_connected ? 'var(--toxic-green)' : 'var(--error-red)',
                  boxShadow: health.ollama_connected ? '0 0 8px var(--toxic-green)' : 'none'
                }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{health.ollama_status}</span>
            </div>
          </div>

          {/* Model Status */}
          <div style={{ background: 'var(--bg-charcoal)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Configured Model
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <span className="text-mono" style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--spectral-cyan)' }}>
                {health.configured_model}
              </span>
              <span className={`pill ${health.model_available ? 'pill-toxic' : 'pill-error'}`} style={{ fontSize: '0.68rem' }}>
                {health.model_available ? 'Ready' : 'Not Loaded'}
              </span>
            </div>
          </div>

          {/* Database Status */}
          <div style={{ background: 'var(--bg-charcoal)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SQLite Session Journal
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <Database size={15} className="text-ghost" />
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{health.database_status}</span>
            </div>
          </div>
        </div>

        {health.troubleshooting_guidance && (
          <div
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 138, 54, 0.1)',
              border: '1px solid rgba(255, 138, 54, 0.25)',
              fontSize: '0.82rem',
              color: 'var(--pumpkin-orange)'
            }}
          >
            <strong>Note:</strong> {health.troubleshooting_guidance}
          </div>
        )}
      </section>

      {/* Recent Activity Section */}
      <section className="phantom-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} className="text-ghost" />
            <span>Recent Journal Inscriptions</span>
          </h2>
          {recentEntries.length > 0 && (
            <button
              onClick={() => navigate('/journal')}
              className="btn btn-ghost btn-sm"
            >
              <span>View All Entries</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {loadingEntries ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-gray)', fontSize: '0.88rem' }}>
            Consulting SQLite archives...
          </div>
        ) : recentEntries.length === 0 ? (
          /* Empty state with strictly 72px mascot (within 64-96px limit) */
          <div
            style={{
              padding: '28px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <GhostMascot size={72} mood="sleeping" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--moonlight-white)' }}>
                No Inscribed Journal Entries Yet
              </div>
              <p style={{ fontSize: '0.84rem', margin: '4px 0 14px', maxWidth: '420px', color: 'var(--muted-gray)' }}>
                Ask questions in Haunted Terminal, exorcise errors, or analyze algorithms. You can preserve key insights into your local SQLite history.
              </p>
              <button onClick={() => navigate('/terminal')} className="btn btn-primary btn-sm">
                <Terminal size={14} />
                <span>Begin First Summoning</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => navigate('/journal')}
                style={{
                  background: 'var(--bg-charcoal)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="phantom-card-interactive"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="pill pill-ghost" style={{ fontSize: '0.7rem' }}>
                    {entry.entry_type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-gray)' }}>
                    {entry.language_or_subject}
                  </span>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: 'var(--moonlight-white)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {entry.title}
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--muted-gray)',
                    marginTop: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {entry.original_prompt}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
