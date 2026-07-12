import React from 'react';
import styles from './UserAvatar.module.css';

interface Props {
  username: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function UserAvatar({ username, size = 'md' }: Props): React.ReactElement {

  const initial = username.trim().substring(0, 1).toUpperCase();
  
  // Hash name to select one of pastel colors
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % 5;
  const colorClass = styles[`bg-${colorIndex}`];

  return (
    <div className={`${styles.avatar} ${styles[size]} ${colorClass}`} aria-label={username}>
      <span className={styles.initial}>{initial}</span>
      <span className={styles.strawberry}>🍓</span>
    </div>
  );
}
