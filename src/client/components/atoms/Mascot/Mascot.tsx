import React from 'react';
import styles from './Mascot.module.css';

interface Props {
  mood?: 'idle' | 'happy' | 'cheer';
  size?: number;
  className?: string;
}

export const Mascot = ({
  mood = 'idle',
  size = 64,
  className = '',
}: Props): React.ReactElement => {
  const classes = [styles.mascot, styles[mood], className].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        {/* Leaves */}
        <path
          d="M32 16c-4-6-10-6-10-6s3 8 7 10c-5-2-11 1-11 1s8 4 11 1c-2 4-1 9-1 9s5-7 4-11c3 4 8 4 8 4s-3-5-7-7z"
          fill="var(--mint-500)"
        />
        {/* Strawberry Body */}
        <path
          d="M32 54C22 54 12 44 12 30c0-12 10-20 20-20s20 8 20 20c0 14-10 24-20 24z"
          fill="var(--berry-500)"
        />
        {/* Seeds */}
        <circle cx="20" cy="22" r="1.5" fill="var(--sunny-400)" />
        <circle cx="44" cy="22" r="1.5" fill="var(--sunny-400)" />
        <circle cx="18" cy="34" r="1.5" fill="var(--sunny-400)" />
        <circle cx="46" cy="34" r="1.5" fill="var(--sunny-400)" />
        <circle cx="24" cy="44" r="1.5" fill="var(--sunny-400)" />
        <circle cx="40" cy="44" r="1.5" fill="var(--sunny-400)" />
        <circle cx="32" cy="48" r="1.5" fill="var(--sunny-400)" />

        {/* Faces */}
        {mood === 'idle' && (
          <g>
            {/* Eyes */}
            <circle cx="26" cy="30" r="3" fill="var(--ink-900)" />
            <circle cx="38" cy="30" r="3" fill="var(--ink-900)" />
            {/* Mouth */}
            <path
              d="M30 35c1 1 3 1 4 0"
              stroke="var(--ink-900)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Blush */}
            <circle cx="21" cy="32" r="3" fill="var(--berry-200)" opacity="0.6" />
            <circle cx="43" cy="32" r="3" fill="var(--berry-200)" opacity="0.6" />
          </g>
        )}

        {mood === 'happy' && (
          <g>
            {/* Happy arch eyes */}
            <path
              d="M23 31c1-2 4-2 5 0"
              stroke="var(--ink-900)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M36 31c1-2 4-2 5 0"
              stroke="var(--ink-900)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Open happy mouth */}
            <path d="M29 35c0 2.5 1.5 4 3 4s3-1.5 3-4H29z" fill="var(--ink-900)" />
            {/* Blush */}
            <circle cx="20" cy="33" r="4" fill="var(--berry-200)" opacity="0.8" />
            <circle cx="44" cy="33" r="4" fill="var(--berry-200)" opacity="0.8" />
          </g>
        )}

        {mood === 'cheer' && (
          <g>
            {/* Sparkle eyes */}
            <path d="M26 25l0.8 1.8 1.8 0.8-1.8 0.8-0.8 1.8-0.8-1.8-1.8-0.8 1.8-0.8z" fill="var(--sunny-400)" />
            <path d="M38 25l0.8 1.8 1.8 0.8-1.8 0.8-0.8 1.8-0.8-1.8-1.8-0.8 1.8-0.8z" fill="var(--sunny-400)" />
            {/* Open mouth (excited) */}
            <circle cx="32" cy="36" r="3.5" fill="var(--ink-900)" />
            {/* Blush */}
            <circle cx="19" cy="32" r="4" fill="var(--berry-200)" opacity="0.8" />
            <circle cx="45" cy="32" r="4" fill="var(--berry-200)" opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};
