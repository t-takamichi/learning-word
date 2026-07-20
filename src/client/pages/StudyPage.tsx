import React, { useState, useEffect } from 'react';
import { useSession } from '../hooks/useSession';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { useSpeech } from '../hooks/useSpeech';
import { useSound } from '../hooks/useSound';
import { useUsers } from '../hooks/useUsers';
import { useWordSets } from '../hooks/useWordSets';
import { UserNav } from '../components/organisms/UserNav';
import { navigateTo } from '../lib/navigation';

// Atoms
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';

// Molecules
import { LanguageToggle } from '../components/molecules/LanguageToggle';
import { SuccessToast } from '../components/molecules/SuccessToast';

// Organisms
import { FlashCard } from '../components/organisms/FlashCard';
import { WordList } from '../components/organisms/WordList';
import { SessionHeader } from '../components/organisms/SessionHeader';
import { CelebrationOverlay } from '../components/organisms/CelebrationOverlay';
import { CompleteSummary } from '../components/organisms/CompleteSummary';
import { AutoPlayControls } from '../components/organisms/AutoPlayControls';

// Templates
import { StudyTemplate } from '../components/templates/StudyTemplate';
import { CompleteTemplate } from '../components/templates/CompleteTemplate';

import styles from './StudyPage.module.css';

type Language = 'vi' | 'ja';

