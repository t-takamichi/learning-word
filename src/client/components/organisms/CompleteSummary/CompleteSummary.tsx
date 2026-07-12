import React from 'react';
import { Mascot } from '../../atoms/Mascot';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { StatItem } from '../../molecules/StatItem';
import styles from './CompleteSummary.module.css';

interface Props {
  total: number;
  correct: number;
  bestCombo: number;
  onRestart: () => void;
  onWordList: () => void;
  onNavigateToWordSets?: () => void;
  className?: string;
}

export const CompleteSummary = ({
  total,
  correct,
  bestCombo,
  onRestart,
  onWordList,
  onNavigateToWordSets,
  className = '',
}: Props): React.ReactElement => {
  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <Mascot mood="cheer" size={96} className={styles.mascot} />

      <Text variant="word" as="h1" className={styles.title}>
        ぜんぶできたね！
      </Text>
      <Text variant="body" className={styles.message}>
        10単語の学習セッションが完了しました。よくがんばりました！🍓
      </Text>

      <div className={styles.stats}>
        <StatItem label="学習単語数" value={total} />
        <StatItem label="できた！" value={correct} />
        <StatItem label="最高コンボ" value={bestCombo} />
      </div>

      <div className={styles.actions}>
        <Button variant="primary" size="lg" onClick={onRestart} className={styles.button}>
          もう一度れんしゅう
        </Button>
        <Button variant="soft" size="lg" onClick={onWordList} className={styles.button}>
          単語リストを見る
        </Button>
        {onNavigateToWordSets && (
          <Button variant="soft" size="lg" onClick={onNavigateToWordSets} className={styles.button}>
            レベル選択へもどる
          </Button>
        )}

      </div>
    </div>
  );
};

