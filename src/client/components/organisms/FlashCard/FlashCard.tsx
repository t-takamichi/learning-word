import React, { useEffect, useState } from 'react';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { AudioButton } from '../../molecules/AudioButton';
import { ReviewButtons } from '../../molecules/ReviewButtons';
import type { Word } from '@shared/types';
import styles from './FlashCard.module.css';

interface Props {
  word: Word;
  isAnswerVisible: boolean;
  onShowAnswer: () => void;
  onGood: () => void;
  onAgain: () => void;
  isSubmitting: boolean;
  bounceTrigger?: number;
}

export const FlashCard = ({
  word,
  isAnswerVisible,
  onShowAnswer,
  onGood,
  onAgain,
  isSubmitting,
  bounceTrigger = 0,
}: Props): React.ReactElement => {
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (bounceTrigger > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => {
        setIsBouncing(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [bounceTrigger]);

  const cardClasses = [
    styles.card,
    isAnswerVisible ? styles.flipped : '',
    isBouncing ? styles.bounce : '',
  ].filter(Boolean).join(' ');

  const handleCardClick = (): void => {
    if (!isAnswerVisible) {
      onShowAnswer();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!isAnswerVisible && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onShowAnswer();
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={cardClasses}
        onClick={handleCardClick}
        role="button"
        tabIndex={!isAnswerVisible ? 0 : undefined}
        onKeyDown={handleKeyDown}
        aria-label={isAnswerVisible ? 'Card Back (Answer Visible)' : 'Card Front. Tap to flip'}
      >
        <div className={styles.cardInner}>
          {/* Front Side */}
          <div className={styles.front}>
            <div className={styles.wordWrapper}>
              <Text variant="word" className={styles.english}>
                {word.english}
              </Text>
              <div className={styles.audioWrapper}>
                <AudioButton word={word.english} size="md" />
              </div>
            </div>
            {!isAnswerVisible && (
              <Text variant="hint" className={styles.tapHint}>
                タップして答えを表示
              </Text>
            )}
          </div>

          {/* Back Side */}
          <div className={styles.back}>
            <div className={styles.wordWrapper}>
              <Text variant="word" className={styles.english}>
                {word.english}
              </Text>
              <div className={styles.audioWrapper}>
                <AudioButton word={word.english} size="md" />
              </div>
            </div>
            <div className={styles.divider} />
            
            <div className={styles.translations}>
              <Text variant="translation" className="vi-content">
                {word.vietnamese}
              </Text>
              <Text variant="translation" className="ja-content">
                {word.japanese}
              </Text>
            </div>

            {word.example_en && (
              <div className={styles.examples}>
                <Text variant="body" className={styles.exampleEn}>
                  {word.example_en}
                </Text>
                {word.example_vi && (
                  <Text variant="hint" className="vi-content">
                    {word.example_vi}
                  </Text>
                )}
                {word.example_ja && (
                  <Text variant="hint" className="ja-content">
                    {word.example_ja}
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className={styles.footer}>
        {!isAnswerVisible ? (
          <Button
            variant="soft"
            size="md"
            onClick={onShowAnswer}
            className={styles.showAnswerBtn}
          >
            こたえを見る
          </Button>

        ) : (
          <ReviewButtons
            onGood={onGood}
            onAgain={onAgain}
            disabled={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};
