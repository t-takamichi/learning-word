import React, { useEffect, useState, useMemo } from 'react';
import { Mascot } from '../../atoms/Mascot';
import { Text } from '../../atoms/Text';
import { Sparkle } from '../../atoms/Sparkle';
import styles from './CelebrationOverlay.module.css';

interface Props {
  active: boolean;
  variant: 'combo' | 'complete';
  comboCount?: number;
  onClose?: () => void;
}

interface Piece {
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
  rotate: string;
  shape: 'rect' | 'circle';
}

export const CelebrationOverlay = ({
  active,
  variant,
  comboCount = 0,
  onClose,
}: Props): React.ReactElement | null => {
  const [shouldRender, setShouldRender] = useState(active);

  useEffect(() => {
    if (active) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [active, onClose]);

  // Generate random confetti pieces once
  const confettiPieces = useMemo(() => {
    const colors = ['var(--berry-500)', 'var(--mint-500)', 'var(--sunny-400)', 'var(--lavender-500)'];
    const list: Piece[] = [];
    for (let i = 0; i < 24; i++) {
      list.push({
        id: i,
        left: `${10 + Math.random() * 80}%`,
        delay: `${Math.random() * 0.4}s`,
        duration: `${1.2 + Math.random() * 1.0}s`,
        color: colors[i % colors.length],
        size: `${6 + Math.random() * 8}px`,
        rotate: `${Math.random() * 360}deg`,
        shape: i % 2 === 0 ? 'rect' : 'circle',
      });
    }
    return list;
  }, []);

  if (!shouldRender) return null;

  const containerClasses = [styles.overlay, active ? styles.show : styles.hide].join(' ');

  return (
    <div className={containerClasses} onClick={onClose}>
      <div className={styles.confettiContainer}>
        {confettiPieces.map((p) => (
          <div
            key={p.id}
            className={`${styles.confetti} ${styles[p.shape]}`}
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              transform: `rotate(${p.rotate})`,
            }}
          />
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.sparkleWrapper}>
          <Sparkle count={12} color={variant === 'complete' ? 'sunny' : 'mint'} />
        </div>

        <Mascot mood="cheer" size={100} className={styles.mascot} />

        <div className={styles.textGroup}>
          {variant === 'combo' ? (
            <>
              <Text variant="word" className={styles.title}>
                {comboCount} Combo!
              </Text>
              <Text variant="body" className={styles.subtitle}>
                その調子！すごいすごい！🔥
              </Text>
            </>
          ) : (
            <>
              <Text variant="word" className={styles.title}>
                ぜんぶできたね！
              </Text>
              <Text variant="body" className={styles.subtitle}>
                お疲れさま！今日の学習完了です🍓
              </Text>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
