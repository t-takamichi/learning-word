import React, { useState } from 'react';
import styles from './UserSelector.module.css';

interface Props {
  activeUser: { id: number; username: string } | null;
  onLogin: (username: string, pin: string) => Promise<void>;
  onRegister: (username: string, pin: string) => Promise<void>;
  onLogout: () => void;
  onDelete: (id: number, pin: string) => Promise<void>;
}

export function UserSelector({ activeUser, onLogin, onRegister, onLogout, onDelete }: Props): React.ReactElement {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // For confirmation before delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePin, setDeletePin] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmedUser = username.trim();
    const trimmedPin = pin.trim();

    if (!trimmedUser) {
      setError('おなまえを入力してね🍓');
      return;
    }
    if (!trimmedPin) {
      setError('合言葉（PIN）を入力してね🔑');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (tab === 'login') {
        await onLogin(trimmedUser, trimmedPin);
      } else {
        await onRegister(trimmedUser, trimmedPin);
      }
      setUsername('');
      setPin('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('何かがうまくいかなかったみたい💦');
      }
    } finally {
      setLoading(false);
    }
  };

  if (activeUser) {
    return (
      <div className={styles.container}>
        <div className={styles.welcomeCard}>
          <div className={styles.avatar}>🍓</div>
          <h2 className={styles.welcomeTitle}>{activeUser.username} ちゃん</h2>
          <p className={styles.welcomeText}>ログイン中だよ🍓いっしょにべんきょうしよう！</p>
          
          <div className={styles.activeActions}>
            <button 
              type="button" 
              className={styles.primaryBtn} 
              onClick={() => {
                window.location.assign('/levels');
              }}
            >
              べんきょうをはじめる
            </button>
            <button 
              type="button" 
              className={styles.secondaryBtn} 
              onClick={onLogout}
            >
              べつの人でログインする
            </button>
          </div>
          
          <div className={styles.deleteSection}>
            {confirmDelete ? (
              <div className={styles.confirmDeleteBox}>
                <p className={styles.deleteWarning}>
                  本当にアカウントを消しちゃう？<br />
                  これまでの学習履歴も全部消えちゃうよ😢
                </p>
                <div className={styles.formGroup} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <label className={styles.label}>確認のため合言葉 (PIN) を入力してね🔑</label>
                  <input 
                    type="password" 
                    className={styles.input} 
                    placeholder="合言葉を入力してね🔑" 
                    value={deletePin}
                    onChange={(e) => {
                      setDeletePin(e.target.value);
                      if (deleteError) setDeleteError('');
                    }}
                  />
                  {deleteError && <p className={styles.error} style={{ marginTop: '0.5rem' }}>{deleteError}</p>}
                </div>
                <div className={styles.deleteConfirmButtons}>
                  <button 
                    type="button" 
                    className={styles.dangerBtn}
                    onClick={async () => {
                      const trimmedPin = deletePin.trim();
                      if (!trimmedPin) {
                        setDeleteError('合言葉を入力してね🔑');
                        return;
                      }
                      try {
                        await onDelete(activeUser.id, trimmedPin);
                        setConfirmDelete(false);
                        setDeletePin('');
                        setDeleteError('');
                      } catch (err) {
                        if (err instanceof Error) {
                          setDeleteError(err.message);
                        } else {
                          setDeleteError('合言葉がちがうみたい💦');
                        }
                      }
                    }}
                  >
                    うん、おわかれする
                  </button>
                  <button 
                    type="button" 
                    className={styles.cancelBtn}
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeletePin('');
                      setDeleteError('');
                    }}
                  >
                    やっぱりやめる
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button" 
                className={styles.deleteBtn}
                onClick={() => setConfirmDelete(true)}
              >
                このアカウントを削除する（おわかれする）
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabHeader}>
        <button 
          className={`${styles.tabBtn} ${tab === 'login' ? styles.tabActive : ''}`}
          onClick={() => { setTab('login'); setError(''); }}
        >
          ログイン
        </button>
        <button 
          className={`${styles.tabBtn} ${tab === 'register' ? styles.tabActive : ''}`}
          onClick={() => { setTab('register'); setError(''); }}
        >
          あたらしくはじめる
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>おなまえ</label>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="おなまえを教えてね🍓" 
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError('');
            }}
            maxLength={15}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>合言葉 (PIN / パスワード)</label>
          <input 
            type="password" 
            className={styles.input} 
            placeholder="合言葉を入力してね🔑" 
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if (error) setError('');
            }}
            disabled={loading}
          />
          {tab === 'register' && (
            <p className={styles.inputHint}>※ 他の人に見られない合言葉（英数字パスワード）を決めてね</p>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? '準備中...' : tab === 'login' ? 'ログインする' : 'いっしょにはじめる'}
        </button>
      </form>
    </div>
  );
}
