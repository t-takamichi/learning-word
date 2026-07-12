import React from 'react';
import { Mascot } from '../../atoms/Mascot';
import styles from './WordSetSelectTemplate.module.css';

interface Props {
  username: string;
  children: React.ReactNode;
}

export function WordSetSelectTemplate({ username, children }: Props): React.ReactElement {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Mascot mood="idle" />
          <h1 className={styles.title}>どのレベルにする？</h1>
          <p className={styles.subtitle}>{username}ちゃんにぴったりのレベルをえらぼう🍓</p>
        </div>
        {children}
      </div>
    </div>
  );
}
