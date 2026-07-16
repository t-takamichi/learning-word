import React from 'react';
import { Mascot } from '../../atoms/Mascot';
import { ProgressIndicator } from '../../molecules/ProgressIndicator';
import { StreakBadge } from '../../molecules/StreakBadge';
import { MuteButton } from '../../molecules/MuteButton';
import styles from './SessionHeader.module.css';

interface Props {
  readonly current: number;
  readonly total: number;
  readonly streak: number;
  readonly className?: string;
}

export function SessionHeader({
  current,
  total,
  streak,
  className = '',
}: Props): React.ReactElement {
  const mascotExpression = streak >= 2 ? 'happy' : 'standard';

  return (
    <header className={`${styles.header} ${className}`.trim()}>
      <div className={styles.topRow}>
        <div className={styles.leftGroup}>
          <Mascot expression={mascotExpression} />
          <StreakBadge count={streak} />
        </div>

        <div className={styles.rightGroup}>
          <MuteButton />
        </div>
      </div>
      <div className={styles.progressRow}>
        <ProgressIndicator current={current} total={total} />
      </div>
    </header>
  );
}
