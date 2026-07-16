import React from 'react';
import styles from './Mascot.module.css';

interface Props {
  readonly expression: 'standard' | 'happy' | 'sad';
}

export function Mascot({ expression }: Props): React.ReactElement {
  const getExpressionEmoji = () => {
    switch (expression) {
      case 'happy': return '🎉🍓✨';
      case 'sad': return '😢🍓💦';
      default: return '😊🍓';
    }
  };

  return (
    <div className={`${styles.container} ${styles[expression]}`}>
      <span className={styles.emoji} role="img" aria-label="ベリーちゃん">
        {getExpressionEmoji()}
      </span>
    </div>
  );
}
