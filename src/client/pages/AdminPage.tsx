import { useState, useEffect } from 'react';
import {
  useAdminWords,
  useCreateWord,
  useUpdateWord,
  useDeleteWord,
  useSearchDictionary,
  useLookupDictionary,
} from '../hooks/useAdminWords';
import type { AdminCredentials } from '../hooks/useAdminWords';
import type { Word } from '@shared/types';
import { LanguageToggle } from '../components/molecules/LanguageToggle';
import styles from './AdminPage.module.css';


interface CredentialsFormProps {
  readonly onSubmit: (creds: AdminCredentials) => void;
  readonly errorMessage: string | null;
  readonly language: 'vi' | 'ja';
  readonly onLanguageToggle: () => void;
}

function CredentialsForm({ onSubmit, errorMessage, language, onLanguageToggle }: CredentialsFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authCard} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <LanguageToggle language={language} onToggle={onLanguageToggle} />
        </div>

        <h2 className={styles.authTitle}>
          <span className="vi-content">Đăng nhập Quản trị</span>
          <span className="ja-content">管理者ログイン</span>
        </h2>
        {errorMessage && (
          <p className={styles.authError}>
            <span className="vi-content">Tài khoản hoặc mật khẩu sai</span>
            <span className="ja-content">ユーザー名またはパスワードが違います</span>
          </p>
        )}
        <div className={styles.formGroup}>
          <label htmlFor="username">
            <span className="vi-content">Tài khoản</span>
            <span className="ja-content">ユーザー名</span>
          </label>
          <input
            id="username"
            type="text"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">
            <span className="vi-content">Mật khẩu</span>
            <span className="ja-content">パスワード</span>
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className={styles.loginButton}>
          <span className="vi-content">Đăng nhập</span>
          <span className="ja-content">ログイン</span>
        </button>
        <a href="/" className={styles.backLink}>
          <span className="vi-content">← Quay lại học</span>
          <span className="ja-content">← 学習に戻る</span>
        </a>
      </form>
    </div>
  );
}


interface AddWordFormProps {
  readonly creds: AdminCredentials;
}

