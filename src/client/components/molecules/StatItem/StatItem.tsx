import React from 'react';
import { Text } from '../../atoms/Text';
import styles from './StatItem.module.css';

interface Props {
  label: string;
  value: string | number;
  className?: string;
}

export const StatItem = ({ label, value, className = '' }: Props): React.ReactElement => {
  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <Text variant="hint" className={styles.label}>
        {label}
      </Text>
      <Text variant="word" className={styles.value}>
        {value}
      </Text>
    </div>
  );
};
