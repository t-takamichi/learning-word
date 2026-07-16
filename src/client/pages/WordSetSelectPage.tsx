import React, { useEffect } from 'react';
import { WordSetSelectTemplate } from '../components/templates/WordSetSelectTemplate';
import { WordSetSelector } from '../components/organisms/WordSetSelector';
import { useUsers } from '../hooks/useUsers';
import { useWordSets } from '../hooks/useWordSets';
import { useSound } from '../hooks/useSound';
import { navigateTo } from '../lib/navigation';

export function WordSetSelectPage(): React.ReactElement {
  const { activeUser, activeUserId, clearActiveUser, isLoading: isUserLoading } = useUsers();
  const { wordSets, selectWordSet, createWordSet, updateWordSet, deleteWordSet, isLoading: isSetsLoading } = useWordSets(activeUserId);
  const sound = useSound();

  // Guard: if no active user is selected, or the saved user id no longer
  // exists (e.g. DB was reset while an id was cached in localStorage),
  // clear the stale id and redirect back to user selection.
  useEffect(() => {
    if (isUserLoading) return;
    if (!activeUserId) {
      navigateTo('/users');
      return;
    }
    if (!activeUser) {
      clearActiveUser();
      navigateTo('/users');
    }
  }, [activeUserId, activeUser, isUserLoading, clearActiveUser]);

  const handleSelect = (id: number): void => {
    sound.unlock();
    selectWordSet(id);
    sound.play('correct');
    
    // Navigate to study page
    navigateTo('/');
  };

  if (isUserLoading || isSetsLoading || !activeUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <p style={{ fontWeight: 700, color: 'var(--ink-700)' }}>じゅんびちゅう…</p>
      </div>
    );
  }

  return (
    <WordSetSelectTemplate username={activeUser.username}>
      <WordSetSelector 
        wordSets={wordSets} 
        onSelect={handleSelect} 
        activeUserId={activeUserId}
        onCreate={createWordSet}
        onEdit={(id, input) => updateWordSet({ id, input })}
        onDelete={(id) => deleteWordSet(id)}
      />
    </WordSetSelectTemplate>
  );
}
