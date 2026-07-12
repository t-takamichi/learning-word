import React from 'react';
import styles from './Badge.module.css';

interface Props {
  value: number | string;
  tone?: 'berry' | 'mint' | 'lavender' | 'sunny';
  className?: string;
}

export const Badge = ({
  value,
  tone = 'berry',
  className = '',
}: Props): React.ReactElement => {
  const classes = [styles.badge, styles[tone], className].filter(Boolean).join(' ');

  return <span className={classes}>{value}</span>;
};
