import React from 'react';
import styles from './CompleteTemplate.module.css';

interface Props {
  summary: React.ReactNode;
  list?: React.ReactNode;
  overlay?: React.ReactNode;
  className?: string;
}

export const CompleteTemplate = ({
  summary,
  list,
  overlay,
  className = '',
}: Props): React.ReactElement => {
  return (
    <div className={`${styles.viewport} ${className}`.trim()}>
      <div className={styles.container}>
        <main className={styles.main}>
          {summary}
          {list && <div className={styles.listWrapper}>{list}</div>}
        </main>
      </div>
      {overlay}
    </div>
  );
};
