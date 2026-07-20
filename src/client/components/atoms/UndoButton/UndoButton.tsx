import React from 'react';
import styles from './UndoButton.module.css';

interface UndoButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const UndoButton: React.FC<UndoButtonProps> = ({
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      className={`${styles.undoButton} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-label="ひとつ戻る"
      title="直前のカードに戻る"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7v6h6" />
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
      </svg>
    </button>
  );
};
