import React from 'react';
import { NavLink } from 'react-router-dom';
import GhostMascot from './GhostMascot';
import StatusPill from './StatusPill';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Terminal,
  Flame,
  Cpu,
  BookOpen,
  Settings as SettingsIcon,
  HelpCircle,
  Code2,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/terminal', label: 'Haunted Terminal', icon: Terminal },
  { path: '/errors', label: 'Error Exorcist', icon: Flame },
  { path: '/commands', label: 'Command Oracle', icon: Cpu },
  { path: '/code-crypt', label: 'Code Crypt', icon: Code2 },
  { path: '/journal', label: 'Session Journal', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
  { path: '/about', label: 'About', icon: HelpCircle },
];

export default function Sidebar() {
  const { mobileMenuOpen, setMobileMenuOpen } = useApp();

  const handleLinkClick = () => {
    if (window.innerWidth <= 840) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(8, 9, 15, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 90
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`phantom-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          backgroundColor: 'var(--bg-charcoal)',
          borderRight: '1px solid var(--border-card)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform 0.25s ease',
          flexShrink: 0
        }}
      >
        {/* Brand / Logo Top */}
        <div
          style={{
            padding: '18px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-card)'
          }}
        >
          <NavLink
            to="/"
            onClick={handleLinkClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'var(--moonlight-white)'
            }}
          >
            {/* Mascot strictly 32px */}
            <GhostMascot size={32} mood="happy" />
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.08rem',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Phantom</span>
                <span style={{ color: 'var(--ghost-purple)' }}>Shell</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted-gray)', letterSpacing: '0.02em' }}>
                AI Terminal Ghost
              </div>
            </div>
          </NavLink>

          <button
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--muted-gray)',
              cursor: 'pointer',
              padding: '4px'
            }}
            aria-label="Close navigation drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--moonlight-white)' : 'var(--muted-gray)',
                  backgroundColor: isActive ? 'rgba(169, 112, 255, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(169, 112, 255, 0.3)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 12px rgba(169, 112, 255, 0.12)' : 'none',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Ollama & Model Status */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid var(--border-card)' }}>
          <StatusPill />
        </div>
      </aside>

      <style>{`
        @media (max-width: 840px) {
          .phantom-sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.8);
          }
          .phantom-sidebar.mobile-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
