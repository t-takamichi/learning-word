import React from 'react';
import styles from './StudyTemplate.module.css';

interface Props {
  header: React.ReactNode;
  card: React.ReactNode;
  autoPlay: React.ReactNode;
  list: React.ReactNode;
  overlay?: React.ReactNode;
  className?: string;
}

export const StudyTemplate = ({
  header,
  card,
  autoPlay,
  list,
  overlay,
  className = '',
}: Props): React.ReactElement => {
  return (
    <div className={`${styles.viewport} ${className}`.trim()}>
      <div className={styles.container}>
        <div className={styles.headerWrapper}>{header}</div>
        <main className={styles.main}>
          <div className={styles.cardWrapper}>{card}</div>
          <div className={styles.autoPlayWrapper}>{autoPlay}</div>
          <div className={styles.listWrapper}>{list}</div>
        </main>
      </div>
      {overlay}
    </div>
  );
};
