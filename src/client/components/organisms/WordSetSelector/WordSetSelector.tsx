import React, { useState } from 'react';
import { WordSetCard } from '../../molecules/WordSetCard';
import styles from './WordSetSelector.module.css';

interface WordSetProgress {
  total: number;
  mastered: number;
}

interface WordSet {
  id: number;
  name: string;
  levelTag: 'basic' | 'intermediate' | 'advanced';
  description: string | null;
  progress: WordSetProgress;
}

interface Props {
  wordSets: WordSet[];
  onSelect: (id: number) => void;
}

type TabType = 'basic' | 'intermediate' | 'advanced';

export function WordSetSelector({ wordSets, onSelect }: Props): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const filteredSets = wordSets.filter(set => set.levelTag === activeTab);

  return (
    <div className={styles.container}>
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'basic' ? styles.activeBasic : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          🌱 初級
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'intermediate' ? styles.activeIntermediate : ''}`}
          onClick={() => setActiveTab('intermediate')}
        >
          🚀 中級
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'advanced' ? styles.activeAdvanced : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          🏆 上級
        </button>
      </div>

      <div className={styles.list}>
        {filteredSets.length > 0 ? (
          filteredSets.map(set => (
            <WordSetCard key={set.id} wordSet={set} onSelect={onSelect} />
          ))
        ) : (
          <p className={styles.emptyText}>このレベルの単語セットは準備中だよ🍓</p>
        )}
      </div>
    </div>
  );
}
