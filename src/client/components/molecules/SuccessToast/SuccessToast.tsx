import React, { useEffect, useState } from 'react';
import { Text } from '../../atoms/Text';
import { Sparkle } from '../../atoms/Sparkle';
import styles from './SuccessToast.module.css';

interface Props {
  message: string;
  visible: boolean;
}

export const SuccessToast = ({ message, visible }: Props): React.ReactElement | null => {
  const [shouldRender, setShouldRender] = useState(visible);
  const [sparkleKey, setSparkleKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setSparkleKey((prev) => prev + 1);
    } else {
      // Delay unmount to let exit animation finish
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
        <Sparkle key={sparkleKey} count={6} color="mint" />
      </div>
      <Text variant="body" className={styles.message}>
        {message}
      </Text>
    </div>
  );
};
