import * as React from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text to display above the input
   */
  label?: string;

  /**
   * Error message to display below the input
   */
  error?: string;

  /**
   * Helper text to display below the input (shown when no error)
   */
  helperText?: string;

  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode;

  /**
   * Custom class name for the container
   */
  containerClassName?: string;
}

/**
 * Extended Input component with label, error, helper text, and icon support.
 * Wraps shadcn/ui Input with additional features for Lomas Altas.
 *
 * @example
 * // Basic usage
 * <Input label="Name" placeholder="Enter name" />
 *
 * @example
 * // With error
 * <Input label="Email" error="Invalid email format" />
 *
 * @example
 * // With helper text
 * <Input label="Username" helperText="Must be at least 3 characters" />
 *
 * @example
 * // With icons
 * <Input leftIcon={<Search />} placeholder="Search..." />
 * <Input rightIcon={<Eye />} type="password" />
 */
export const InputWithLabel = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            id={inputId}
            className={cn(
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InputWithLabel.displayName = 'InputWithLabel';

// Re-export base Input for cases where extended features aren't needed
export { Input as BaseInput };