export function StudyPage(): React.ReactElement | null {
  const [mode, setMode] = useState<'list' | 'study'>('list');
  const [isListVisible, setIsListVisible] = useState(true);
  const [language, setLanguage] = useState<Language>('vi');
  const { activeUser, activeUserId, clearActiveUser } = useUsers();
  const { activeWordSet, activeWordSetId, wordSets, selectWordSet } = useWordSets(activeUserId);

  const {
    words,
    currentIndex,
    isAnswerVisible,
    isComplete,
    isLoading,
    error,
    isSubmitting,
    canUndo,
    showAnswer,
    submitReview,
    restart,
    undo,
  } = useSession(activeUserId, activeWordSetId);

  const speech = useSpeech();
  const { play, unlock, isUnlocked } = useSound();
  const [audioLocked, setAudioLocked] = useState(true);

  useEffect(() => {
    setAudioLocked(!isUnlocked());
  }, [isUnlocked]);

  // Local stats for gamification
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  // Bounce and Sparkle effects trigger
  const [bounceTrigger, setBounceTrigger] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Celebration Overlay state
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [celebrationVariant, setCelebrationVariant] = useState<'combo' | 'complete'>('combo');
  const [celebrationComboCount, setCelebrationComboCount] = useState(0);

  const [autoPlayFrontDelay, setAutoPlayFrontDelay] = useState(3);
  const [autoPlayBackDelay, setAutoPlayBackDelay] = useState(4);
  const lastSpokenWordIdRef = React.useRef<number | null>(null);

  const { isAutoPlay, toggleAutoPlay } = useAutoPlay({
    words,
    currentIndex,
    isAnswerVisible,
    showAnswer,
    goNext: () => handleGood(),
    speech,
    frontDelay: autoPlayFrontDelay,
    backDelay: autoPlayBackDelay,
  });

  // Unlock the AudioContext on user interaction.
  // resume() is async and Chrome/Safari may ignore the first attempt, so we
  // retry on every gesture (pointerdown/touchend/keydown) and only detach the
  // listeners once the context is actually running.
  useEffect(() => {
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'touchend', 'keydown'];
    const handleInteraction = (): void => {
      unlock();
      if (isUnlocked()) {
        events.forEach((evt) => document.removeEventListener(evt, handleInteraction));
      }
    };
    events.forEach((evt) => document.addEventListener(evt, handleInteraction));
    return () => {
      events.forEach((evt) => document.removeEventListener(evt, handleInteraction));
    };
  }, [unlock, isUnlocked]);

  // Language side effect
  useEffect(() => {
    document.body.dataset['lang'] = language;
  }, [language]);

  // Pronounce word and example slowly when flipping card manually
  useEffect(() => {
    const currentWord = words[currentIndex];
    if (!isAutoPlay && isAnswerVisible && currentWord) {
      if (lastSpokenWordIdRef.current !== currentWord.id) {
        lastSpokenWordIdRef.current = currentWord.id;
        const textToSpeak = currentWord.example_en 
          ? `${currentWord.english}. ${currentWord.example_en}`
          : currentWord.english;
        speech.speak(textToSpeak, undefined, 0.8);
      }
    }
  }, [isAutoPlay, isAnswerVisible, words, currentIndex, speech]);

  // Reset lastSpokenWordIdRef when answer is hidden (returned to front side)
  useEffect(() => {
    if (!isAnswerVisible) {
      lastSpokenWordIdRef.current = null;
    }
  }, [isAnswerVisible]);

  // Complete screen triggers complete celebration
  useEffect(() => {
    if (isComplete) {
      play('complete');
      setCelebrationVariant('complete');
      setCelebrationActive(true);
    }
  }, [isComplete, play]);

  const handleLanguageToggle = (): void => {
    setLanguage((prev) => (prev === 'vi' ? 'ja' : 'vi'));
  };

  const triggerCelebration = (v: 'combo' | 'complete', count: number = 0): void => {
    setCelebrationVariant(v);
    setCelebrationComboCount(count);
    setCelebrationActive(true);
  };

  const handleGood = (): void => {
    // 1. Audio
    play('correct');

    // 2. Bounce & Sparkle
    setBounceTrigger((prev) => prev + 1);

    // 3. SuccessToast
    const messages = ['Nice!', 'いいね！', 'その調子！', 'さすが！'];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setToastMessage(randomMsg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 1800);

    // 4. Haptic
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    // 5. Update Local Stats
    setStreak((prev) => {
      const next = prev + 1;
      if (next > bestCombo) {
        setBestCombo(next);
      }
      if (next === 3 || next === 5 || next === 10) {
        triggerCelebration('combo', next);
      }
      return next;
    });
    setCorrectCount((prev) => prev + 1);

    // Submit review
    submitReview('good');
  };

  const handleAgain = (): void => {
    // 1. Audio
    play('again');

    // 2. SuccessToast (gentle message)
    setToastMessage('だいじょうぶ、もういちど♪');
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 1800);

    // 3. Reset streak
    setStreak(0);

    // Submit review
    submitReview('again');
  };

  const handleUndo = (): void => {
    play('undo');
    undo();
    setStreak((prev) => Math.max(0, prev - 1));
    setCorrectCount((prev) => Math.max(0, prev - 1));
  };

  const handleRestart = (): void => {
    setStreak(0);
    setCorrectCount(0);
    setBestCombo(0);
    setCelebrationActive(false);
    restart();
  };

  const handleNavigateToUsers = (): void => {
    play('tap');
    clearActiveUser();
    navigateTo('/users');
  };

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <div className={styles.loader} />
        <Text variant="body" className={styles.loadingText}>
          じゅんびちゅう…
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <Text variant="body" className={styles.errorText}>
          よみこめなかったみたい。もういちどためしてね。
        </Text>
        <Button variant="primary" size="sm" onClick={handleRestart}>
          もういちどためす
        </Button>
      </div>
    );
  }

  if (isComplete) {
    const getNextWordSetId = (): number | null => {
      if (!activeWordSetId || wordSets.length === 0) return null;
      const curIndex = wordSets.findIndex(s => s.id === activeWordSetId);
      if (curIndex === -1 || curIndex === wordSets.length - 1) return null;
      return wordSets[curIndex + 1].id;
    };

    const nextWordSetId = getNextWordSetId();
    const handleNextSet = nextWordSetId ? () => {
      selectWordSet(nextWordSetId);
      handleRestart();
    } : undefined;

    return (
      <CompleteTemplate
        summary={
          <CompleteSummary
            total={words.length}
            correct={correctCount}
            bestCombo={bestCombo}
            onRestart={handleRestart}
            onWordList={() => {
              const el = document.getElementById('word-list-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onNavigateToWordSets={() => navigateTo('/levels')}
            onNavigateToUsers={handleNavigateToUsers}
            onNextSet={handleNextSet}
          />
        }

        list={
          <div id="word-list-section">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <LanguageToggle language={language} onToggle={handleLanguageToggle} />
            </div>
            <WordList userId={activeUserId} wordSetId={activeWordSetId} />
          </div>
        }
        overlay={null}
      />
    );
  }

  if (words.length === 0) {
    return (
      <div className={styles.centered}>
        <Text variant="body" className={styles.emptyText}>
          単語がありません。
        </Text>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  if (!currentWord) return null;

  const handleStartStudy = (): void => {
    setMode('study');
  };

  const handleBackToList = (): void => {
    setMode('list');
  };

  const uiText = {
    vi: {
      wordList: 'Danh sách từ',
      studyButton: '🎓 Luyện tập',
      studyLabel: 'Từ đang học',
    },
    ja: {
      wordList: '単語リスト',
      studyButton: '🎓 練習を開始する',
      studyLabel: '学習中の単語',
    }
  };

  if (mode === 'list') {
    return (
      <div className={styles.listModeContainer}>
        {/* ヘッダー */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.backButton} onClick={() => navigateTo('/levels')}>
              &lt;
            </span>
            <Text variant="heading" as="h2" className={styles.titleText}>
              {activeWordSet ? activeWordSet.name : 'Word Set'}
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageToggle language={language} onToggle={handleLanguageToggle} />
            {activeUser && (
              <UserNav
                username={activeUser.username}
                activeWordSetName={activeWordSet ? activeWordSet.name : null}
                onNavigateToUsers={() => navigateTo('/users')}
                onNavigateToWordSets={() => navigateTo('/levels')}
              />
            )}
          </div>
        </header>

        {/* トップ簡易表示カード */}
        <div className={styles.topSimpleCard}>
          <div className={styles.topCardInner}>
            <span className={styles.topCardTag}>{uiText[language].studyLabel}</span>
            <Text variant="heading" className={styles.topWordTitle}>
              {currentWord.english}
            </Text>
            <div className={styles.topSpeakBtn}>
              <button
                onClick={() => speech.speak(currentWord.english)}
                className={styles.speechIconButton}
                aria-label="Speak word"
              >
                🔊
              </button>
            </div>
          </div>
        </div>

        {/* リストコントロール */}
        <div className={styles.listControls}>
          <div className={styles.toggleWrapper}>
            <span className={styles.toggleLabel}>{uiText[language].wordList}</span>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={isListVisible}
                onChange={(e) => setIsListVisible(e.target.checked)}
              />
              <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
          </div>
        </div>

        {/* 単語リスト */}
        {isListVisible && (
          <div className={styles.wordListScrollContainer}>
            <WordList userId={activeUserId} wordSetId={activeWordSetId} />
          </div>
        )}

        {/* 練習する固定ボタン */}
        <div className={styles.fixedFooter}>
          <button onClick={handleStartStudy} className={styles.luyenTapButton}>
            {uiText[language].studyButton}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'study' && audioLocked) {
    return (
      <div className={styles.centered}>
        <div className={styles.unlockOverlay}>
          <div style={{ fontSize: '48px' }}>🍓</div>
          <h2 className={styles.unlockTitle}>学習をスタート！</h2>
          <p className={styles.unlockText}>
            タップすると、ベリーちゃんのこえや<br />
            せいかいの効果音がながれるよ♪
          </p>
          <button
            type="button"
            className={styles.unlockBtn}
            onClick={() => {
              unlock();
              setAudioLocked(false);
              play('tap');
            }}
          >
            スタート！🍓
          </button>
        </div>
      </div>
    );
  }

  return (
    <StudyTemplate
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleBackToList} className={styles.backToOverviewBtn} aria-label="Back to overview">
              ← リスト
            </button>
            <SessionHeader
              current={currentIndex}
              total={words.length}
              streak={streak}
            />
          </div>
          {activeUser && (
            <UserNav
              username={activeUser.username}
              activeWordSetName={activeWordSet ? activeWordSet.name : null}
              onNavigateToUsers={() => navigateTo('/users')}
              onNavigateToWordSets={() => navigateTo('/levels')}
            />
          )}
        </div>
      }
      card={
        <FlashCard
          word={currentWord}
          isAnswerVisible={isAnswerVisible}
          onShowAnswer={showAnswer}
          onGood={handleGood}
          onAgain={handleAgain}
          isSubmitting={isSubmitting}
          bounceTrigger={bounceTrigger}
          onUndo={handleUndo}
          canUndo={canUndo}
        />
      }
      autoPlay={
        <AutoPlayControls
          isAutoPlay={isAutoPlay}
          onToggleAutoPlay={toggleAutoPlay}
          frontDelay={autoPlayFrontDelay}
          backDelay={autoPlayBackDelay}
          onChangeFrontDelay={setAutoPlayFrontDelay}
          onChangeBackDelay={setAutoPlayBackDelay}
        />
      }
      list={null}
      overlay={
        <>
          <CelebrationOverlay
            active={celebrationActive && celebrationVariant === 'combo'}
            comboCount={celebrationComboCount}
          />
          <SuccessToast message={toastMessage} visible={toastVisible} />
        </>
      }
    />
  );
}
