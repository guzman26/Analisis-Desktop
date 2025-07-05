import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat';
  isHoverable?: boolean;
  isPressable?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      isHoverable = false,
      isPressable = false,
      padding = 'medium',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-macos transition-all duration-200';
    
    const variants = {
      default: 'bg-white shadow-macos border border-macos-border',
      elevated: 'bg-white shadow-macos-lg',
      flat: 'bg-macos-bg-tertiary border border-macos-border',
    };

    const paddings = {
      none: '',
      small: 'p-3',
      medium: 'p-5',
      large: 'p-8',
    };

    const interactiveStyles = clsx({
      'hover:shadow-macos-lg hover:scale-[1.02] cursor-pointer': isHoverable && !isPressable,
      'cursor-pointer': isPressable,
    });

    const Component = isPressable ? motion.div : 'div';
    const componentProps = isPressable
      ? {
          whileTap: { scale: 0.98 },
          transition: { duration: 0.1 },
        }
      : {};

    return (
      <Component
        ref={ref}
        className={twMerge(
          clsx(
            baseStyles,
            variants[variant],
            paddings[padding],
            interactiveStyles,
            className
          )
        )}
        onClick={onClick}
        {...componentProps}
        {...(props as any)}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export default Card;