function AddWordForm({ creds }: AddWordFormProps) {
  const createWord = useCreateWord(creds);
  const [isOpen, setIsOpen] = useState(false);

  const [wordSetId, setWordSetId] = useState(1);
  const [english, setEnglish] = useState('');
  const [vietnamese, setVietnamese] = useState('');
  const [japanese, setJapanese] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleVi, setExampleVi] = useState('');
  const [exampleJa, setExampleJa] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const lookupMutation = useLookupDictionary(creds);
  const { data: suggestions } = useSearchDictionary(english, creds);
  const [lastLookedUpWord, setLastLookedUpWord] = useState('');

  useEffect(() => {
    const trimmed = english.trim();
    if (!trimmed || trimmed === lastLookedUpWord) return;

    if (suggestions && suggestions.includes(trimmed)) {
      setLastLookedUpWord(trimmed);
      lookupMutation.mutate(trimmed, {
        onSuccess: (data) => {
          if (data) {
            if (!vietnamese.trim()) setVietnamese(data.vietnamese);
            if (!japanese.trim()) setJapanese(data.japanese);
            if (!exampleEn.trim() && data.example_en) setExampleEn(data.example_en);
            if (!exampleVi.trim() && data.example_vi) setExampleVi(data.example_vi);
            if (!exampleJa.trim() && data.example_ja) setExampleJa(data.example_ja);
          }
        },
      });
    }
  }, [english, suggestions, lastLookedUpWord, vietnamese, japanese, exampleEn, exampleVi, exampleJa]);


  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrorMsg(null);

    if (!english.trim() || !vietnamese.trim() || !japanese.trim()) {
      setErrorMsg('english / vietnamese / japanese は必須項目です');
      return;
    }

    createWord.mutate(
      {
        word_set_id: wordSetId,
        english: english.trim(),
        vietnamese: vietnamese.trim(),
        japanese: japanese.trim(),
        example_en: exampleEn.trim() || null,
        example_vi: exampleVi.trim() || null,
        example_ja: exampleJa.trim() || null,
      },
      {
        onSuccess: () => {
          setWordSetId(1);
          setEnglish('');
          setLastLookedUpWord('');
          setVietnamese('');
          setJapanese('');
          setExampleEn('');
          setExampleVi('');
          setExampleJa('');
          setIsOpen(false);
        },
        onError: (err) => {
          setErrorMsg(err.message);
        },
      }
    );
  };

  return (
    <section className={styles.addSection}>
      <button
        type="button"
        className={styles.toggleFormButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <>
            <span className="vi-content">Đóng Form</span>
            <span className="ja-content">フォームを閉じる</span>
          </>
        ) : (
          <>
            <span className="vi-content">+ Thêm từ mới</span>
            <span className="ja-content">+ 新しい単語を追加</span>
          </>
        )}
      </button>

      {isOpen && (
        <form className={styles.addForm} onSubmit={handleSubmit}>
          <h3>
            <span className="vi-content">Thêm từ vựng mới</span>
            <span className="ja-content">新規単語追加</span>
          </h3>
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>
                <span className="vi-content">Cấp độ</span>
                <span className="ja-content">レベル/単語セット</span>
              </label>
              <select
                className={styles.select}
                value={wordSetId}
                onChange={(e) => setWordSetId(Number(e.target.value))}
              >
                <option value={1}>Basic (はじめての単語)</option>
                <option value={2}>Intermediate (表現をひろげる)</option>
                <option value={3}>Advanced (もっと深く学ぶ)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>
                English <span className="vi-content">(Bắt buộc)</span><span className="ja-content">(必須)</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                placeholder="e.g. hello"
                list="dictionary-suggestions"
                autoComplete="off"
              />
              <datalist id="dictionary-suggestions">
                {suggestions?.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div className={styles.formGroup}>
              <label>
                <span className="vi-content">Tiếng Việt (Bắt buộc)</span>
                <span className="ja-content">ベトナム語訳 (必須)</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={vietnamese}
                onChange={(e) => setVietnamese(e.target.value)}
                placeholder="e.g. xin chào"
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <span className="vi-content">Tiếng Nhật (Bắt buộc)</span>
                <span className="ja-content">日本語訳 (必須)</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={japanese}
                onChange={(e) => setJapanese(e.target.value)}
                placeholder="e.g. こんにちは"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <span className="vi-content">Ví dụ (Tiếng Anh)</span>
              <span className="ja-content">例文 (英語)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              <span className="vi-content">Ví dụ (Tiếng Việt)</span>
              <span className="ja-content">例文 (ベトナム語)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              <span className="vi-content">Ví dụ (Tiếng Nhật)</span>
              <span className="ja-content">例文 (日本語)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={exampleJa}
              onChange={(e) => setExampleJa(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.saveButton}
            disabled={createWord.isPending}
          >
            {createWord.isPending ? (
              <>
                <span className="vi-content">Đang lưu...</span>
                <span className="ja-content">保存中...</span>
              </>
            ) : (
              <>
                <span className="vi-content">Lưu lại</span>
                <span className="ja-content">保存する</span>
              </>
            )}
          </button>
        </form>
      )}
    </section>
  );
}


interface WordRowProps {
  readonly word: Word;
  readonly creds: AdminCredentials;
}

