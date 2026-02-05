// Type declarations for @radix-ui packages

declare module '@radix-ui/react-dialog' {
  import * as React from 'react';

  export const Root: React.FC<{
    children?: React.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
  }>;

  export const Trigger: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> &
      React.RefAttributes<HTMLButtonElement> & {
        asChild?: boolean;
      }
  >;

  export const Portal: React.FC<{
    children?: React.ReactNode;
    forceMount?: boolean;
    container?: HTMLElement;
  }>;

  export const Overlay: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> &
      React.RefAttributes<HTMLDivElement> & {
        asChild?: boolean;
        forceMount?: boolean;
      }
  >;

  export const Content: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> &
      React.RefAttributes<HTMLDivElement> & {
        asChild?: boolean;
        forceMount?: boolean;
        onOpenAutoFocus?: (event: Event) => void;
        onCloseAutoFocus?: (event: Event) => void;
        onEscapeKeyDown?: (event: KeyboardEvent) => void;
        onPointerDownOutside?: (event: Event) => void;
        onInteractOutside?: (event: Event) => void;
      }
  >;

  export const Close: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> &
      React.RefAttributes<HTMLButtonElement> & {
        asChild?: boolean;
      }
  >;

  export const Title: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLHeadingElement> &
      React.RefAttributes<HTMLHeadingElement> & {
        asChild?: boolean;
      }
  >;

  export const Description: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLParagraphElement> &
      React.RefAttributes<HTMLParagraphElement> & {
        asChild?: boolean;
      }
  >;
}

declare module '@radix-ui/react-dropdown-menu' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Portal: React.FC<any>;
  export const Content: React.FC<any>;
  export const Item: React.FC<any>;
  export const CheckboxItem: React.FC<any>;
  export const RadioGroup: React.FC<any>;
  export const RadioItem: React.FC<any>;
  export const Label: React.FC<any>;
  export const Separator: React.FC<any>;
  export const Sub: React.FC<any>;
  export const SubTrigger: React.FC<any>;
  export const SubContent: React.FC<any>;
}

declare module '@radix-ui/react-tooltip' {
  import * as React from 'react';
  export const Provider: React.FC<any>;
  export const Root: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Portal: React.FC<any>;
  export const Content: React.FC<any>;
  export const Arrow: React.FC<any>;
}

declare module '@radix-ui/react-slot' {
  import * as React from 'react';
  export const Slot: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLElement> &
      React.RefAttributes<HTMLElement> & {
        children?: React.ReactNode;
      }
  >;
  export const Slottable: React.FC<{ children: React.ReactNode }>;
}

declare module '@radix-ui/react-label' {
  import * as React from 'react';
  export const Root: React.ForwardRefExoticComponent<
    React.LabelHTMLAttributes<HTMLLabelElement> &
      React.RefAttributes<HTMLLabelElement> & {
        asChild?: boolean;
      }
  >;
  export const Label: typeof Root;
}
