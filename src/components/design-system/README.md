# Design System - Custom Component Library

This folder contains **custom UI components** that provide specialized functionality not available in shadcn/ui. It also serves as a **facade layer** for shadcn/ui extended components.

## Purpose

1. **Facade Pattern** - Re-exports shadcn/ui extended components for backwards compatibility
2. **Custom Component Library** - Houses specialized custom components

## Architecture

### Facade Layer (index.ts)

The `index.ts` file re-exports shadcn/ui components from `src/components/ui/` with backwards-compatible APIs:

- `Button` → `ui/button-extended` (shadcn Button + loading/icons)
- `Card` → `ui/card-extended` (shadcn Card + variants/interactions)
- `Input` → `ui/input-extended` (shadcn Input + label/error/icons)
- `DataTable` → `ui/data-table` (shadcn Table + sorting/expandable rows)
- `EditableCell` → `ui/editable-cell` (Custom inline editing)

**Why?** This allows 40+ files to keep importing from `@/components/design-system` while actually using the new shadcn versions.

### Custom Components

These components live in this folder because they provide functionality not available in shadcn/ui:

#### macOS Window Chrome
- **Modal** - Resizable modal with macOS traffic lights (close/minimize/maximize)
- **WindowContainer** - Layout container with macOS window styling

#### Overlays
- **LoadingOverlay** - Global loading spinner overlay
- **NetworkOfflineOverlay** - Network connectivity detection and recovery UI

#### Business Domain Components
- **SalesCard** - Sales order display card
- **DispatchCard** - Dispatch order display card
- **FreshnessIndicator** - Egg freshness badge with visual indicators

## Adding New Components

### Should it go in design-system?

**NO - Use `src/components/ui/`** if:
- It's based on shadcn/ui primitives
- It's a general-purpose UI component
- It could be reused across projects

**NO - Use `src/components/`** if:
- It's business domain-specific (PalletCard, BoxCard)
- It's tied to specific views or features
- It's not reusable outside this app

**YES - Use `src/components/design-system/`** if:
- It provides specialized UI functionality (overlays, window chrome)
- It's truly custom and cannot use shadcn primitives
- It's part of the app's design language (Modal, WindowContainer)

## Migration History

This folder originally contained a full custom design system with CSS modules. Components were migrated to shadcn/ui in Phases 1-8:

- ✅ Phase 2: Button migrated to shadcn
- ✅ Phase 3: Input migrated to shadcn
- ✅ Phase 4: Card migrated to shadcn
- ✅ Phase 5: DataTable migrated to shadcn
- ✅ Phase 7: Notifications migrated to Sonner

The old component files (Button.tsx, Input.tsx, Card.tsx, DataTable.tsx) have been removed. The facade pattern in index.ts maintains backwards compatibility.

## File Structure

```
design-system/
├── index.ts                    # Facade exports (ENTRY POINT)
├── README.md                   # This file
├── Modal.tsx                   # Custom macOS modal
├── WindowContainer.tsx         # Custom macOS window layout
├── LoadingOverlay.tsx          # Global loading overlay
├── NetworkOfflineOverlay.tsx   # Network offline overlay
├── SalesCard.tsx               # Business: Sales order card
├── SalesCard.css               # SalesCard styles
├── DispatchCard.tsx            # Business: Dispatch order card
└── FreshnessIndicator.tsx      # Business: Egg freshness badge
└── FreshnessIndicator.css      # FreshnessIndicator styles
```

## Import Patterns

### Recommended (through facade):
```typescript
import { Button, Card, Input, Modal, LoadingOverlay, SalesCard, DispatchCard } from '@/components/design-system';
```

## Component Usage Examples

### Button (shadcn extended)

```tsx
import { Button } from '@/components/design-system';

// Primary button
<Button variant="default">Save Changes</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// With loading state
<Button isLoading>Processing...</Button>

// With icons
<Button leftIcon={<Save />}>Save</Button>
```

