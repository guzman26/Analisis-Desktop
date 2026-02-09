import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

type AppDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const sizeClasses: Record<AppDialogSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-[95vw]',
};

const AppDialog = DialogPrimitive.Root;
const AppDialogTrigger = DialogPrimitive.Trigger;
const AppDialogPortal = DialogPrimitive.Portal;
const AppDialogClose = DialogPrimitive.Close;

interface AppDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: AppDialogSize;
  layer?: number;
}

const AppDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  AppDialogContentProps
>(({ className, children, size = 'md', layer = 50, ...props }, ref) => (
  <AppDialogPortal>
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
      )}
      style={{ zIndex: layer }}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 text-foreground shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[85vh] overflow-y-auto',
        sizeClasses[size],
        className
      )}
      style={{ zIndex: layer + 1, ...props.style }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </AppDialogPortal>
));
AppDialogContent.displayName = 'AppDialogContent';

const AppDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);
AppDialogHeader.displayName = 'AppDialogHeader';

const AppDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
AppDialogFooter.displayName = 'AppDialogFooter';

const AppDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
AppDialogTitle.displayName = 'AppDialogTitle';

const AppDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
AppDialogDescription.displayName = 'AppDialogDescription';

export {
  AppDialog,
  AppDialogTrigger,
  AppDialogPortal,
  AppDialogClose,
  AppDialogContent,
  AppDialogHeader,
  AppDialogFooter,
  AppDialogTitle,
  AppDialogDescription,
  // Backwards-compatible aliases to simplify migrations
  AppDialog as Dialog,
  AppDialogTrigger as DialogTrigger,
  AppDialogPortal as DialogPortal,
  AppDialogClose as DialogClose,
  AppDialogContent as DialogContent,
  AppDialogHeader as DialogHeader,
  AppDialogFooter as DialogFooter,
  AppDialogTitle as DialogTitle,
  AppDialogDescription as DialogDescription,
};