function WordRow({ word, creds }: WordRowProps) {
  const updateWord = useUpdateWord(creds);
  const deleteWord = useDeleteWord(creds);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [wordSetId, setWordSetId] = useState(word.word_set_id);
  const [english, setEnglish] = useState(word.english);
  const [vietnamese, setVietnamese] = useState(word.vietnamese);
  const [japanese, setJapanese] = useState(word.japanese);
  const [exampleEn, setExampleEn] = useState(word.example_en ?? '');
  const [exampleVi, setExampleVi] = useState(word.example_vi ?? '');
  const [exampleJa, setExampleJa] = useState(word.example_ja ?? '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrorMsg(null);

    if (!english.trim() || !vietnamese.trim() || !japanese.trim()) {
      setErrorMsg('english / vietnamese / japanese は必須項目です');
      return;
    }

    updateWord.mutate(
      {
        id: word.id,
        input: {
          word_set_id: wordSetId,
          english: english.trim(),
          vietnamese: vietnamese.trim(),
          japanese: japanese.trim(),
          example_en: exampleEn.trim() || null,
          example_vi: exampleVi.trim() || null,
          example_ja: exampleJa.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: (err) => {
          setErrorMsg(err.message);
        },
      }
    );
  };

  const handleDelete = (): void => {
    deleteWord.mutate(word.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
      },
    });
  };

  const getLevelLabel = (setId: number) => {
    switch (setId) {
      case 1: return { text: 'Basic', className: styles.badgeBasic };
      case 2: return { text: 'Intermediate', className: styles.badgeIntermediate };
      case 3: return { text: 'Advanced', className: styles.badgeAdvanced };
      default: return { text: 'Unknown', className: styles.badgeUnknown };
    }
  };
  const level = getLevelLabel(word.word_set_id);

  if (isEditing) {
    return (
      <li className={styles.editRow}>
        <form onSubmit={handleUpdate} className={styles.editForm}>
          <h4>
            <span className="vi-content">Sửa từ vựng</span>
            <span className="ja-content">単語編集</span>
          </h4>
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ gridColumn: 'span 3' }}>
              <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '4px' }}>
                <span className="vi-content">Cấp độ</span>
                <span className="ja-content">レベル/単語セット</span>
              </label>
              <select
                className={styles.select}
                value={wordSetId}
                onChange={(e) => setWordSetId(Number(e.target.value))}
              >
                <option value={1}>Basic (はじめての単語)</option>
                <option value={2}>Intermediate (表現をひろげる)</option>
                <option value={3}>Advanced (もっと深く学ぶ)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                className={styles.input}
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                placeholder="English"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                className={styles.input}
                value={vietnamese}
                onChange={(e) => setVietnamese(e.target.value)}
                placeholder="Tiếng Việt"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                className={styles.input}
                value={japanese}
                onChange={(e) => setJapanese(e.target.value)}
                placeholder="日本語"
                required
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              className={styles.input}
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
              placeholder="Example (English)"
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              className={styles.input}
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
              placeholder="Ví dụ (Tiếng Việt)"
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              className={styles.input}
              value={exampleJa}
              onChange={(e) => setExampleJa(e.target.value)}
              placeholder="例文 (日本語)"
            />
          </div>
          <div className={styles.editFormButtons}>
            <button type="submit" className={styles.updateButton} disabled={updateWord.isPending}>
              <span className="vi-content">Cập nhật</span>
              <span className="ja-content">更新</span>
            </button>
            <button type="button" className={styles.cancelButton} onClick={() => setIsEditing(false)}>
              <span className="vi-content">Hủy</span>
              <span className="ja-content">キャンセル</span>
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={styles.wordRow}>
      <div className={styles.wordInfo}>
        <div className={styles.wordHeader}>
          <span className={styles.wordEnglish}>{word.english}</span>
          <span className={`${styles.levelBadge} ${level.className}`}>{level.text}</span>
        </div>
        <div className={styles.wordTranslations}>
          <span className={`${styles.wordTranslation} vi-content`}>{word.vietnamese}</span>
          <span className={`${styles.wordTranslation} ja-content`}>{word.japanese}</span>
        </div>
      </div>

      <div className={styles.rowActions}>
        <button
          type="button"
          className={styles.actionIconButton}
          onClick={() => setIsEditing(true)}
          aria-label="編集"
        >
          ✏️
        </button>
        <button
          type="button"
          className={styles.actionIconButton}
          onClick={() => setShowDeleteConfirm(true)}
          aria-label="削除"
        >
          🗑
        </button>
      </div>

      {showDeleteConfirm && (
        <div className={styles.dialog}>
          <div className={styles.dialogBox}>
            <p className={styles.dialogText}>
              <span className="vi-content">Bạn có chắc chắn muốn xóa từ "{word.english}"?</span>
              <span className="ja-content">この単語「{word.english}」を削除してもよろしいですか？</span>
            </p>
            <div className={styles.dialogButtons}>
              <button
                type="button"
                className={styles.confirmDeleteButton}
                onClick={handleDelete}
                disabled={deleteWord.isPending}
              >
                <span className="vi-content">Xóa</span>
                <span className="ja-content">削除</span>
              </button>
              <button
                type="button"
                className={styles.dialogCancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                <span className="vi-content">Hủy</span>
                <span className="ja-content">キャンセル</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}



export function AdminPage() {
  const [creds, setCreds] = useState<AdminCredentials | null>(null);
  const { data: words, error, isLoading } = useAdminWords(creds);
  const [filterSetId, setFilterSetId] = useState<number | 'all'>('all');
  const [language, setLanguage] = useState<'vi' | 'ja'>(() => {
    return (localStorage.getItem('language') as 'vi' | 'ja') ?? 'vi';
  });

  useEffect(() => {
    document.body.dataset['lang'] = language;
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    if (error?.message === 'UNAUTHORIZED') {
      setCreds(null);
    }
  }, [error]);

  const handleLanguageToggle = (): void => {
    setLanguage((l) => (l === 'vi' ? 'ja' : 'vi'));
  };

  if (!creds) {
    return (
      <CredentialsForm
        onSubmit={setCreds}
        errorMessage={error?.message === 'UNAUTHORIZED' ? 'Tài khoản hoặc mật khẩu sai' : null}
        language={language}
        onLanguageToggle={handleLanguageToggle}
      />
    );
  }

  const filteredWords = words?.filter(
    (w) => filterSetId === 'all' || w.word_set_id === filterSetId
  );

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>
          <span className="vi-content">Quản trị</span>
          <span className="ja-content">管理画面</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LanguageToggle language={language} onToggle={handleLanguageToggle} />
          <a href="/" className={styles.studyLink}>
            <span className="vi-content">← Học</span>
            <span className="ja-content">← 学習へ</span>
          </a>
        </div>
      </header>

      <AddWordForm creds={creds} />

      <section className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2 className={styles.sectionTitle}>
            <span className="vi-content">Danh sách từ vựng</span>
            <span className="ja-content">単語一覧</span>
          </h2>
          <div className={styles.filterGroup}>
            <label htmlFor="level-filter">
              <span className="vi-content">Lọc theo: </span>
              <span className="ja-content">レベルで絞り込み: </span>
            </label>
            <select
              id="level-filter"
              className={styles.filterSelect}
              value={filterSetId}
              onChange={(e) => setFilterSetId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">
                {language === 'vi' ? 'Tất cả' : 'すべて'}
              </option>
              <option value={1}>
                {language === 'vi' ? 'Basic (Bắt đầu)' : 'Basic (はじめての単語)'}
              </option>
              <option value={2}>
                {language === 'vi' ? 'Intermediate (Mở rộng)' : 'Intermediate (表現をひろげる)'}
              </option>
              <option value={3}>
                {language === 'vi' ? 'Advanced (Chuyên sâu)' : 'Advanced (もっと深く学ぶ)'}
              </option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className={styles.status}>
            <span className="vi-content">Đang tải...</span>
            <span className="ja-content">読み込み中...</span>
          </div>
        )}
        {error && error.message !== 'UNAUTHORIZED' && (
          <div className={styles.status}>
            <span className="vi-content">Đã xảy ra lỗi. Vui lòng tải lại trang.</span>
            <span className="ja-content">エラーが発生しました。再読み込みしてください。</span>
          </div>
        )}
        <ul className={styles.wordList}>
          {filteredWords?.map((w) => (
            <WordRow key={w.id} word={w} creds={creds} />
          ))}
        </ul>
      </section>
    </div>
  );
}


