import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-toxic" />;
      case 'error':
        return <AlertCircle size={16} className="text-error" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-orange" />;
      case 'info':
      default:
        return <Info size={16} className="text-cyan" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'var(--toxic-green)';
      case 'error': return 'var(--error-red)';
      case 'warning': return 'var(--pumpkin-orange)';
      case 'info':
      default: return 'var(--ghost-purple)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: 'var(--bg-charcoal)',
            border: `1px solid ${getBorderColor(t.type)}`,
            borderLeft: `4px solid ${getBorderColor(t.type)}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            pointerEvents: 'auto',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ marginTop: '2px', flexShrink: 0 }}>
            {getIcon(t.type)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {t.title && (
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--moonlight-white)' }}>
                {t.title}
              </div>
            )}
            <div style={{ fontSize: '0.82rem', color: 'var(--muted-gray)', marginTop: t.title ? '2px' : 0, wordBreak: 'break-word' }}>
              {t.message}
            </div>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted-gray)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
