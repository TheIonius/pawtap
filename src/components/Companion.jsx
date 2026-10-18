import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

/**
 * Companion animations (Cat, Coffee, Plant).
 * Reacts to live typing speed, streaks, typing activity, and errors.
 */
export function Companion({
  type = 'cat',
  accessory = 'none',
  isTyping = false,
  status = 'idle',
  wpm = 0,
  streak = 0,
  hasError = false,
  isFinished = false,
  themeAccent = '#D4A373',
  profile = null
}) {
  const [purrHeart, setPurrHeart] = useState(false);

  // Trigger pet animation
  const handlePet = () => {
    setPurrHeart(true);
    setTimeout(() => setPurrHeart(false), 1200);
  };

  if (type === 'none') return null;

  const isFast = wpm >= 70 || streak >= 25;
  const companionName = type === 'cat' ? 'Mochi' : type === 'coffee' ? 'Latte' : 'Sprout';
  const petTooltip = profile?.name?.trim()
    ? `Click to pet ${companionName} (loved by ${profile.name.trim()})!`
    : `Click to pet ${companionName}!`;

  return (
    <div
      onClick={handlePet}
      title={petTooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative'
      }}
      className="companion-container"
    >
      {/* Pet heart animation */}
      {purrHeart && (
        <div
          style={{
            position: 'absolute',
            top: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'floatUp 1.2s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <Heart size={16} fill="var(--accent)" color="var(--accent)" />
        </div>
      )}

      {type === 'cat' && (
        <CatCompanion
          accessory={accessory}
          isTyping={isTyping}
          status={status}
          isFast={isFast}
          hasError={hasError}
          isFinished={isFinished}
          streak={streak}
          themeAccent={themeAccent}
        />
      )}

      {type === 'coffee' && (
        <CoffeeCompanion
          accessory={accessory}
          isTyping={isTyping}
          isFast={isFast}
          themeAccent={themeAccent}
        />
      )}

      {type === 'plant' && (
        <PlantCompanion
          accessory={accessory}
          streak={streak}
          themeAccent={themeAccent}
        />
      )}
    </div>
  );
}

function CatAccessory({ accessory, themeAccent }) {
  if (!accessory || accessory === 'none') return null;

  if (accessory === 'ribbon') {
    return (
      <g transform="translate(18, 14)">
        <path d="M-1 -1 C-5 -4 -6 2 -2 2 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="0.8" />
        <path d="M1 -1 C5 -4 6 2 2 2 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="1.8" fill="#FBCFE8" stroke="#DB2777" strokeWidth="0.8" />
        <path d="M-1 2 L-3 6 M1 2 L3 6" stroke="#DB2777" strokeWidth="0.9" strokeLinecap="round" />
      </g>
    );
  }

  if (accessory === 'glasses') {
    return (
      <g>
        <circle cx="24" cy="24" r="5" fill="rgba(255, 255, 255, 0.22)" stroke="#475569" strokeWidth="1.2" />
        <circle cx="40" cy="24" r="5" fill="rgba(255, 255, 255, 0.22)" stroke="#475569" strokeWidth="1.2" />
        <path d="M29 23 Q32 21 35 23" stroke="#475569" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M19 23 L14 21 M45 23 L50 21" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M22 22 L24 22 M38 22 L40 22" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
      </g>
    );
  }

  if (accessory === 'top_hat') {
    return (
      <g transform="translate(32, 6)">
        <ellipse cx="0" cy="3" rx="10" ry="2.2" fill="#292524" stroke="#1C1917" strokeWidth="0.8" />
        <rect x="-6" y="-10" width="12" height="13" rx="1.5" fill="#292524" stroke="#1C1917" strokeWidth="0.8" />
        <rect x="-6" y="0" width="12" height="2.5" fill={themeAccent} />
      </g>
    );
  }

  if (accessory === 'crown') {
    return (
      <g transform="translate(32, 7)">
        <path d="M-8 2 L-10 -7 L-4 -3 L0 -9 L4 -3 L10 -7 L8 2 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.9" />
        <rect x="-8" y="1" width="16" height="2" rx="0.5" fill="#F59E0B" />
        <circle cx="0" cy="2" r="0.9" fill="#EF4444" />
        <circle cx="-5" cy="2" r="0.8" fill="#3B82F6" />
        <circle cx="5" cy="2" r="0.8" fill="#10B981" />
        <circle cx="-10" cy="-7" r="1" fill="#FEF08A" />
        <circle cx="0" cy="-9" r="1.2" fill="#FEF08A" />
        <circle cx="10" cy="-7" r="1" fill="#FEF08A" />
      </g>
    );
  }

  if (accessory === 'coffee_mug') {
    return (
      <g transform="translate(48, 36)">
        <rect x="0" y="3" width="7" height="9" rx="1.5" fill="var(--surface-hover, #E8DFD3)" stroke="var(--text-sub, #A89988)" strokeWidth="0.8" />
        <path d="M7 5 C9 5 9 8 7 8" stroke="var(--text-sub, #A89988)" strokeWidth="0.8" fill="none" />
        <circle cx="3.5" cy="7.5" r="1.2" fill={themeAccent} />
        <path d="M2 1 Q3 -1 2 -3 M5 1 Q6 -1 5 -3" stroke="var(--text-sub, #A89988)" strokeWidth="0.6" strokeLinecap="round" fill="none" opacity="0.7" />
      </g>
    );
  }

  return null;
}

function CoffeeAccessory({ accessory, themeAccent }) {
  if (!accessory || accessory === 'none') return null;
  if (accessory === 'glasses') {
    return (
      <g transform="translate(0, 3)">
        <circle cx="16" cy="20" r="3.5" fill="rgba(255,255,255,0.2)" stroke="#475569" strokeWidth="1" />
        <circle cx="24" cy="20" r="3.5" fill="rgba(255,255,255,0.2)" stroke="#475569" strokeWidth="1" />
        <path d="M19.5 20 L20.5 20" stroke="#475569" strokeWidth="1" />
      </g>
    );
  }
  if (accessory === 'top_hat') {
    return (
      <g transform="translate(20, 11)">
        <ellipse cx="0" cy="2" rx="7" ry="1.6" fill="#292524" />
        <rect x="-4" y="-7" width="8" height="9" rx="1" fill="#292524" />
        <rect x="-4" y="0" width="8" height="1.8" fill={themeAccent} />
      </g>
    );
  }
  if (accessory === 'crown') {
    return (
      <g transform="translate(20, 11)">
        <path d="M-6 2 L-7 -4 L-3 -2 L0 -6 L3 -2 L7 -4 L6 2 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
      </g>
    );
  }
  if (accessory === 'ribbon') {
    return (
      <g transform="translate(34, 18)">
        <circle cx="0" cy="0" r="2" fill="#F472B6" />
        <path d="M-2 -2 L2 2 M-2 2 L2 -2" stroke="#DB2777" strokeWidth="0.8" />
      </g>
    );
  }
  return null;
}

function PlantAccessory({ accessory, themeAccent }) {
  if (!accessory || accessory === 'none') return null;
  if (accessory === 'glasses') {
    return (
      <g transform="translate(0, 10)">
        <circle cx="16" cy="20" r="3.2" fill="rgba(255,255,255,0.2)" stroke="#475569" strokeWidth="1" />
        <circle cx="24" cy="20" r="3.2" fill="rgba(255,255,255,0.2)" stroke="#475569" strokeWidth="1" />
        <path d="M19.2 20 L20.8 20" stroke="#475569" strokeWidth="1" />
      </g>
    );
  }
  if (accessory === 'crown') {
    return (
      <g transform="translate(20, 8)">
        <path d="M-5 2 L-6 -3 L-2.5 -1.5 L0 -5 L2.5 -1.5 L6 -3 L5 2 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.7" />
      </g>
    );
  }
  if (accessory === 'top_hat') {
    return (
      <g transform="translate(20, 8)">
        <ellipse cx="0" cy="2" rx="6" ry="1.5" fill="#292524" />
        <rect x="-3.5" y="-6" width="7" height="8" rx="1" fill="#292524" />
        <rect x="-3.5" y="0" width="7" height="1.6" fill={themeAccent} />
      </g>
    );
  }
  if (accessory === 'ribbon') {
    return (
      <g transform="translate(20, 23)">
        <circle cx="0" cy="0" r="1.8" fill="#F472B6" />
        <path d="M-2 -1.5 L2 1.5 M-2 1.5 L2 -1.5" stroke="#DB2777" strokeWidth="0.8" />
      </g>
    );
  }
  return null;
}

function CatCompanion({ accessory = 'none', isTyping, status, isFast, hasError, isFinished, streak, themeAccent }) {
  const isRunning = status === 'running';
  const [pawToggle, setPawToggle] = useState(false);

  // Animate paws during active typing
  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => {
      setPawToggle(prev => !prev);
    }, isFast ? 80 : 130);
    return () => clearInterval(interval);
  }, [isTyping, isFast]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg
        width="64"
        height="52"
        viewBox="0 0 64 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          overflow: 'visible',
          animation: status === 'idle' ? 'cozyBreathing 3s ease-in-out infinite' : undefined
        }}
      >
        {/* Cat ears */}
        <polygon points="12,18 20,4 28,18" fill="var(--surface-hover, #E8DFD3)" stroke="var(--text-sub, #A89988)" strokeWidth="1.5" />
        <polygon points="16,16 20,8 24,16" fill="#F4B8C1" />
        
        <polygon points="36,18 44,4 52,18" fill="var(--surface-hover, #E8DFD3)" stroke="var(--text-sub, #A89988)" strokeWidth="1.5" />
        <polygon points="40,16 44,8 48,16" fill="#F4B8C1" />

        {/* Cat head */}
        <circle cx="32" cy="26" r="18" fill="var(--surface, #F3EDE2)" stroke="var(--text-sub, #A89988)" strokeWidth="1.8" />

        {/* Cheeks */}
        {(isTyping || isFast || isRunning) && (
          <>
            <circle cx="21" cy="29" r="3.2" fill="#F4B8C1" opacity="0.8" />
            <circle cx="43" cy="29" r="3.2" fill="#F4B8C1" opacity="0.8" />
          </>
        )}

        {/* Eye states */}
        {status === 'idle' && !isFinished && (
          <>
            {/* Idle eyes */}
            <path d="M21 24 Q24 28 27 24" stroke="var(--text-main, #3E342B)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M37 24 Q40 28 43 24" stroke="var(--text-main, #3E342B)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        )}

        {isRunning && !hasError && !isFast && (
          <>
            {/* Active eyes */}
            <circle cx="24" cy="24" r="2.5" fill="var(--text-main, #3E342B)" />
            <circle cx="40" cy="24" r="2.5" fill="var(--text-main, #3E342B)" />
            <circle cx="25" cy="23" r="0.8" fill="#FFFFFF" />
            <circle cx="41" cy="23" r="0.8" fill="#FFFFFF" />
          </>
        )}

        {isFast && (
          <>
            {/* Fast eyes */}
            <path d="M22 24 L26 24 M24 22 L24 26" stroke={themeAccent} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M38 24 L42 24 M40 22 L40 26" stroke={themeAccent} strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}

        {hasError && (
          <>
            {/* Error eyes */}
            <circle cx="24" cy="24" r="2.8" fill="none" stroke="var(--text-error, #C85A54)" strokeWidth="1.6" />
            <circle cx="40" cy="24" r="2.8" fill="none" stroke="var(--text-error, #C85A54)" strokeWidth="1.6" />
            {/* Error indicator */}
            <path d="M50 14 Q53 10 52 8 Q51 10 50 14" fill="#93C5FD" />
          </>
        )}

        {isFinished && (
          <>
            {/* Finished eyes */}
            <path d="M21 25 Q24 21 27 25" stroke="var(--text-main, #3E342B)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M37 25 Q40 21 43 25" stroke="var(--text-main, #3E342B)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Nose & mouth */}
        <polygon points="31,27 33,27 32,29" fill="#E28491" />
        <path d="M29 30 Q32 32 32 29 Q32 32 35 30" stroke="var(--text-main, #3E342B)" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Mini laptop */}
        {(isRunning || isTyping) && (
          <g transform="translate(18, 36)">
            {/* Laptop base */}
            <rect x="0" y="8" width="28" height="5" rx="1.5" fill="#C5BAA8" />
            {/* Laptop screen */}
            <rect x="3" y="0" width="22" height="9" rx="1" fill="#D6CDC0" stroke="#B8AC98" strokeWidth="0.8" />
            <circle cx="14" cy="4.5" r="1.5" fill={themeAccent} />
            {/* Paws */}
            <circle
              cx={isTyping ? (pawToggle ? "6" : "8") : "7"}
              cy={isTyping ? (pawToggle ? "6" : "9") : "8"}
              r="3"
              fill="var(--surface, #F3EDE2)"
              stroke="var(--text-sub, #A89988)"
              strokeWidth="1"
            />
            <circle
              cx={isTyping ? (!pawToggle ? "22" : "20") : "21"}
              cy={isTyping ? (!pawToggle ? "6" : "9") : "8"}
              r="3"
              fill="var(--surface, #F3EDE2)"
              stroke="var(--text-sub, #A89988)"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Unlockable Accessory Overlay */}
        <CatAccessory accessory={accessory} themeAccent={themeAccent} />

        {/* Idle indicator */}
        {status === 'idle' && !isFinished && (
          <g opacity="0.6">
            <text x="50" y="12" fill="var(--text-sub, #A89988)" fontSize="9" fontFamily="sans-serif" fontWeight="bold">z</text>
            <text x="55" y="7" fill="var(--text-sub, #A89988)" fontSize="7" fontFamily="sans-serif">z</text>
          </g>
        )}
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
          {isFinished
            ? 'Mochi is proud!'
            : isFast
            ? 'Mochi is flying!'
            : isTyping
            ? 'Mochi typing...'
            : isRunning
            ? 'Mochi waiting for you'
            : 'Mochi napping'}
        </span>
        <span style={{ fontSize: '9.5px', color: 'var(--text-sub)' }}>
          {streak > 5 ? `${streak} streak` : 'click to pet'}
        </span>
      </div>
    </div>
  );
}

function CoffeeCompanion({ accessory = 'none', isTyping, isFast, themeAccent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
        {/* Steam */}
        {isTyping && (
          <g opacity="0.75" style={{ animation: isFast ? 'steamFast 0.8s infinite' : 'steamSlow 1.6s infinite' }}>
            <path d="M16 10 Q14 6 17 2" stroke={themeAccent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M22 10 Q24 6 21 2" stroke={themeAccent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Mug body */}
        <rect x="10" y="13" width="20" height="20" rx="4" fill="var(--surface, #F3EDE2)" stroke="var(--text-sub, #A89988)" strokeWidth="1.8" />
        
        {/* Mug handle */}
        <path d="M30 17 Q37 17 37 23 Q37 29 30 29" stroke="var(--text-sub, #A89988)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        
        {/* Latte top */}
        <ellipse cx="20" cy="14" rx="9" ry="2.5" fill="#784F35" />
        <path d="M18 14 Q20 12.5 22 14 Q20 15.5 18 14" fill="#FDF7EE" />

        {/* Accessory Overlay */}
        <CoffeeAccessory accessory={accessory} themeAccent={themeAccent} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
          {isFast ? 'Extra Steamy' : isTyping ? 'Brewing...' : 'Cozy Latte'}
        </span>
        <span style={{ fontSize: '9.5px', color: 'var(--text-sub)' }}>warm comfort</span>
      </div>
    </div>
  );
}

function PlantCompanion({ accessory = 'none', streak, themeAccent }) {
  const leaves = streak > 40 ? 5 : streak > 20 ? 3 : 2;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        {/* Plant pot */}
        <polygon points="12,24 28,24 25,36 15,36" fill="#C87A5B" stroke="var(--text-sub, #A89988)" strokeWidth="1.4" />
        <rect x="10" y="22" width="20" height="3" rx="1.5" fill="#B36547" />

        {/* Stem */}
        <path d="M20 22 Q20 14 20 10" stroke="#5E8E68" strokeWidth="2" strokeLinecap="round" />

        {/* Leaves */}
        <path d="M20 18 Q14 14 13 18 Q16 20 20 18" fill="#78A682" />
        <path d="M20 15 Q26 11 27 15 Q24 17 20 15" fill="#78A682" />
        {leaves >= 3 && <path d="M20 12 Q13 8 15 12" fill="#8BB995" />}
        {leaves >= 5 && <circle cx="20" cy="9" r="2.5" fill={themeAccent} />}

        {/* Accessory Overlay */}
        <PlantAccessory accessory={accessory} themeAccent={themeAccent} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
          {leaves >= 5 ? 'Flowering' : 'Sprouting'}
        </span>
        <span style={{ fontSize: '9.5px', color: 'var(--text-sub)' }}>grows with speed</span>
      </div>
    </div>
  );
}
