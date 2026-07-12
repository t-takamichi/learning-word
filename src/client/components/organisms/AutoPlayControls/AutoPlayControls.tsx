import React, { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import styles from './AutoPlayControls.module.css';

interface Props {
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  frontDelay: number;
  backDelay: number;
  onChangeFrontDelay: (sec: number) => void;
  onChangeBackDelay: (sec: number) => void;
  className?: string;
}

export const AutoPlayControls = ({
  isAutoPlay,
  onToggleAutoPlay,
  frontDelay,
  backDelay,
  onChangeFrontDelay,
  onChangeBackDelay,
  className = '',
}: Props): React.ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleSettings = (): void => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <div className={styles.bar}>
        <Button
          variant={isAutoPlay ? 'success' : 'soft'}
          size="sm"
          onClick={onToggleAutoPlay}
          className={styles.playButton}
          aria-pressed={isAutoPlay}
        >
          じどうめくり: {isAutoPlay ? 'ON' : 'OFF'}
        </Button>
        <button
          type="button"
          onClick={handleToggleSettings}
          className={`${styles.settingsToggle} ${isExpanded ? styles.expanded : ''}`}
          aria-label="Toggle autoplay settings"
          title="設定を開く"
        >
          <Icon name="settings" size={20} color="var(--ink-700)" />
        </button>
      </div>

      {isExpanded && (
        <div className={styles.settingsPanel}>
          <div className={styles.settingField}>
            <Text variant="hint" className={styles.label}>
              おもて（秒）:
            </Text>
            <input
              type="number"
              min={1}
              max={10}
              value={frontDelay}
              onChange={(e) => onChangeFrontDelay(Math.max(1, Number(e.target.value)))}
              className={styles.input}
            />
          </div>
          <div className={styles.settingField}>
            <Text variant="hint" className={styles.label}>
              うら（秒）:
            </Text>
            <input
              type="number"
              min={1}
              max={10}
              value={backDelay}
              onChange={(e) => onChangeBackDelay(Math.max(1, Number(e.target.value)))}
              className={styles.input}
            />
          </div>
        </div>
      )}
    </div>
  );
};
