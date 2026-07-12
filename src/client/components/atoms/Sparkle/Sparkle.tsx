import React, { useMemo } from 'react';
import styles from './Sparkle.module.css';

interface Props {
  count?: number;
  color?: 'sunny' | 'mint';
  className?: string;
}

export const Sparkle = ({
  count = 8,
  color = 'sunny',
  className = '',
}: Props): React.ReactElement => {
  const colorVar = color === 'sunny' ? 'var(--sunny-400)' : 'var(--mint-500)';

  // Pre-calculate positions to ensure SSR and hydration match, and to avoid re-renders.
  const particles = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const distance = 24 + (i % 3) * 8; // Varied distance (24px, 32px, 40px)
      const dx = `${Math.round(distance * Math.cos(angle))}px`;
      const dy = `${Math.round(distance * Math.sin(angle))}px`;
      // Alternate between circles and star-like diamond shapes
      const isCircle = i % 2 === 0;
      list.push({ dx, dy, isCircle });
    }
    return list;
  }, [count]);

  return (
    <div
      className={`${styles.container} ${className}`.trim()}
      style={{ '--sparkle-color': colorVar } as React.CSSProperties}
    >
      {particles.map((p, idx) => (
        <span
          key={idx}
          className={`${styles.particle} ${p.isCircle ? styles.circle : styles.star}`}
          style={
            {
              '--dx': p.dx,
              '--dy': p.dy,
              animationDelay: `${idx * 0.04}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
