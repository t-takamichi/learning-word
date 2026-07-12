import React from 'react';
import { Badge } from '../../atoms/Badge';
import { Text } from '../../atoms/Text';
import styles from './ProgressIndicator.module.css';

interface Props {
  current: number;
  total: number;
}

export const ProgressIndicator = ({ current, total }: Props): React.ReactElement => {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
  const remaining = total - current;
  const showEncouragement = remaining > 0 && remaining <= 2;

  return (
    <div className={styles.container}>
      <div className={styles.meta}>
        <div className={styles.count}>
          <Badge value={current} tone="berry" />
          <Text variant="hint" className={styles.separator}>/</Text>
          <Text variant="body" className={styles.total}>{total}</Text>
        </div>
        {showEncouragement && (
          <Text variant="hint" className={styles.encouragement}>
            あと少し！がんばろう🍓
          </Text>
        )}
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};
