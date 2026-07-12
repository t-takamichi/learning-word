import React from 'react';
import { SoundToggle } from '../../atoms/SoundToggle';
import { useSound } from '../../../hooks/useSound';
import styles from './MuteButton.module.css';

interface Props {
  className?: string;
}

export const MuteButton = ({ className = '' }: Props): React.ReactElement => {
  const { muted, setMuted } = useSound();

  const handleToggle = (): void => {
    setMuted(!muted);
  };

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <SoundToggle muted={muted} onToggle={handleToggle} />
    </div>
  );
};
