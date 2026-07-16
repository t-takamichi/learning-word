import React from 'react';
import styles from './SoundToggle.module.css';

interface Props {
  readonly muted: boolean;
  readonly onToggle: () => void;
}

export function SoundToggle({ muted, onToggle }: Props): React.ReactElement {
  return (
    <button 
      className={styles.toggleButton} 
      onClick={onToggle}
      aria-label={muted ? "音声をオンにする" : "音声をオフにする"}
      type="button"
    >
      <span className={styles.icon} role="img" aria-hidden="true">
        {muted ? '🔇' : '🔊'}
      </span>
    </button>
  );
}
