import React from 'react';
import styles from './StatusDot.module.css';

interface Props {
  status: 'new' | 'weak' | 'mastered';
  className?: string;
}

export const StatusDot = ({
  status,
  className = '',
}: Props): React.ReactElement => {
  const classes = [styles.dot, styles[status], className].filter(Boolean).join(' ');

  // Accessbility: Provide title or aria-label for status description
  const labelMap = {
    new: 'New',
    weak: 'Needs Review',
    mastered: 'Mastered',
  };

  return (
    <span
      className={classes}
      role="status"
      aria-label={labelMap[status]}
      title={labelMap[status]}
    />
  );
};
