import React, { useState, useRef, useEffect } from 'react';
import { UserAvatar } from '../../atoms/UserAvatar';
import styles from './UserNav.module.css';

interface Props {
  username: string;
  activeWordSetName: string | null;
  onNavigateToUsers: () => void;
  onNavigateToWordSets: () => void;
}

export function UserNav({ username, activeWordSetName, onNavigateToUsers, onNavigateToWordSets }: Props): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (): void => setIsOpen(prev => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className={styles.container} ref={menuRef}>
      <button className={styles.trigger} onClick={toggleMenu} aria-expanded={isOpen}>
        <UserAvatar username={username} size="xs" />
        <div className={styles.info}>
          <span className={styles.username}>{username}</span>
          {activeWordSetName && <span className={styles.setName}>{activeWordSetName}</span>}
        </div>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>▼</span>
      </button>


      {isOpen && (
        <div className={styles.dropdown}>
          <button 
            className={styles.menuItem} 
            onClick={() => {
              setIsOpen(false);
              onNavigateToWordSets();
            }}
          >
            📖 レベルをかえる
          </button>
          <button 
            className={styles.menuItem} 
            onClick={() => {
              setIsOpen(false);
              onNavigateToUsers();
            }}
          >
            🍓 ちがう人でまなぶ
          </button>
        </div>
      )}
    </div>
  );
}
