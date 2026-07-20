import React, { useEffect, useState, useRef } from 'react';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { UndoButton } from '../../atoms/UndoButton';
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
  onUndo?: () => void;
  canUndo?: boolean;
}

export const FlashCard = ({
  word,
  isAnswerVisible,
  onShowAnswer,
  onGood,
  onAgain,
  isSubmitting,
  bounceTrigger = 0,
  onUndo,
  canUndo = false,
}: Props): React.ReactElement => {
  const [isBouncing, setIsBouncing] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });

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

  // Touch Gesture Handling for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSubmitting) return;
    const touch = e.touches[0];
    if (touch) {
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current || isSubmitting) return;
    const touch = e.touches[0];
    if (touch) {
      const offsetX = touch.clientX - touchStart.current.x;
      const offsetY = touch.clientY - touchStart.current.y;
      
      // Allow visual swipe drag only when answer is visible (ready to review)
      if (isAnswerVisible) {
        setSwipeOffset({ x: offsetX, y: offsetY });
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || isSubmitting) return;
    const minSwipe = 80; // minimum swipe distance in px to trigger action
    
    if (isAnswerVisible) {
      if (swipeOffset.x > minSwipe) {
        // Swipe Right -> Good
        onGood();
      } else if (swipeOffset.x < -minSwipe) {
        // Swipe Left -> Again
        onAgain();
      }
    }
    
    touchStart.current = null;
    setSwipeOffset({ x: 0, y: 0 });
  };

  // Visual card style during swipe
  const cardStyle: React.CSSProperties = isAnswerVisible ? {
    transform: `rotateY(180deg) translate3d(${swipeOffset.x}px, ${swipeOffset.y * 0.2}px, 0) rotate(${swipeOffset.x * 0.05}deg)`,
    transition: touchStart.current ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  } : {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {onUndo && (
          <UndoButton onClick={onUndo} disabled={!canUndo || isSubmitting} />
        )}
      </div>

      <div
        className={cardClasses}
        onClick={handleCardClick}
        role="button"
        tabIndex={!isAnswerVisible ? 0 : undefined}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={cardStyle}
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
