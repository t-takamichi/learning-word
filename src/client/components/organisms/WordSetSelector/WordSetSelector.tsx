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
  createdBy: number | null;
  progress: WordSetProgress;
}

interface Props {
  wordSets: WordSet[];
  onSelect: (id: number) => void;
  activeUserId?: number | null;
  onCreate?: (input: { name: string; level_tag: 'basic' | 'intermediate' | 'advanced'; description?: string | null }) => Promise<any>;
  onEdit?: (id: number, input: { name: string; level_tag: 'basic' | 'intermediate' | 'advanced'; description?: string | null }) => Promise<any>;
  onDelete?: (id: number) => Promise<any>;
}

type TabType = 'basic' | 'intermediate' | 'advanced';

export function WordSetSelector({ wordSets, onSelect, activeUserId, onCreate, onEdit, onDelete }: Props): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingSet, setEditingSet] = useState<WordSet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    levelTag: 'basic' as TabType
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingSetId, setDeletingSetId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredSets = wordSets.filter(set => set.levelTag === activeTab);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      levelTag: activeTab
    });
    setFormMode('create');
    setEditingSet(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (set: WordSet) => {
    setFormData({
      name: set.name,
      description: set.description || '',
      levelTag: set.levelTag
    });
    setFormMode('edit');
    setEditingSet(set);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    setDeletingSetId(id);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError('セット名は必須です');
      return;
    }

    try {
      if (formMode === 'create' && onCreate) {
        await onCreate({
          name: formData.name,
          level_tag: formData.levelTag,
          description: formData.description.trim() || null,
        });
      } else if (formMode === 'edit' && editingSet && onEdit) {
        await onEdit(editingSet.id, {
          name: formData.name,
          level_tag: formData.levelTag,
          description: formData.description.trim() || null,
        });
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || '操作に失敗しました');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingSetId !== null && onDelete) {
      try {
        await onDelete(deletingSetId);
        setIsConfirmOpen(false);
      } catch (err: any) {
        alert(err.message || '削除に失敗しました');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabHeader}>
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
        {activeUserId && (
          <button className={styles.createBtn} onClick={handleOpenCreate}>
            ＋ セットをつくる
          </button>
        )}
      </div>

      <div className={styles.list}>
        {filteredSets.length > 0 ? (
          filteredSets.map(set => (
            <WordSetCard 
              key={set.id} 
              wordSet={set} 
              onSelect={onSelect}
              activeUserId={activeUserId}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))
        ) : (
          <p className={styles.emptyText}>このレベルの単語セットは準備中だよ🍓</p>
        )}
      </div>

      {/* フォームモーダル */}
      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsFormOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {formMode === 'create' ? 'あたらしいセットをつくる🍓' : 'セットを編集する✏️'}
            </h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>セットのなまえ</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 旅行でつかう英語"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>レベル</label>
                <select 
                  className={styles.select}
                  value={formData.levelTag}
                  onChange={(e) => setFormData({ ...formData, levelTag: e.target.value as any })}
                >
                  <option value="basic">🌱 初級</option>
                  <option value="intermediate">🚀 中級</option>
                  <option value="advanced">🏆 上級</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>せつめい (おぷしょなる)</label>
                <textarea 
                  className={styles.textarea} 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="どんな単語をあつめるセットかな？"
                />
              </div>
              {formError && <p className={styles.errorText}>{formError}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsFormOpen(false)}>
                  キャンセル
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {formMode === 'create' ? 'つくる！' : 'ほぞんする'}
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
              この単語セットと、おわかれする？<br />
              <span className={styles.warningText}>（セットの中の単語もバイバイしちゃうよ💦）</span>
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
    </div>
  );
}
