import React from 'react';
import { useApp } from '../context/AppContext';
import { RefreshCw, CheckCircle2, AlertCircle, AlertTriangle, Radio } from 'lucide-react';

export default function StatusPill({ compact = false }) {
  const { health, refreshHealth, isHealthLoading } = useApp();

  const getStatusConfig = () => {
    const status = health.ollama_status;
    if (status === 'Ghost Awake' || (health.ollama_connected && health.model_available)) {
      return {
        label: 'Ghost Awake',
        type: 'toxic',
        color: 'var(--toxic-green)',
        bg: 'rgba(184, 255, 92, 0.12)',
        border: 'rgba(184, 255, 92, 0.28)',
        dotColor: '#B8FF5C',
        icon: CheckCircle2,
        tooltip: `Connected to Ollama at ${health.ollama_url}. Model ${health.configured_model} is ready.`
      };
    }
    if (status === 'Model Missing' || (health.ollama_connected && !health.model_available)) {
      return {
        label: 'Model Missing',
        type: 'orange',
        color: 'var(--pumpkin-orange)',
        bg: 'rgba(255, 138, 54, 0.12)',
        border: 'rgba(255, 138, 54, 0.28)',
        dotColor: '#FF8A36',
        icon: AlertTriangle,
        tooltip: `Ollama is running, but '${health.configured_model}' is not installed.`
      };
    }
    if (status === 'Summoning') {
      return {
        label: 'Summoning...',
        type: 'ghost',
        color: 'var(--ghost-purple)',
        bg: 'rgba(169, 112, 255, 0.12)',
        border: 'rgba(169, 112, 255, 0.28)',
        dotColor: '#A970FF',
        icon: Radio,
        tooltip: 'Communicating with local AI model...'
      };
    }
    // Ghost Missing
    return {
      label: 'Ghost Missing',
      type: 'error',
      color: 'var(--error-red)',
      bg: 'rgba(255, 93, 115, 0.12)',
      border: 'rgba(255, 93, 115, 0.28)',
      dotColor: '#FF5D73',
      icon: AlertCircle,
      tooltip: health.error_message || 'Ollama is offline. Start Ollama in terminal with `ollama serve`.'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (compact) {
    return (
      <div
        className="status-pill-compact"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: 'var(--radius-full)',
          padding: '3px 8px',
          fontSize: '0.74rem',
          fontWeight: 600,
          color: config.color,
          cursor: 'pointer'
        }}
        onClick={refreshHealth}
        title={`${config.label}: ${config.tooltip} (Click to refresh)`}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.dotColor,
            boxShadow: `0 0 6px ${config.dotColor}`,
            display: 'inline-block'
          }}
        />
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-charcoal)',
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '0.82rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: config.dotColor,
              boxShadow: `0 0 8px ${config.dotColor}`,
              display: 'inline-block',
              flexShrink: 0
            }}
          />
          <span style={{ fontWeight: 700, color: config.color }}>{config.label}</span>
        </div>
        <button
          onClick={refreshHealth}
          disabled={isHealthLoading}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted-gray)',
            cursor: isHealthLoading ? 'wait' : 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}
          title="Refresh Ollama status"
          aria-label="Refresh Ollama status"
        >
          <RefreshCw size={13} className={isHealthLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--muted-gray)' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
          Model: <span className="text-mono" style={{ color: 'var(--moonlight-white)' }}>{health.configured_model}</span>
        </span>
        <span style={{ fontSize: '0.7rem', color: health.model_available ? 'var(--toxic-green)' : 'var(--muted-gray)' }}>
          {health.model_available ? 'Loaded' : 'Unchecked'}
        </span>
      </div>
    </div>
  );
}
