import React from 'react';
import { Chip } from '../../atoms/Chip';
import styles from './LanguageToggle.module.css';

type Language = 'vi' | 'ja';

interface Props {
  language: Language;
  onToggle: () => void;
}

export const LanguageToggle = ({ language, onToggle }: Props): React.ReactElement => {
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.toggleButton}
        onClick={onToggle}
        disabled={language === 'vi'}
        aria-label="Translate to Vietnamese"
      >
        <Chip tone={language === 'vi' ? 'berry' : 'lavender'} className={styles.chip}>
          <span className={styles.flag}>🇻🇳</span>
          <span className={styles.label}>Tiếng Việt</span>
        </Chip>
      </button>
      <button
        type="button"
        className={styles.toggleButton}
        onClick={onToggle}
        disabled={language === 'ja'}
        aria-label="Translate to Japanese"
      >
        <Chip tone={language === 'ja' ? 'berry' : 'lavender'} className={styles.chip}>
          <span className={styles.flag}>🇯🇵</span>
          <span className={styles.label}>日本語</span>
        </Chip>
      </button>
    </div>
  );
};
