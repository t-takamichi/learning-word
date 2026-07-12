import React from 'react';
import styles from './Chip.module.css';

interface Props {
  tone?: 'berry' | 'mint' | 'lavender';
  children: React.ReactNode;
  className?: string;
}

export const Chip = ({
  tone = 'berry',
  children,
  className = '',
}: Props): React.ReactElement => {
  const classes = [styles.chip, styles[tone], className].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};
