import React, { useEffect, useState } from 'react';
import styles from './Sparkle.module.css';

interface Props {
  readonly active: boolean;
}

export function Sparkle({ active }: Props): React.ReactElement | null {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (active) {
      setShouldRender(true);
      const timer = setTimeout(() => setShouldRender(false), 800);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!shouldRender) return null;

  return (
    <div className={styles.sparkleContainer}>
      <div className={`${styles.particle} ${styles.p1}`}>★</div>
      <div className={`${styles.particle} ${styles.p2}`}>🌸</div>
      <div className={`${styles.particle} ${styles.p3}`}>✨</div>
      <div className={`${styles.particle} ${styles.p4}`}>🍓</div>
      <div className={`${styles.particle} ${styles.p5}`}>★</div>
      <div className={`${styles.particle} ${styles.p6}`}>✨</div>
    </div>
  );
}
