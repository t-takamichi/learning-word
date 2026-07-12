import React from 'react';
import styles from './Icon.module.css';

export type IconName =
  | 'speaker'
  | 'heart'
  | 'flame'
  | 'check'
  | 'star'
  | 'sound-on'
  | 'sound-off'
  | 'settings';

interface Props {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
}

export const Icon = ({
  name,
  size = 24,
  className = '',
  color,
}: Props): React.ReactElement => {
  const style = {
    width: size,
    height: size,
    ...(color ? { color } : {}),
  };

  const getSvgContent = () => {
    switch (name) {
      case 'speaker':
        return (
          <path
            d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-3 0L5 8H1v8h4l6 4.77V3.23zM14 8.5v7c1.48-.65 2.5-2.11 2.5-3.75S15.48 9.15 14 8.5z"
            fill="currentColor"
          />
        );
      case 'heart':
        return (
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="currentColor"
          />
        );
      case 'flame':
        return (
          <path
            d="M12 2.69c-1 .25-1.5.75-2 1.25s-1.5 2-1.5 3.06c0 2.21 1.79 4 4 4s4-1.79 4-4c0-.98-.67-2.31-1.5-3.06s-1.5-1-2-1.25zM12 22c4.42 0 8-3.58 8-8 0-3.32-2.12-6.53-5-7.73l-1 1.62c2.09.89 3 2.92 3 4.61 0 2.76-2.24 5-5 5s-5-2.24-5-5c0-1.04.54-2.48 1-3.23l-1-1.62c-2.88 1.2-5 4.41-5 7.73 0 4.42 3.58 8 8 8z"
            fill="currentColor"
          />
        );
      case 'check':
        return (
          <path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            fill="currentColor"
          />
        );
      case 'star':
        return (
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
            fill="currentColor"
          />
        );
      case 'sound-on':
        return (
          <path
            d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
            fill="currentColor"
          />
        );
      case 'sound-off':
        return (
          <path
            d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
            fill="currentColor"
          />
        );
      case 'settings':
        return (
          <path
            d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
            fill="currentColor"
          />
        );
      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${styles.icon} ${className}`.trim()}
      style={style}
    >
      {getSvgContent()}
    </svg>
  );
};
