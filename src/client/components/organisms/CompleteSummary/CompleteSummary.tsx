import React from 'react';
import { Mascot } from '../../atoms/Mascot';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { StatItem } from '../../molecules/StatItem';
import styles from './CompleteSummary.module.css';

interface Props {
  readonly total: number;
  readonly correct: number;
  readonly bestCombo: number;
  readonly onRestart: () => void;
  readonly onWordList: () => void;
  readonly onNavigateToWordSets?: () => void;
  readonly onNavigateToUsers?: () => void;
  readonly onNextSet?: () => void;
  readonly className?: string;
}

export function CompleteSummary({
  total,
  correct,
  bestCombo,
  onRestart,
  onWordList,
  onNavigateToWordSets,
  onNavigateToUsers,
  onNextSet,
  className = '',
}: Props): React.ReactElement {
  const percent = Math.min(100, Math.round((correct / total) * 100));

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <Mascot expression="happy" />

      <Text variant="word" as="h1" className={styles.title}>
        ぜんぶできたね！
      </Text>
      <Text variant="body" className={styles.message}>
        学習セッションが完了しました。よくがんばりました！🍓
      </Text>

      {/* Goal Progress Gauge */}
      <div className={styles.goalSection}>
        <div className={styles.goalLabel}>きょうの目標達成度 🌟</div>
        <div className={styles.progressBarBg}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className={styles.goalText}>
          {correct} / {total} 単語できたよ！ ({percent}%)
          {percent >= 100 && ' 🌸 目標クリア！おめでとう！ 🌸'}
        </div>
      </div>

      <div className={styles.stats}>
        <StatItem label="学習単語数" value={total} />
        <StatItem label="できた！" value={correct} />
        <StatItem label="最高コンボ" value={bestCombo} />
      </div>

      <div className={styles.actions}>
        {onNextSet && (
          <Button variant="primary" size="lg" onClick={onNextSet} className={styles.button}>
            次のおすすめセットに挑戦！🌸
          </Button>
        )}
        <Button variant="soft" size="lg" onClick={onRestart} className={styles.button}>
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
        {onNavigateToUsers && (
          <Button variant="soft" size="lg" onClick={onNavigateToUsers} className={styles.button}>
            👤 つぎはだれの番？ (交代する)
          </Button>
        )}
      </div>
    </div>
  );
}
