import React, { useState } from 'react';
import { Text } from '../components/atoms/Text';
import { Icon } from '../components/atoms/Icon';
import { Button } from '../components/atoms/Button';
import { Chip } from '../components/atoms/Chip';
import { Badge } from '../components/atoms/Badge';
import { StatusDot } from '../components/atoms/StatusDot';
import { Mascot } from '../components/atoms/Mascot';
import { Sparkle } from '../components/atoms/Sparkle';
import { SoundToggle } from '../components/atoms/SoundToggle';
import { useSound } from '../hooks/useSound';
import { SFXId } from '../lib/sfx';

// Molecules
import { AudioButton } from '../components/molecules/AudioButton';
import { LanguageToggle } from '../components/molecules/LanguageToggle';
import { ReviewButtons } from '../components/molecules/ReviewButtons';
import { ProgressIndicator } from '../components/molecules/ProgressIndicator';
import { StreakBadge } from '../components/molecules/StreakBadge';
import { SuccessToast } from '../components/molecules/SuccessToast';
import { MuteButton } from '../components/molecules/MuteButton';
import { WordListItem } from '../components/molecules/WordListItem';
import { StatItem } from '../components/molecules/StatItem';

// Organisms
import { FlashCard } from '../components/organisms/FlashCard';
import { WordList } from '../components/organisms/WordList';
import { SessionHeader } from '../components/organisms/SessionHeader';
import { CelebrationOverlay } from '../components/organisms/CelebrationOverlay';
import { CompleteSummary } from '../components/organisms/CompleteSummary';
import { AutoPlayControls } from '../components/organisms/AutoPlayControls';

