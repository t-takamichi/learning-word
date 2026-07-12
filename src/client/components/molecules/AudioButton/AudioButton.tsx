import React from 'react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { useSpeech } from '../../../hooks/useSpeech';
import styles from './AudioButton.module.css';

interface Props {
  word: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioButton = ({ word, size = 'md' }: Props): React.ReactElement => {
  const { speak, isSpeaking, isSupported } = useSpeech();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation(); // Avoid triggering potential flip actions on parent card
    speak(word);
  };

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={styles.unsupported}
        title="TTS is not supported in this browser"
      >
        <Icon
          name="sound-off"
          size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
          color="var(--ink-400)"
        />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={`${styles.button} ${isSpeaking ? styles.speaking : ''}`.trim()}
      aria-label={`Pronounce ${word}`}
    >
      <Icon
        name="speaker"
        size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
        color={isSpeaking ? 'var(--berry-600)' : 'var(--berry-500)'}
      />
    </Button>
  );
};
