import React from 'react';
import { useApp } from '../context/AppContext';
import GhostMascot from './GhostMascot';
import StatusPill from './StatusPill';
import { Menu } from 'lucide-react';

export default function Navbar() {
  const { setMobileMenuOpen } = useApp();

  return (
    <header
      className="mobile-header"
      style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-charcoal)',
        borderBottom: '1px solid var(--border-card)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--moonlight-white)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GhostMascot size={26} mood="happy" />
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--moonlight-white)' }}>
            Phantom<span style={{ color: 'var(--ghost-purple)' }}>Shell</span>
          </span>
        </div>
      </div>

      <div>
        <StatusPill compact />
      </div>

      <style>{`
        @media (max-width: 840px) {
          .mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
