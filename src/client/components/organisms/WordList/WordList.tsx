import React, { useEffect, useState } from 'react';
import { WordListItem } from '../../molecules/WordListItem';
import { Button } from '../../atoms/Button';
import { Text } from '../../atoms/Text';
import { SuccessToast } from '../../molecules/SuccessToast';
import { useWords } from '../../../hooks/useWords';
import { authedFetch } from '../../../lib/authedFetch';
import type { WordWithProgress } from '@shared/types';
import styles from './WordList.module.css';

interface Props {
  userId: number | null;
  wordSetId: number | null;
  page?: number;
  onRefetchTrigger?: (refetchFn: () => void) => void;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const Pagination = ({ page, totalPages, onPrev, onNext }: PaginationProps): React.ReactElement => {
  return (
    <nav aria-label="ページネーション" className={styles.pagination}>
      <Button
        variant="soft"
        size="sm"
        onClick={onPrev}
        disabled={page <= 1}
        aria-label="前のページ"
      >
        {'< 前へ (Trước)'}
      </Button>
      <Text variant="hint" className={styles.pageInfo}>
        {page} / {totalPages} trang (ページ)
      </Text>
      <Button
        variant="soft"
        size="sm"
        onClick={onNext}
        disabled={page >= totalPages}
        aria-label="次のページ"
      >
        {'次へ (Sau) >'}
      </Button>
    </nav>
  );
};

export const WordList = ({ userId, wordSetId, page: initialPage = 1, onRefetchTrigger }: Props): React.ReactElement => {
  const [page, setPage] = useState(initialPage);
  const { data, isLoading, error, refetch, createWord, updateWord, deleteWord } = useWords({ userId, wordSetId, page, limit: 10 });

  // フォーム関連の状態
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingWord, setEditingWord] = useState<WordWithProgress | null>(null);
  const [formData, setFormData] = useState({
    english: '',
    vietnamese: '',
    japanese: '',
    example_en: '',
    example_vi: '',
    example_ja: '',
  });