**Props:**
- `variant`: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
- `size`: 'default' | 'sm' | 'lg' | 'icon'
- `isLoading`: boolean
- `leftIcon` / `rightIcon`: ReactNode

### Card (shadcn extended)

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system';

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>

// Interactive card
<Card isHoverable isPressable onClick={handleClick}>
  <CardContent>Click me!</CardContent>
</Card>

// Elevated card
<Card variant="elevated">
  <CardContent>Floating content</CardContent>
</Card>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined'
- `isHoverable`: boolean
- `isPressable`: boolean
- `isSelected`: boolean
- `padding`: 'none' | 'sm' | 'default' | 'lg'

### Input (shadcn extended)

```tsx
import { Input } from '@/components/design-system';

// Basic input
<Input
  label="Email"
  placeholder="Enter your email"
  type="email"
/>

// With error
<Input
  label="Password"
  error="Password must be at least 8 characters"
  type="password"
/>

// With icons
<Input
  label="Search"
  leftIcon={<Search />}
  placeholder="Search..."
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon` / `rightIcon`: ReactNode

### Modal (Custom - macOS)

```tsx
import { Modal } from '@/components/design-system';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="medium"
  showTrafficLights={true}
>
  <div className="p-4">
    <p>Are you sure you want to proceed?</p>
    <div className="flex gap-3 justify-end mt-4">
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="default">Confirm</Button>
    </div>
  </div>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'small' | 'medium' | 'large' | 'fullscreen'
- `showTrafficLights`: boolean (macOS window controls)

**Modal Features:**
- ✅ Authentic macOS window appearance
- ✅ Traffic light controls (red, yellow, green)
- ✅ Resizable windows
- ✅ Window translucency with backdrop-filter
- ✅ Smooth animations

### DataTable (shadcn based)

```tsx
import { DataTable, DataTableColumn } from '@/components/design-system';

const columns: DataTableColumn<Customer>[] = [
  { key: 'nombre', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'telefono', label: 'Phone' },
];

<DataTable
  data={customers}
  columns={columns}
  onSort={(key, direction) => handleSort(key, direction)}
/>
```

### Business Components

#### SalesCard

```tsx
import { SalesCard } from '@/components/design-system';

<SalesCard
  sale={saleData}
  onViewDetails={() => handleViewDetails(saleData)}
/>
```

#### DispatchCard

```tsx
import { DispatchCard } from '@/components/design-system';

<DispatchCard
  dispatch={dispatchData}
  onApprove={() => handleApprove(dispatchData.id)}
/>
```

#### FreshnessIndicator

```tsx
import { FreshnessIndicator } from '@/components/design-system';

<FreshnessIndicator daysSinceProduction={3} />
```

## Color Palette

The design system uses Tailwind CSS with custom macOS-inspired colors:

```css
/* Primary colors */
--macos-accent: #007aff /* Blue */
--macos-success: #34c759 /* Green */
--macos-warning: #ff9500 /* Orange */
--macos-error: #ff3b30 /* Red */

/* Background colors */
--macos-bg: #f5f5f7 /* Light gray */
--macos-bg-secondary: #ffffff /* White */

/* Text colors */
--macos-text: #1d1d1f /* Dark gray */
--macos-text-secondary: #86868b /* Medium gray */

/* UI colors */
--macos-border: #d2d2d7 /* Light border */
```

## Typography

The design system uses the San Francisco font family (falls back to system fonts):

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
  'Helvetica Neue', Arial, sans-serif;
```

## Usage Tips

1. **Consistency**: Always import from `@/components/design-system` for facade components
2. **New Components**: Add shadcn-based components to `src/components/ui/`, not here
3. **Custom Components**: Only add truly custom components here (overlays, macOS chrome)
4. **Business Components**: Domain-specific cards and indicators can live here
5. **Documentation**: Update this README when adding new components

## Future Considerations

1. **Modal migration** - Consider if shadcn Dialog can be extended to support macOS chrome
2. **Folder rename** - Consider renaming to `src/components/custom/` for clarity
3. **Business components** - May eventually move SalesCard/DispatchCard to `src/components/`
