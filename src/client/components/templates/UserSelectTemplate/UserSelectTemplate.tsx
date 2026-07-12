import React from 'react';
import { Mascot } from '../../atoms/Mascot';
import styles from './UserSelectTemplate.module.css';

interface Props {
  children: React.ReactNode;
}

export function UserSelectTemplate({ children }: Props): React.ReactElement {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.welcomeArea}>
          <Mascot mood="cheer" />
          <h1 className={styles.title}>だれがまなぶ？🍓</h1>
          <p className={styles.subtitle}>いっしょにえいごのべんきょうをはじめよう！</p>
        </div>
        {children}
        <footer className={styles.footer}>
          <a href="/admin" className={styles.adminLink}>
            <span className="vi-content">Thiết lập Quản trị</span>
            <span className="ja-content">管理者向け設定</span>
          </a>
        </footer>
      </div>
    </div>
  );
}

