import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'medium',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-macos-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
    
    const variants = {
      primary: 'bg-macos-accent text-white hover:bg-macos-accent-hover focus-visible:ring-macos-accent',
      secondary: 'bg-white text-macos-text border border-macos-border hover:bg-gray-50 focus-visible:ring-macos-accent',
      ghost: 'bg-transparent text-macos-text hover:bg-gray-100 focus-visible:ring-macos-accent',
      danger: 'bg-macos-error text-white hover:bg-red-600 focus-visible:ring-macos-error',
    };

    const sizes = {
      small: 'px-3 py-1.5 text-xs gap-1.5',
      medium: 'px-4 py-2 text-sm gap-2',
      large: 'px-6 py-3 text-base gap-2.5',
    };

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        className={twMerge(
          clsx(
            baseStyles,
            variants[variant],
            sizes[size],
            isDisabled && 'opacity-50 cursor-not-allowed',
            className
          )
        )}
        disabled={isDisabled}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
        {...(props as any)}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;