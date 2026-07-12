import React from 'react';
import styles from './WordSetCard.module.css';

interface WordSetProgress {
  total: number;
  mastered: number;
}

interface WordSet {
  id: number;
  name: string;
  levelTag: 'basic' | 'intermediate' | 'advanced';
  description: string | null;
  progress: WordSetProgress;
}

interface Props {
  wordSet: WordSet;
  onSelect: (id: number) => void;
}

export function WordSetCard({ wordSet, onSelect }: Props): React.ReactElement {
  const { total, mastered } = wordSet.progress;
  const progressPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const isCompleted = progressPercent === 100;

  const getLevelEmoji = (level: string): string => {
    switch (level) {
      case 'basic': return '🌱';
      case 'intermediate': return '🚀';
      case 'advanced': return '🏆';
      default: return '📖';
    }
  };

  return (
    <div 
      className={`${styles.card} ${isCompleted ? styles.completed : ''}`}
      onClick={() => onSelect(wordSet.id)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.header}>
        <span className={styles.emoji}>{getLevelEmoji(wordSet.levelTag)}</span>
        <div className={styles.titleArea}>
          <h3 className={styles.title}>{wordSet.name}</h3>
          {wordSet.description && <p className={styles.desc}>{wordSet.description}</p>}
        </div>
        {isCompleted && <span className={styles.crown} aria-label="制覇！">👑</span>}
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span className={styles.progressLabel}>すすめた数</span>
          <span className={styles.progressValue}>
            {mastered} / {total}語 ({progressPercent}%)
          </span>
        </div>
        <div className={styles.progressBarBg}>
          <div 
            className={`${styles.progressBarFill} ${isCompleted ? styles.completedFill : ''}`} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
