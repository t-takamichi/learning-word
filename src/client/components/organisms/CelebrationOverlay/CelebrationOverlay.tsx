import React, { useEffect, useState } from 'react';
import { Mascot } from '../../atoms/Mascot';
import { Sparkle } from '../../atoms/Sparkle';
import { Text } from '../../atoms/Text';
import styles from './CelebrationOverlay.module.css';

interface Props {
  readonly active: boolean;
  readonly comboCount: number;
}

export function CelebrationOverlay({ active, comboCount }: Props): React.ReactElement | null {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (active) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 2400); // Auto-hide after 2.4s
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!shouldRender) return null;

  return (
    <div className={styles.overlay} aria-live="polite">
      <div className={styles.content}>
        <div className={styles.sparkleBg}>
          <Sparkle active={active} />
        </div>
        <Mascot expression="happy" />
        <div className={styles.textGroup}>
          <Text variant="heading" className={styles.comboTitle}>
            {comboCount} Combo! 🔥
          </Text>
          <Text variant="body" className={styles.comboSub}>
            すごい！そのちょうし🍓
          </Text>
        </div>
      </div>
    </div>
  );
}
