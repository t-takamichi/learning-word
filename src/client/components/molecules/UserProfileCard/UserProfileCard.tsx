import React from 'react';
import { AvatarIcon } from '../../atoms/AvatarIcon';
import styles from './UserProfileCard.module.css';

interface UserProfileCardProps {
  name: string;
  avatarSrc: string;
  onClick: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  avatarSrc,
  onClick,
}) => {
  return (
    <button
      className={styles.card}
      onClick={onClick}
      type="button"
      aria-label={`${name}としてログイン`}
    >
      <AvatarIcon src={avatarSrc} alt={name} size={96} />
      <span className={styles.name}>{name}</span>
    </button>
  );
};
