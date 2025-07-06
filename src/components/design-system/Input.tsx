import React from 'react';
import styles from './Input.module.css';
import '../../styles/designSystem.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputClasses = [
      styles.input,
      leftIcon && styles.hasLeftIcon,
      rightIcon && styles.hasRightIcon,
      error && styles.error,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.inputContainer}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        
        <div className={styles.inputWrapper}>
          {leftIcon && (
            <div className={styles.leftIcon}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : 
              helperText ? `${inputId}-helper` : 
              undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div className={styles.rightIcon}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <div id={`${inputId}-error`} className={styles.errorMessage} role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 0C2.686 0 0 2.686 0 6s2.686 6 6 6 6-2.686 6-6S9.314 0 6 0zm1 9H5V8h2v1zm0-2H5V3h2v4z"/>
            </svg>
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div id={`${inputId}-helper`} className={styles.helperText}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;