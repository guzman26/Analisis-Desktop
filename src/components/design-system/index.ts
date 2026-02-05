/**
 * Design System Facade
 *
 * This file serves two purposes:
 *
 * 1. **Facade Pattern** - Re-exports shadcn/ui extended components for backwards compatibility
 *    All Button, Input, Card, DataTable imports get the new shadcn versions automatically.
 *    This maintains compatibility with 40+ files without requiring import changes.
 *
 * 2. **Custom Component Library** - Exports truly custom components that cannot be replaced
 *    by shadcn/ui primitives (Modal with macOS chrome, overlays, business components).
 *
 * NOTE: New components should generally go in src/components/ui/ (if shadcn-based) or
 * src/components/ (if business domain-specific). This folder is for specialized custom UI.
 */

// ============================================================================
// FACADE: shadcn/ui Extended Components (in src/components/ui/)
// ============================================================================
// These re-export shadcn/ui components with backwards-compatible APIs.
// All imports of Button, Card, Input get the NEW shadcn versions automatically.

export { Button } from '../ui/button-extended';
export type { ButtonProps } from '../ui/button-extended';

export { CardExtended as Card } from '../ui/card-extended';
export type { CardExtendedProps as CardProps } from '../ui/card-extended';

export { InputWithLabel as Input } from '../ui/input-extended';
export type { InputProps } from '../ui/input-extended';

export { default as DataTable } from '../ui/data-table';
export type { DataTableProps, DataTableColumn, SortDirection } from '../ui/data-table';

export { default as EditableCell } from '../ui/editable-cell';
export type { EditableCellProps, EditableCellType } from '../ui/editable-cell';

// ============================================================================
// CUSTOM COMPONENTS: Specialized UI not in shadcn/ui
// ============================================================================
// These provide functionality that cannot be replaced by shadcn primitives.

// macOS Window Chrome Components
export { default as Modal } from './Modal';
export type { ModalProps } from './Modal';

export { default as WindowContainer } from './WindowContainer';
export type { WindowContainerProps } from './WindowContainer';

// Overlay Components
export { default as LoadingOverlay } from './LoadingOverlay';
export { default as NetworkOfflineOverlay } from './NetworkOfflineOverlay';

// Business Domain Components
// Note: SalesCard, DispatchCard, and FreshnessIndicator are available in this folder
// but are currently imported directly via relative paths (not through this facade).
export { default as SalesCard } from './SalesCard';
export { default as DispatchCard } from './DispatchCard';
export { default as FreshnessIndicator } from './FreshnessIndicator';
