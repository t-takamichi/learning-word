import React from 'react';
import styles from './Text.module.css';

interface Props {
  as?: React.ElementType;
  variant: 'word' | 'translation' | 'heading' | 'body' | 'hint';
  children: React.ReactNode;
  className?: string;
}

export const Text = ({
  as: Component = 'span',
  variant,
  children,
  className = '',
}: Props): React.ReactElement => {
  const variantClass = styles[variant] || '';
  return (
    <Component className={`${variantClass} ${className}`.trim()}>
      {children}
    </Component>
  );
};