  // サジェスト関連の状態
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 削除確認モーダルの状態
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingWordId, setDeletingWordId] = useState<number | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  // 成功トーストの状態
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (onRefetchTrigger) {
      onRefetchTrigger(refetch);
    }
  }, [onRefetchTrigger, refetch]);

  // デバウンス用のタイマー (オートコンプリート)
  useEffect(() => {
    if (formData.english.trim().length < 2 || formMode === 'edit') {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await authedFetch(`/api/dictionary/search?q=${encodeURIComponent(formData.english)}`);
        if (res.ok) {
          const s = await res.json();
          setSuggestions(s);
          setShowSuggestions(s.length > 0);
        }
      } catch (err) {
        console.error('辞書検索エラー:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.english, formMode]);

  const handleSelectSuggest = async (english: string) => {
    setFormData((prev) => ({ ...prev, english }));
    setShowSuggestions(false);
    try {
      const res = await authedFetch(`/api/dictionary/lookup?english=${encodeURIComponent(english)}`);
      if (res.ok) {
        const word = await res.json();
        setFormData({
          english: word.english,
          vietnamese: word.vietnamese,
          japanese: word.japanese,
          example_en: word.example_en || '',
          example_vi: word.example_vi || '',
          example_ja: word.example_ja || '',
        });
      }
    } catch (err) {
      console.error('辞書の詳細取得エラー:', err);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      english: '',
      vietnamese: '',
      japanese: '',
      example_en: '',
      example_vi: '',
      example_ja: '',
    });
    setFormMode('create');
    setEditingWord(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (word: WordWithProgress) => {
    setFormData({
      english: word.english,
      vietnamese: word.vietnamese,
      japanese: word.japanese,
      example_en: word.example_en || '',
      example_vi: word.example_vi || '',
      example_ja: word.example_ja || '',
    });
    setFormMode('edit');
    setEditingWord(word);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    setDeletingWordId(id);
    setIsConfirmOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.english.trim() || !formData.vietnamese.trim() || !formData.japanese.trim()) {
      setFormError('英単語、ベトナム語訳、日本語訳は必須です');
      return;
    }

    try {
      if (formMode === 'create') {
        await createWord({
          word_set_id: wordSetId!,
          english: formData.english.trim(),
          vietnamese: formData.vietnamese.trim(),
          japanese: formData.japanese.trim(),
          example_en: formData.example_en.trim() || null,
          example_vi: formData.example_vi.trim() || null,
          example_ja: formData.example_ja.trim() || null,
        });
        showSuccessToast('あたらしい単語を覚えたよ！いっしょにがんばろう🍓');
      } else if (formMode === 'edit' && editingWord) {
        await updateWord({
          id: editingWord.id,
          input: {
            word_set_id: wordSetId!,
            english: formData.english.trim(),
            vietnamese: formData.vietnamese.trim(),
            japanese: formData.japanese.trim(),
            example_en: formData.example_en.trim() || null,
            example_vi: formData.example_vi.trim() || null,
            example_ja: formData.example_ja.trim() || null,
          }
        });
        showSuccessToast('単語を更新したよ！🍓');
      }
      setIsFormOpen(false);
      refetch();
    } catch (err: any) {
      setFormError(err.message || '操作に失敗しました');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingWordId !== null) {
      try {
        await deleteWord(deletingWordId);
        showSuccessToast('単語とおわかれしたよ。つぎの単語もがんばろう🍓');
        setIsConfirmOpen(false);
        refetch();
      } catch (err: any) {
        alert(err.message || '削除に失敗しました');
      }
    }
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleNext = (): void => {
    setPage((p) => p + 1);
  };

  const handlePrev = (): void => {
    setPage((p) => Math.max(1, p - 1));
  };

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <div className={styles.loader} />
        <Text variant="body" className={styles.loadingText}>
          Đang tải... (読み込み中)
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <Text variant="body" className={styles.errorText}>
          読み込みに失敗しました。再試行してください。
        </Text>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            refetch();
          }}
          className={styles.retryButton}
        >
          再試行 (Thử lại)
        </Button>
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.listHeader}>
        <Text variant="heading" as="h3" className={styles.title}>
          Danh sách từ (単語リスト)
        </Text>
        {userId && wordSetId && (
          <button className={styles.createBtn} onClick={handleOpenCreate}>
            ＋ 単語を追加
          </button>
        )}
      </div>
      
      {!data || data.words.length === 0 ? (
        <div className={styles.centered}>
          <Text variant="body" className={styles.emptyText}>
            Chưa có từ vựng nào được đăng ký. (まだ単語が登録されていません)
          </Text>
        </div>
      ) : (
        <>
          <ol className={styles.list}>
            {data.words.map((word) => (
              <li key={word.id} className={styles.listItem}>
                <WordListItem 
                  word={word} 
                  userId={userId} 
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              </li>
            ))}
          </ol>
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </>
      )}

      {/* フォームモーダル */}
      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsFormOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {formMode === 'create' ? 'あたらしい単語をおぼえる🍓' : '単語を編集する✏️'}
            </h3>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>英単語 (English)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.english} 
                  onChange={(e) => {
                    setFormData({ ...formData, english: e.target.value });
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  placeholder="例: strawberry"
                  autoComplete="off"
                />
                
                {/* 辞書オートコンプリート */}
                {showSuggestions && (suggestions.length > 0 || isSearching) && (
                  <ul className={styles.suggestionsList}>
                    {isSearching && <li className={styles.searchingText}>さがしちゅう…🍓</li>}
                    {suggestions.map((s) => (
                      <li 
                        key={s.id} 
                        className={styles.suggestionItem}
                        onClick={() => handleSelectSuggest(s.english)}
                      >
                        <strong>{s.english}</strong> - {s.japanese}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>日本語訳 (Japanese)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.japanese} 
                  onChange={(e) => setFormData({ ...formData, japanese: e.target.value })}
                  placeholder="例: イチゴ"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>ベトナム語訳 (Vietnamese)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.vietnamese} 
                  onChange={(e) => setFormData({ ...formData, vietnamese: e.target.value })}
                  placeholder="例: Quả dâu tây"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>例文 (英語)</label>
                <textarea 
                  className={styles.textarea} 
                  value={formData.example_en} 
                  onChange={(e) => setFormData({ ...formData, example_en: e.target.value })}
                  placeholder="例: I love eating strawberries."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>例文訳 (日本語)</label>
                <textarea 
                  className={styles.textarea} 
                  value={formData.example_ja} 
                  onChange={(e) => setFormData({ ...formData, example_ja: e.target.value })}
                  placeholder="例: 私はイチゴを食べるのが大好きです。"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>例文訳 (ベトナム語)</label>
                <textarea 
                  className={styles.textarea} 
                  value={formData.example_vi} 
                  onChange={(e) => setFormData({ ...formData, example_vi: e.target.value })}
                  placeholder="例: Tôi thích ăn dâu tây."
                />
              </div>

              {formError && <p className={styles.errorText}>{formError}</p>}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsFormOpen(false)}>
                  キャンセル
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {formMode === 'create' ? 'おぼえる！' : 'ほぞんする'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {isConfirmOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsConfirmOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>おわかれの確認 🍓</h3>
            <p className={styles.confirmText}>
              この単語と、おわかれする？<br />
              <span className={styles.warningText}>（いままでの学習データも消えちゃいます）</span>
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsConfirmOpen(false)}>
                やっぱりいっしょにいる！
              </button>
              <button className={`${styles.submitBtn} ${styles.deleteConfirmBtn}`} onClick={handleDeleteConfirm}>
                バイバイする
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成功トースト */}
      <SuccessToast message={toastMessage} visible={toastVisible} />
    </section>
  );
};
