import React from 'react';

/**
 * GhostMascot Component
 * Strictly obeys size constraints:
 * - sidebar: 28-36px
 * - dashboard-welcome: 60-90px
 * - feature-card: 32-48px
 * - empty-state: 64-96px
 * - status: 16-24px
 */
export default function GhostMascot({
  size = 32,
  mood = 'default',
  className = '',
  animated = true,
  glow = true
}) {
  // Cap max size strictly to avoid any oversized image violation
  const safeSize = Math.min(Math.max(size, 16), 96);

  // Eye and expression styles based on mood
  const renderEyes = () => {
    switch (mood) {
      case 'exorcist':
      case 'angry':
        return (
          <>
            <polygon points="12,14 17,17 12,17" fill="#FF5D73" />
            <polygon points="28,14 23,17 28,17" fill="#FF5D73" />
            <circle cx="15" cy="16" r="1.5" fill="#FFFFFF" />
            <circle cx="25" cy="16" r="1.5" fill="#FFFFFF" />
          </>
        );
      case 'oracle':
      case 'wise':
        return (
          <>
            <circle cx="14" cy="15" r="3.2" fill="#65E7FF" />
            <circle cx="26" cy="15" r="3.2" fill="#65E7FF" />
            <circle cx="14" cy="15" r="1.4" fill="#08090F" />
            <circle cx="26" cy="15" r="1.4" fill="#08090F" />
            <circle cx="15.2" cy="14" r="0.8" fill="#FFFFFF" />
            <circle cx="27.2" cy="14" r="0.8" fill="#FFFFFF" />
          </>
        );
      case 'crypt':
      case 'sassy':
        return (
          <>
            <path d="M11 16 Q14 13 17 16" stroke="#B8FF5C" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="26" cy="15" r="2.5" fill="#B8FF5C" />
            <circle cx="26.8" cy="14.4" r="0.9" fill="#FFFFFF" />
          </>
        );
      case 'sleeping':
      case 'missing':
        return (
          <>
            <path d="M12 16 Q14 18 16 16" stroke="#9292A7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M24 16 Q26 18 28 16" stroke="#9292A7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        );
      case 'happy':
      default:
        return (
          <>
            <ellipse cx="14" cy="15" rx="2.5" ry="3" fill="#A970FF" />
            <ellipse cx="26" cy="15" rx="2.5" ry="3" fill="#A970FF" />
            <circle cx="15" cy="14.2" r="1" fill="#FFFFFF" />
            <circle cx="27" cy="14.2" r="1" fill="#FFFFFF" />
            {/* Tiny cute smile */}
            <path d="M18 18 Q20 20 22 18" stroke="#F2F0FA" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          </>
        );
    }
  };

  const getAuraColor = () => {
    switch (mood) {
      case 'exorcist': return '#FF5D73';
      case 'oracle': return '#65E7FF';
      case 'crypt': return '#B8FF5C';
      case 'missing': return '#9292A7';
      default: return '#A970FF';
    }
  };

  const auraColor = getAuraColor();

  return (
    <div
      className={`ghost-mascot-wrapper ${animated ? 'animate-float' : ''} ${className}`}
      style={{
        width: `${safeSize}px`,
        height: `${safeSize}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-label="PhantomShell Ghost Mascot"
    >
      <svg
        width={safeSize}
        height={safeSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: glow ? `drop-shadow(0 0 ${safeSize > 40 ? '8px' : '4px'} ${auraColor}66)` : 'none',
          overflow: 'visible'
        }}
      >
        <defs>
          <linearGradient id={`ghostGrad-${mood}`} x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8F7FF" />
            <stop offset="0.6" stopColor="#E5DEFF" />
            <stop offset="1" stopColor={auraColor} stopOpacity="0.85" />
          </linearGradient>
          <filter id={`spectralGlow-${mood}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ghost Body */}
        <path
          d="M20 5
             C12 5 7 11 7 19
             C7 26 8 33 8 35
             C10 33 13 32 15 35
             C17 33 20 32 22 35
             C24 33 27 32 29 35
             C31 33 33 35 33 35
             C33 33 33 26 33 19
             C33 11 28 5 20 5 Z"
          fill={`url(#ghostGrad-${mood})`}
          stroke={auraColor}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Cute blush cheeks */}
        <ellipse cx="11.5" cy="18" rx="2" ry="1.2" fill={auraColor} opacity="0.35" />
        <ellipse cx="28.5" cy="18" rx="2" ry="1.2" fill={auraColor} opacity="0.35" />

        {/* Eyes & Expression */}
        {renderEyes()}

        {/* Small Terminal symbol badge on chest if larger than 32px */}
        {safeSize >= 36 && (
          <path
            d="M17 24 L19 25.5 L17 27 M21 27 L23 27"
            stroke={auraColor}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
        )}
      </svg>
    </div>
  );
}
