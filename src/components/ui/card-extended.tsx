import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from './card';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'elevated' | 'flat';
type Padding = 'none' | 'small' | 'medium' | 'large';

export interface CardExtendedProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the card
   */
  variant?: Variant;

  /**
   * Enable hover effect (shadow and cursor)
   */
  isHoverable?: boolean;

  /**
   * Enable press effect (scale down on click)
   */
  isPressable?: boolean;

  /**
   * Show selected state (ring and border)
   */
  isSelected?: boolean;

  /**
   * Padding size
   */
  padding?: Padding;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Children content
   */
  children: React.ReactNode;
}

const paddingMap: Record<Padding, string> = {
  none: 'p-0',
  small: 'p-2',
  medium: 'p-3.5',
  large: 'p-5',
};

/**
 * Extended Card component with additional variants and interaction states.
 * Wraps shadcn/ui Card with additional features for Lomas Altas.
 *
 * @example
 * // Basic usage
 * <CardExtended>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 * </CardExtended>
 *
 * @example
 * // Hoverable and clickable
 * <CardExtended isHoverable isPressable onClick={() => console.log('clicked')}>
 *   Content
 * </CardExtended>
 *
 * @example
 * // Selected state
 * <CardExtended isSelected>
 *   Selected content
 * </CardExtended>
 *
 * @example
 * // Variants
 * <CardExtended variant="elevated">Elevated card</CardExtended>
 * <CardExtended variant="flat">Flat card</CardExtended>
 */
export const CardExtended = React.forwardRef<HTMLDivElement, CardExtendedProps>(
  (
    {
      variant = 'default',
      isHoverable = false,
      isPressable = false,
      isSelected = false,
      padding = 'medium',
      onClick,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'rounded-xl border border-border/80 bg-card shadow-sm',
          paddingMap[padding],
          isHoverable &&
            'cursor-pointer transition-all duration-150 hover:-translate-y-px hover:shadow-md',
          isPressable && 'active:scale-[0.98] transition-transform',
          isSelected && 'ring-2 ring-primary border-primary',
          variant === 'elevated' && 'shadow-md',
          variant === 'flat' && 'shadow-none border bg-muted/40',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

CardExtended.displayName = 'CardExtended';

// Re-export sub-components for convenience
export { CardContent, CardHeader, CardTitle, CardDescription, CardFooter };
