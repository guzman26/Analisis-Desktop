import React from 'react';
import styles from './Card.module.css';
import '../../styles/designSystem.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat';
  isHoverable?: boolean;
  isPressable?: boolean;
  isSelected?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      isHoverable = false,
      isPressable = false,
      isSelected = false,
      padding = 'medium',
      children,
      onClick,
      onKeyDown,
      tabIndex,
      role,
      ...props
    },
    ref
  ) => {
    const cardClasses = [
      styles.card,
      styles[variant],
      styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
      isHoverable && styles.hoverable,
      isPressable && styles.pressable,
      isSelected && styles.selected,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Handle keyboard interaction for pressable cards
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isPressable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as any);
      }
      onKeyDown?.(event);
    };

    // Set appropriate ARIA attributes
    const cardProps = {
      ref,
      className: cardClasses,
      onClick: isPressable ? onClick : undefined,
      onKeyDown: isPressable ? handleKeyDown : onKeyDown,
      tabIndex: isPressable ? (tabIndex ?? 0) : tabIndex,
      role: isPressable ? (role ?? 'button') : role,
      ...props,
    };

    return <div {...cardProps}>{children}</div>;
  }
);

Card.displayName = 'Card';

export default Card;
