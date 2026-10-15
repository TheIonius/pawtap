import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

/**
 * Interactive Cozy Companions (Mochi the Cat & Steaming Latte)
 * Reacts dynamically to live typing speed, streaks, active typing bursts, and errors.
 */
export function Companion({
  type = 'cat',
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

  // Click on companion to trigger affection
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
      {/* Floating Pet Heart */}
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
          isTyping={isTyping}
          isFast={isFast}
          themeAccent={themeAccent}
        />
      )}

      {type === 'plant' && (
        <PlantCompanion
          streak={streak}
          themeAccent={themeAccent}
        />
      )}
    </div>
  );
}

function CatCompanion({ isTyping, status, isFast, hasError, isFinished, streak, themeAccent }) {
  const isRunning = status === 'running';
  const [pawToggle, setPawToggle] = useState(false);

  // Animate paws only when user is actively pressing keys!
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
        {/* Cat Ears */}
        <polygon points="12,18 20,4 28,18" fill="var(--surface-hover, #E8DFD3)" stroke="var(--text-sub, #A89988)" strokeWidth="1.5" />
        <polygon points="16,16 20,8 24,16" fill="#F4B8C1" />
        
        <polygon points="36,18 44,4 52,18" fill="var(--surface-hover, #E8DFD3)" stroke="var(--text-sub, #A89988)" strokeWidth="1.5" />
        <polygon points="40,16 44,8 48,16" fill="#F4B8C1" />

        {/* Cat Head */}
        <circle cx="32" cy="26" r="18" fill="var(--surface, #F3EDE2)" stroke="var(--text-sub, #A89988)" strokeWidth="1.8" />

        {/* Blushing Cheeks */}
        {(isTyping || isFast || isRunning) && (
          <>
            <circle cx="21" cy="29" r="3.2" fill="#F4B8C1" opacity="0.8" />
            <circle cx="43" cy="29" r="3.2" fill="#F4B8C1" opacity="0.8" />
          </>
        )}

        {/* Eyes: Sleeping (idle) vs Typing (active) vs Paused/Watching vs Sparkle */}
        {status === 'idle' && !isFinished && (
          <>
            {/* Sleeping curved eyes */}
            <path d="M21 24 Q24 28 27 24" stroke="var(--text-main, #3E342B)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M37 24 Q40 28 43 24" stroke="var(--text-main, #3E342B)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        )}

        {isRunning && !hasError && !isFast && (
          <>
            {/* Happy attentive eyes */}
            <circle cx="24" cy="24" r="2.5" fill="var(--text-main, #3E342B)" />
            <circle cx="40" cy="24" r="2.5" fill="var(--text-main, #3E342B)" />
            <circle cx="25" cy="23" r="0.8" fill="#FFFFFF" />
            <circle cx="41" cy="23" r="0.8" fill="#FFFFFF" />
          </>
        )}

        {isFast && (
          <>
            {/* Excited star/sparkle eyes */}
            <path d="M22 24 L26 24 M24 22 L24 26" stroke={themeAccent} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M38 24 L42 24 M40 22 L40 26" stroke={themeAccent} strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}

        {hasError && (
          <>
            {/* Surprised eyes */}
            <circle cx="24" cy="24" r="2.8" fill="none" stroke="var(--text-error, #C85A54)" strokeWidth="1.6" />
            <circle cx="40" cy="24" r="2.8" fill="none" stroke="var(--text-error, #C85A54)" strokeWidth="1.6" />
            {/* Sweatdrop */}
            <path d="M50 14 Q53 10 52 8 Q51 10 50 14" fill="#93C5FD" />
          </>
        )}

        {isFinished && (
          <>
            {/* Proud joy eyes */}
            <path d="M21 25 Q24 21 27 25" stroke="var(--text-main, #3E342B)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M37 25 Q40 21 43 25" stroke="var(--text-main, #3E342B)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Cute Nose & Mouth */}
        <polygon points="31,27 33,27 32,29" fill="#E28491" />
        <path d="M29 30 Q32 32 32 29 Q32 32 35 30" stroke="var(--text-main, #3E342B)" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Mini Laptop (Shown whenever test is running or typing) */}
        {(isRunning || isTyping) && (
          <g transform="translate(18, 36)">
            {/* Laptop Base */}
            <rect x="0" y="8" width="28" height="5" rx="1.5" fill="#C5BAA8" />
            {/* Laptop Screen */}
            <rect x="3" y="0" width="22" height="9" rx="1" fill="#D6CDC0" stroke="#B8AC98" strokeWidth="0.8" />
            <circle cx="14" cy="4.5" r="1.5" fill={themeAccent} />
            {/* Cute Little Paws (Alternate when typing, rest calmly when stopped) */}
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

        {/* Sleeping Zzz indicator (only when idle) */}
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

function CoffeeCompanion({ isTyping, isFast, themeAccent }) {
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

        {/* Ceramic Mug Body */}
        <rect x="10" y="13" width="20" height="20" rx="4" fill="var(--surface, #F3EDE2)" stroke="var(--text-sub, #A89988)" strokeWidth="1.8" />
        
        {/* Mug Handle */}
        <path d="M30 17 Q37 17 37 23 Q37 29 30 29" stroke="var(--text-sub, #A89988)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        
        {/* Coffee / Latte Art Top */}
        <ellipse cx="20" cy="14" rx="9" ry="2.5" fill="#784F35" />
        <path d="M18 14 Q20 12.5 22 14 Q20 15.5 18 14" fill="#FDF7EE" />
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

function PlantCompanion({ streak, themeAccent }) {
  const leaves = streak > 40 ? 5 : streak > 20 ? 3 : 2;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        {/* Terracotta Pot */}
        <polygon points="12,24 28,24 25,36 15,36" fill="#C87A5B" stroke="var(--text-sub, #A89988)" strokeWidth="1.4" />
        <rect x="10" y="22" width="20" height="3" rx="1.5" fill="#B36547" />

        {/* Stem */}
        <path d="M20 22 Q20 14 20 10" stroke="#5E8E68" strokeWidth="2" strokeLinecap="round" />

        {/* Leaves */}
        <path d="M20 18 Q14 14 13 18 Q16 20 20 18" fill="#78A682" />
        <path d="M20 15 Q26 11 27 15 Q24 17 20 15" fill="#78A682" />
        {leaves >= 3 && <path d="M20 12 Q13 8 15 12" fill="#8BB995" />}
        {leaves >= 5 && <circle cx="20" cy="9" r="2.5" fill={themeAccent} />}
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
