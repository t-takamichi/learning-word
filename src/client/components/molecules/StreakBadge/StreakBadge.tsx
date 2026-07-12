import React from 'react';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';
import styles from './StreakBadge.module.css';

interface Props {
  count: number;
}

export const StreakBadge = ({ count }: Props): React.ReactElement | null => {
  // Only display streak if it is 2 or more
  if (count < 2) return null;

  return (
    <div className={styles.container} title={`${count} Consecutive Correct Answers!`}>
      <Icon name="flame" size={20} color="var(--sunny-400)" className={styles.fireIcon} />
      <Badge value={count} tone="sunny" className={styles.badge} />
    </div>
  );
};
