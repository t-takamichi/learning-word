import React from 'react';
import { Icon } from '../Icon';
import styles from './SoundToggle.module.css';

interface Props {
  muted: boolean;
  onToggle?: () => void;
  className?: string;
}

export const SoundToggle = ({
  muted,
  onToggle,
  className = '',
}: Props): React.ReactElement => {
  const classes = [styles.toggle, className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onToggle}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
    >
      <Icon
        name={muted ? 'sound-off' : 'sound-on'}
        size={16}
        color="var(--ink-700)"
      />

    </button>
  );
};
