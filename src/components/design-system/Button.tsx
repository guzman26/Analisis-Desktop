import React from 'react';
import styles from './Button.module.css';
import '../../styles/designSystem.css';

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
    const buttonClasses = [
      styles.button,
      styles[variant],
      styles[size],
      isLoading && styles.loading,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <svg
            className={styles.loadingSpinner}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.25"
            />
            <path
              d="M8 2C11.314 2 14 4.686 14 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;