import React from 'react';
import { Mascot } from '../../atoms/Mascot';
import { ProgressIndicator } from '../../molecules/ProgressIndicator';
import { StreakBadge } from '../../molecules/StreakBadge';
import { MuteButton } from '../../molecules/MuteButton';
import styles from './SessionHeader.module.css';

interface Props {
  current: number;
  total: number;
  streak: number;
  className?: string;
}

export const SessionHeader = ({
  current,
  total,
  streak,
  className = '',
}: Props): React.ReactElement => {
  // Mascot mood responds to streak
  const mascotMood = streak >= 5 ? 'cheer' : streak >= 2 ? 'happy' : 'idle';

  return (
    <header className={`${styles.header} ${className}`.trim()}>
      <div className={styles.topRow}>
        <div className={styles.leftGroup}>
          <Mascot mood={mascotMood} size={36} />
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
};
