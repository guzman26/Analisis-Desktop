import * as React from 'react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from './button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Legacy variant and size types for backwards compatibility
type LegacyVariant = 'primary' | 'danger';
type LegacySize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size' | 'asChild'> {
  /**
   * Button variant - supports both new and legacy variants
   * New: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
   * Legacy: 'primary' | 'danger'
   */
  variant?: ShadcnButtonProps['variant'] | LegacyVariant;

  /**
   * Button size - supports both new and legacy sizes
   * New: 'default' | 'sm' | 'lg' | 'icon'
   * Legacy: 'small' | 'medium' | 'large'
   */
  size?: ShadcnButtonProps['size'] | LegacySize;

  /**
   * Show loading spinner and disable button
   */
  isLoading?: boolean;

  /**
   * Icon to show on the left side of button text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to show on the right side of button text
   */
  rightIcon?: React.ReactNode;
}

/**
 * Map legacy variant names to new shadcn/ui variants
 */
const mapVariant = (variant?: ButtonProps['variant']): ShadcnButtonProps['variant'] => {
  if (!variant) return 'default';

  const variantMap: Record<string, ShadcnButtonProps['variant']> = {
    primary: 'default',
    danger: 'destructive',
  };

  return variantMap[variant] || (variant as ShadcnButtonProps['variant']);
};

/**
 * Map legacy size names to new shadcn/ui sizes
 */
const mapSize = (size?: ButtonProps['size']): ShadcnButtonProps['size'] => {
  if (!size) return 'default';

  const sizeMap: Record<string, ShadcnButtonProps['size']> = {
    small: 'sm',
    medium: 'default',
    large: 'lg',
  };

  return sizeMap[size] || (size as ShadcnButtonProps['size']);
};

/**
 * Extended Button component with loading state and icon support.
 * Wraps shadcn/ui Button with additional features for Lomas Altas.
 *
 * @example
 * // Basic usage
 * <Button>Click me</Button>
 *
 * @example
 * // With loading state
 * <Button isLoading={isSubmitting}>Submit</Button>
 *
 * @example
 * // With icons
 * <Button leftIcon={<Plus />}>Add Pallet</Button>
 * <Button rightIcon={<ChevronRight />}>Next</Button>
 *
 * @example
 * // Variants (supports both new and legacy names)
 * <Button variant="default">Primary</Button>
 * <Button variant="primary">Primary (legacy)</Button>
 * <Button variant="destructive">Delete</Button>
 * <Button variant="danger">Delete (legacy)</Button>
 * <Button variant="outline">Cancel</Button>
 * <Button variant="secondary">Secondary</Button>
 * <Button variant="ghost">Ghost</Button>
 *
 * @example
 * // Sizes (supports both new and legacy names)
 * <Button size="sm">Small</Button>
 * <Button size="small">Small (legacy)</Button>
 * <Button size="default">Default</Button>
 * <Button size="lg">Large</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ isLoading, leftIcon, rightIcon, children, disabled, className, variant, size, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        disabled={disabled || isLoading}
        variant={mapVariant(variant)}
        size={mapSize(size)}
        className={cn(className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="mr-2 inline-flex items-center">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex items-center">{rightIcon}</span>
        )}
      </ShadcnButton>
    );
  }
);

Button.displayName = 'Button';

// Re-export ButtonProps for type compatibility
export type { ShadcnButtonProps as BaseButtonProps };
