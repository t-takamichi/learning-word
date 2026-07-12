import React, { useState } from 'react';
import { UserCard } from '../../molecules/UserCard';
import styles from './UserSelector.module.css';

interface User {
  id: number;
  username: string;
}

interface Props {
  users: User[];
  activeUserId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: (username: string) => void;
}

export function UserSelector({ users, activeUserId, onSelect, onDelete, onCreate }: Props): React.ReactElement {
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = newUsername.trim();

    if (!trimmed) {
      setError('おなまえが空っぽだよ🍓');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === trimmed.toLowerCase())) {
      setError('そのおなまえはもう使われているみたい');
      return;
    }

    onCreate(trimmed);
    setNewUsername('');
    setError('');
  };

  return (
    <div className={styles.container}>
      {users.length > 0 ? (
        <div className={styles.grid}>
          {users.map(user => (
            <UserCard 
              key={user.id} 
              user={user} 
              isActive={user.id === activeUserId} 
              onSelect={onSelect} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      ) : (
        <p className={styles.emptyText}>まだだれもいないよ。おなまえを登録してね🍓</p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="おなまえを教えてね🍓" 
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
              if (error) setError('');
            }}
            maxLength={15}
          />
          <button type="submit" className={styles.submitBtn}>
            いっしょにはじめる
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}
