import React, { useState, useEffect } from 'react';
import { Text } from '../../atoms/Text';
import { AudioButton } from '../AudioButton';
import type { WordWithProgress } from '@shared/types';
import styles from './WordListItem.module.css';

interface Props {
  word: WordWithProgress;
  userId: number | null;
  onEdit?: (word: WordWithProgress) => void;
  onDelete?: (id: number) => void;
}

export const WordListItem = ({ word, userId, onEdit, onDelete }: Props): React.ReactElement => {
  const [note, setNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Load note from localStorage on mount
  useEffect(() => {
    if (userId) {
      const savedNote = localStorage.getItem(`note_${userId}_${word.id}`);
      if (savedNote) {
        setNote(savedNote);
      }
    }
  }, [userId, word.id]);

  const handleSaveNote = (): void => {
    if (userId) {
      localStorage.setItem(`note_${userId}_${word.id}`, note);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  // Format date (e.g. 30/06/2026)
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '30/06/2026';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return '30/06/2026';
    }
  };

  const status = word.progress?.status ?? 'new';

  const statusTextMap = {
    new: 'New',
    weak: 'Review',
    mastered: 'Mastered',
  };

  const statusClassMap = {
    new: styles.badgeNew,
    weak: styles.badgeWeak,
    mastered: styles.badgeMastered,
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.wordInfo}>
          <Text variant="heading" className={styles.english}>
            {word.english}
          </Text>
          <span className={`${styles.badge} ${statusClassMap[status]}`}>
            {statusTextMap[status]}
          </span>
        </div>
        <div className={styles.actions}>
          <AudioButton word={word.english} size="sm" />
          {word.created_by !== null && word.created_by === userId && (
            <>
              <button 
                className={styles.actionBtn} 
                onClick={() => onEdit?.(word)}
                aria-label="単語の編集"
              >
                ✏️
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                onClick={() => onDelete?.(word.id)}
                aria-label="単語の削除"
              >
                🗑
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.translations}>
        <Text variant="body" className="vi-content">
          {word.vietnamese}
        </Text>
        <Text variant="body" className="ja-content">
          {word.japanese}
        </Text>
      </div>

      {word.example_en && (
        <div className={styles.examples}>
          <Text variant="hint" className={styles.exampleEn}>
            {word.example_en}
          </Text>
          {word.example_vi && (
            <Text variant="hint" className="vi-content">
              {word.example_vi}
            </Text>
          )}
          {word.example_ja && (
            <Text variant="hint" className="ja-content">
              {word.example_ja}
            </Text>
          )}
        </div>
      )}

      <div className={styles.noteSection}>
        <input
          type="text"
          placeholder="+ Add note / メモを追加 / Thêm ghi chú"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={styles.noteInput}
        />
        <button 
          onClick={handleSaveNote} 
          className={styles.saveButton}
          aria-label="Save note"
        >
          {isSaved ? '✅' : '💾'}
        </button>
      </div>

      <div className={styles.footer}>
        <span className={styles.dateText}>
          {formatDate(word.created_at)}
        </span>
      </div>
    </article>
  );
};

