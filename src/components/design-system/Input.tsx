import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
      ...props
    },
    ref
  ) => {
    const inputStyles = twMerge(
      clsx(
        'w-full px-3 py-2 text-sm font-normal',
        'bg-white border rounded-macos-sm',
        'transition-all duration-200',
        'placeholder:text-macos-text-secondary',
        'focus:outline-none focus:ring-2 focus:ring-macos-accent focus:border-transparent',
        {
          'border-macos-border': !error,
          'border-macos-error': error,
          'pl-9': leftIcon,
          'pr-9': rightIcon,
          'opacity-50 cursor-not-allowed bg-gray-50': disabled,
        },
        className
      )
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-macos-text mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-macos-text-secondary">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={inputStyles}
            disabled={disabled}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-macos-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={clsx(
            'mt-1.5 text-xs',
            error ? 'text-macos-error' : 'text-macos-text-secondary'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;