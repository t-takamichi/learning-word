import React from 'react';
import { UserAvatar } from '../../atoms/UserAvatar';
import styles from './UserCard.module.css';

interface User {
  id: number;
  username: string;
}

interface Props {
  user: User;
  isActive: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export function UserCard({ user, isActive, onSelect, onDelete }: Props): React.ReactElement {
  const handleCardClick = (e: React.MouseEvent): void => {
    // Prevent selecting if clicking delete button
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.deleteBtn}`)) return;
    onSelect(user.id);
  };

  return (
    <div 
      className={`${styles.card} ${isActive ? styles.active : ''}`} 
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
    >
      <UserAvatar username={user.username} size="md" />
      <span className={styles.username}>{user.username}</span>
      <button 
        className={styles.deleteBtn}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(user.id);
        }}
        aria-label={`${user.username}とお別れする`}
      >
        おわかれする
      </button>
    </div>
  );
}