export const AtomsShowcase = (): React.ReactElement => {
  const { muted, setMuted, play, unlock } = useSound();
  const [sparkleKey, setSparkleKey] = useState(0);
  const [lang, setLang] = useState<'vi' | 'ja'>('ja');
  const [progressCurrent, setProgressCurrent] = useState(4);
  const [streakCount, setStreakCount] = useState(3);
  const [toastVisible, setToastVisible] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayFront, setAutoPlayFront] = useState(3);
  const [autoPlayBack, setAutoPlayBack] = useState(4);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [celebrationVariant, setCelebrationVariant] = useState<'combo' | 'complete'>('combo');

  const triggerSparkle = () => {
    setSparkleKey((prev) => prev + 1);
  };

  const triggerCelebration = (v: 'combo' | 'complete') => {
    setCelebrationVariant(v);
    setCelebrationActive(true);
  };

  const handlePlaySound = (id: SFXId) => {
    unlock();
    play(id);
  };

  const showToast = (msg: string) => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ borderBottom: '2px solid var(--berry-200)', paddingBottom: '8px' }}>
        <Text as="h1" variant="word">
          Atoms Showcase
        </Text>
      </div>

      {/* 1. Text Component */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">1. Text Component</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <div>
            <Text variant="hint">variant="word":</Text>
            <div><Text variant="word">Strawberry</Text></div>
          </div>
          <div>
            <Text variant="hint">variant="translation":</Text>
            <div><Text variant="translation">いちご</Text></div>
          </div>
          <div>
            <Text variant="hint">variant="heading":</Text>
            <div><Text variant="heading">This is a heading text</Text></div>
          </div>
          <div>
            <Text variant="hint">variant="body":</Text>
            <div><Text variant="body">This is body text. Hello Berry World!</Text></div>
          </div>
          <div>
            <Text variant="hint">variant="hint":</Text>
            <div><Text variant="hint">This is a small hint or helper text.</Text></div>
          </div>
        </div>
      </section>

      {/* 2. Icon Component */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">2. Icon Component</Text>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <Icon name="speaker" size={32} />
          <Icon name="heart" size={32} />
          <Icon name="flame" size={32} />
          <Icon name="check" size={32} />
          <Icon name="star" size={32} />
          <Icon name="sound-on" size={32} />
          <Icon name="sound-off" size={32} />
        </div>
      </section>

      {/* 3. Button Component */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">3. Button Component</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="success">Success (できた！)</Button>
            <Button variant="danger">Danger (もういちど)</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <div>
            <Button variant="primary" fullWidth>Full Width Button</Button>
          </div>
        </div>
      </section>

      {/* 4. Chip Component */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">4. Chip Component</Text>
        <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <Chip tone="berry">Berry Tone</Chip>
          <Chip tone="mint">Mint Tone</Chip>
          <Chip tone="lavender">Lavender Tone</Chip>
        </div>
      </section>

      {/* 5. Badge Component */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">5. Badge Component</Text>
        <div style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <Badge value="5" tone="berry" />
          <Badge value="10" tone="mint" />
          <Badge value="99+" tone="lavender" />
          <Badge value="🔥" tone="sunny" />
        </div>
      </section>

      {/* 6. StatusDot Component */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">6. StatusDot Component</Text>
        <div style={{ display: 'flex', gap: '24px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <StatusDot status="new" /> <Text variant="body">new (lavender)</Text>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <StatusDot status="weak" /> <Text variant="body">weak (coral)</Text>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <StatusDot status="mastered" /> <Text variant="body">mastered (mint)</Text>
          </span>
        </div>
      </section>

      {/* 7. Mascot Component */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">7. Mascot Component</Text>
        <div style={{ display: 'flex', gap: '40px', padding: '24px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Mascot expression="standard" />
            <Text variant="hint">standard</Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Mascot expression="happy" />
            <Text variant="hint">happy</Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Mascot expression="sad" />
            <Text variant="hint">sad</Text>
          </div>
        </div>
      </section>

      {/* 8. Sparkle Component */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">8. Sparkle Component</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="soft" onClick={triggerSparkle}>Trigger Sparkle Effect</Button>
          </div>
          <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', border: '1px dashed var(--berry-200)', borderRadius: '8px' }}>
            <span style={{ position: 'absolute' }}>Center Point</span>
            <Sparkle active={sparkleKey > 0} />
          </div>
        </div>
      </section>

      {/* 9. Sound & Haptics Component */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">9. Sound & Haptics (useSound)</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SoundToggle muted={muted} onToggle={() => setMuted(!muted)} />
            <Text variant="body">Status: {muted ? 'Muted (Off)' : 'Sound On'}</Text>
            <Button variant="soft" size="sm" onClick={unlock}>Unlock AudioContext</Button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary" size="sm" onClick={() => handlePlaySound('correct')}>Play Correct (Nice!)</Button>
            <Button variant="primary" size="sm" onClick={() => handlePlaySound('combo')}>Play Combo</Button>
            <Button variant="primary" size="sm" onClick={() => handlePlaySound('again')}>Play Again</Button>
            <Button variant="primary" size="sm" onClick={() => handlePlaySound('flip')}>Play Flip</Button>
            <Button variant="primary" size="sm" onClick={() => handlePlaySound('complete')}>Play Complete</Button>
            <Button variant="primary" size="sm" onClick={() => handlePlaySound('tap')}>Play Tap</Button>
          </div>
        </div>
      </section>

      <div style={{ borderBottom: '2px solid var(--berry-200)', paddingBottom: '8px', marginTop: '40px' }}>
        <Text as="h1" variant="word">
          Molecules Showcase
        </Text>
      </div>

      {/* 1. AudioButton */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">1. AudioButton Molecule</Text>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <AudioButton word="Strawberry" size="sm" />
          <Text variant="body">Small (sm)</Text>
          <AudioButton word="Strawberry" size="md" />
          <Text variant="body">Medium (md)</Text>
          <AudioButton word="Strawberry" size="lg" />
          <Text variant="body">Large (lg)</Text>
        </div>
      </section>

      {/* 2. LanguageToggle */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">2. LanguageToggle Molecule</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <LanguageToggle language={lang} onToggle={() => setLang(lang === 'ja' ? 'vi' : 'ja')} />
          <Text variant="body">Active Language: {lang === 'ja' ? 'Japanese' : 'Vietnamese'}</Text>
        </div>
      </section>

      {/* 3. ReviewButtons */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">3. ReviewButtons Molecule</Text>
        <div style={{ padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <ReviewButtons
            onGood={() => showToast('できた！ (Good)')}
            onAgain={() => showToast('もういちど (Again)')}
          />
        </div>
      </section>

      {/* 4. ProgressIndicator */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">4. ProgressIndicator Molecule</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <ProgressIndicator current={progressCurrent} total={10} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button size="sm" onClick={() => setProgressCurrent(Math.max(0, progressCurrent - 1))}>-1 Progress</Button>
            <Button size="sm" onClick={() => setProgressCurrent(Math.min(10, progressCurrent + 1))}>+1 Progress</Button>
            <Text variant="hint">Current: {progressCurrent} / 10 (Encouragement shows at 8 and 9)</Text>
          </div>
        </div>
      </section>

      {/* 5. StreakBadge */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">5. StreakBadge Molecule</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <StreakBadge count={streakCount} />
            <Text variant="body">Streak count: {streakCount}</Text>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" onClick={() => setStreakCount(Math.max(0, streakCount - 1))}>-1 Streak</Button>
            <Button size="sm" onClick={() => setStreakCount(streakCount + 1)}>+1 Streak</Button>
          </div>
        </div>
      </section>

      {/* 6. SuccessToast */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">6. SuccessToast Molecule</Text>
        <div style={{ padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <Button variant="primary" onClick={() => showToast('素晴らしい！正解です🎉')}>
            Trigger Success Toast (with Sparkle)
          </Button>
          <SuccessToast message="素晴らしい！正解です🎉" visible={toastVisible} />
        </div>
      </section>

      {/* 7. MuteButton */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">7. MuteButton Molecule</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <MuteButton />
          <Text variant="body">Syncs directly with useSound</Text>
        </div>
      </section>

      {/* 8. WordListItem */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">8. WordListItem Molecule</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: 'var(--surface-tint)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <WordListItem
            userId={1}
            word={{
              id: 101,
              word_set_id: 1,
              english: 'Strawberry',
              vietnamese: 'Quả dâu tây',
              japanese: 'イチゴ（苺）',
              example_en: 'Strawberries are rich in Vitamin C.',
              example_vi: 'Dâu tây rất giàu Vitamin C.',
              example_ja: 'イチゴはビタミンCが豊富です。',
              created_by: null,
              created_at: '2026-07-08T00:00:00Z',
              progress: { status: 'new', word_id: 101, review_count: 0, incorrect_count: 0, last_reviewed_at: null }
            }}
          />
          <WordListItem
            userId={1}
            word={{
              id: 102,
              word_set_id: 1,
              english: 'Persistence',
              vietnamese: 'Sự kiên trì',
              japanese: '粘り強さ、不屈の努力',
              example_en: 'Success requires persistence.',
              example_vi: 'Thành công đòi hỏi sự kiên trì.',
              example_ja: '成功には粘り強さが必要です。',
              created_by: null,
              created_at: '2026-07-08T00:00:00Z',
              progress: { status: 'weak', word_id: 102, review_count: 2, incorrect_count: 1, last_reviewed_at: null }
            }}
          />
          <WordListItem
            userId={1}
            word={{
              id: 103,
              word_set_id: 1,
              english: 'Mastery',
              vietnamese: 'Sự thành thạo',
              japanese: '習得、熟達',
              example_en: 'Practice leads to mastery.',
              example_vi: 'Luyện tập dẫn đến sự thành thạo.',
              example_ja: '練習が習得に繋がります。',
              created_by: null,
              created_at: '2026-07-08T00:00:00Z',
              progress: { status: 'mastered', word_id: 103, review_count: 5, incorrect_count: 0, last_reviewed_at: null }
            }}
          />
        </div>
      </section>

      {/* 9. StatItem */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">9. StatItem Molecule</Text>
        <div style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: 'var(--surface-tint)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <StatItem label="正解率" value="85%" />
          <StatItem label="学習単語数" value={42} />
          <StatItem label="現在のコンボ" value={7} />
        </div>
      </section>

      <div style={{ borderBottom: '2px solid var(--berry-200)', paddingBottom: '8px', marginTop: '40px' }}>
        <Text as="h1" variant="word">
          Organisms Showcase
        </Text>
      </div>

      {/* 1. SessionHeader */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">1. SessionHeader Organism</Text>
        <div style={{ padding: '16px', backgroundColor: 'var(--surface-tint)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <SessionHeader current={progressCurrent} total={10} streak={streakCount} />
        </div>
      </section>

      {/* 2. FlashCard */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">2. FlashCard Organism</Text>
        <div style={{ padding: '16px', backgroundColor: 'var(--surface-tint)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', display: 'flex', justifyContent: 'center' }}>
          <FlashCard
            word={{
              id: 999,
              word_set_id: 1,
              english: 'Antigravity',
              vietnamese: 'Vô trọng lực',
              japanese: '反重力',
              example_en: 'Antigravity makes things float.',
              example_vi: 'Vô trọng lực làm mọi thứ bay lên.',
              example_ja: '反重力は物を浮かせます。',
              created_by: null,
              created_at: '2026-07-08T00:00:00Z'
            }}
            isAnswerVisible={cardFlipped}
            onShowAnswer={() => setCardFlipped(true)}
            onGood={() => {
              setCardFlipped(false);
              showToast('できた！ (Good)');
            }}
            onAgain={() => {
              setCardFlipped(false);
              showToast('もういちど (Again)');
            }}
            isSubmitting={false}
          />
        </div>
      </section>

      {/* 3. CelebrationOverlay */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">3. CelebrationOverlay Organism</Text>
        <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <Button variant="primary" onClick={() => triggerCelebration('combo')}>
            Trigger 5-Combo Celebration
          </Button>
          <Button variant="success" onClick={() => triggerCelebration('complete')}>
            Trigger All-Complete Celebration
          </Button>
          <CelebrationOverlay
            active={celebrationActive}
            comboCount={5}
          />
        </div>
      </section>

      {/* 4. CompleteSummary */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">4. CompleteSummary Organism</Text>
        <div style={{ padding: '16px', backgroundColor: 'var(--surface-tint)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <CompleteSummary
            total={10}
            correct={8}
            bestCombo={5}
            onRestart={() => showToast('Restarting Session')}
            onWordList={() => showToast('Navigating to Word List')}
          />
        </div>
      </section>

      {/* 5. AutoPlayControls */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">5. AutoPlayControls Organism</Text>
        <div style={{ padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <AutoPlayControls
            isAutoPlay={autoPlay}
            onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
            frontDelay={autoPlayFront}
            backDelay={autoPlayBack}
            onChangeFrontDelay={setAutoPlayFront}
            onChangeBackDelay={setAutoPlayBack}
          />
          <div style={{ marginTop: '8px' }}>
            <Text variant="hint">
              State: {autoPlay ? 'Playing' : 'Paused'} | Front: {autoPlayFront}s | Back: {autoPlayBack}s
            </Text>
          </div>
        </div>
      </section>

      {/* 6. WordList */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Text as="h2" variant="heading">6. WordList Organism (API connection)</Text>
        <div style={{ padding: '16px', backgroundColor: 'var(--surface-tint)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
          <WordList userId={null} wordSetId={null} />
        </div>
      </section>
    </div>
  );
};
