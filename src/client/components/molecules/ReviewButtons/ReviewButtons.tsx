import React from 'react';
import { Button } from '../../atoms/Button';
import styles from './ReviewButtons.module.css';

interface Props {
  onGood: () => void;
  onAgain: () => void;
  disabled?: boolean;
}

export const ReviewButtons = ({
  onGood,
  onAgain,
  disabled = false,
}: Props): React.ReactElement => {
  return (
    <div className={styles.container}>
      <Button
        variant="danger"
        size="lg"
        onClick={onAgain}
        disabled={disabled}
        className={styles.button}
      >
        もういちど
      </Button>
      <Button
        variant="success"
        size="lg"
        onClick={onGood}
        disabled={disabled}
        className={styles.button}
      >
        できた！
      </Button>
    </div>
  );
};
