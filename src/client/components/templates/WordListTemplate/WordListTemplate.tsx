import React from 'react';
import styles from './WordListTemplate.module.css';

interface Props {
  header: React.ReactNode;
  list: React.ReactNode;
  className?: string;
}

export const WordListTemplate = ({
  header,
  list,
  className = '',
}: Props): React.ReactElement => {
  return (
    <div className={`${styles.viewport} ${className}`.trim()}>
      <div className={styles.container}>
        <div className={styles.headerWrapper}>{header}</div>
        <main className={styles.main}>{list}</main>
      </div>
    </div>
  );
};
