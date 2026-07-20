import React from 'react';
import styles from './AvatarIcon.module.css';

interface AvatarIconProps {
  src: string;
  alt: string;
  size?: number;
  onClick?: () => void;
}

export const AvatarIcon: React.FC<AvatarIconProps> = ({
  src,
  alt,
  size = 64,
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      className={`${styles.avatarContainer} ${onClick ? styles.clickable : ''}`}
      style={{ width: size, height: size } as React.CSSProperties}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <img src={src} alt={alt} className={styles.image} />
    </Component>
  );
};
