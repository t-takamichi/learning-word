import React, { useEffect, useState } from 'react';
import { WordListItem } from '../../molecules/WordListItem';
import { Button } from '../../atoms/Button';
import { Text } from '../../atoms/Text';
import { useWords } from '../../../hooks/useWords';
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
  const { data, isLoading, error, refetch } = useWords({ userId, wordSetId, page, limit: 10 });

  useEffect(() => {
    if (onRefetchTrigger) {
      onRefetchTrigger(refetch);
    }
  }, [onRefetchTrigger, refetch]);

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

  if (!data || data.words.length === 0) {
    return (
      <div className={styles.centered}>
        <Text variant="body" className={styles.emptyText}>
          Chưa có từ vựng nào được đăng ký. (まだ単語が登録されていません)
        </Text>
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <Text variant="heading" as="h3" className={styles.title}>
        Danh sách từ vựng (単語リスト)
      </Text>
      <ol className={styles.list}>
        {data.words.map((word) => (
          <li key={word.id} className={styles.listItem}>
            <WordListItem word={word} userId={userId} />
          </li>
        ))}
      </ol>
      <Pagination
        page={page}
        totalPages={data.totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </section>
  );
};
