import React, { useEffect, useState } from 'react';
import { Text } from '../../atoms/Text';
import { Sparkle } from '../../atoms/Sparkle';
import styles from './SuccessToast.module.css';

interface Props {
  readonly message: string;
  readonly visible: boolean;
}

export function SuccessToast({ message, visible }: Props): React.ReactElement | null {
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!shouldRender) return null;

  const classes = [styles.toast, visible ? styles.show : styles.hide].join(' ');

  return (
    <div className={classes} role="alert">
      <div className={styles.sparkleWrapper}>
        <Sparkle active={visible} />
      </div>
      <Text variant="body" className={styles.message}>
        {message}
      </Text>
    </div>
  );
}
