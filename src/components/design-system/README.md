# macOS Design System

This design system provides a set of React components and utilities that follow Apple's macOS design principles, creating a native desktop application feel for your web app.

## Design Principles

- **Clarity**: Text is legible at every size, icons are precise and lucid
- **Deference**: Fluid motion and a crisp interface help people understand and interact with content
- **Depth**: Visual layers and realistic motion convey hierarchy

## Components

### Button

A versatile button component with multiple variants and states.

```tsx
import { Button } from '@/components/design-system';

// Primary button
<Button variant="primary">Save Changes</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// With loading state
<Button isLoading>Processing...</Button>

// With icons
<Button leftIcon={<SaveIcon />}>Save</Button>
```

**Props:**

- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'small' | 'medium' | 'large'
- `isLoading`: boolean
- `leftIcon` / `rightIcon`: ReactNode

### Card

A container component with depth and hover effects.

```tsx
import { Card } from '@/components/design-system';

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

// Interactive card
<Card isPressable isHoverable>
  <p>Click me!</p>
</Card>

// Elevated card
<Card variant="elevated">
  <p>Floating content</p>
</Card>
```

**Props:**

- `variant`: 'default' | 'elevated' | 'flat'
- `isHoverable`: boolean
- `isPressable`: boolean
- `padding`: 'none' | 'small' | 'medium' | 'large'

### Modal

A dialog component with smooth animations and backdrop blur.

```tsx
import { Modal } from '@/components/design-system';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
>
  <div className="flex gap-3 justify-end">
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary">Confirm</Button>
  </div>
</Modal>;
```

**Props:**

- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `description`: string
- `size`: 'small' | 'medium' | 'large' | 'fullscreen'
- `showCloseButton`: boolean

### Input

A form input component with label and error states.

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
  leftIcon={<SearchIcon />}
  placeholder="Search..."
/>
```

**Props:**

- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon` / `rightIcon`: ReactNode

## Color Palette

The design system uses a carefully selected color palette that matches macOS aesthetics:

```scss
// Primary colors
--macos-accent: #007aff // Blue
  --macos-success: #34c759 // Green
  --macos-warning: #ff9500 // Orange
  --macos-error: #ff3b30 // Red
  // Background colors
  --macos-bg: #f5f5f7 // Light gray
  --macos-bg-secondary: #ffffff // White
  --macos-bg-tertiary: #f9f9f9 // Off-white
  // Text colors
  --macos-text: #1d1d1f // Dark gray
  --macos-text-secondary: #86868b // Medium gray
  // UI colors
  --macos-border: #d2d2d7 // Light border
  --macos-sidebar: #f5f5f7; // Sidebar background
```

## Typography

The design system uses the San Francisco font family (falls back to system fonts):

```css
font-family:
  -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
  'Helvetica Neue', Arial, sans-serif;
```

## Utility Classes

### Animations

- `animate-in`: Fade in animation
- `animate-slide`: Slide in from top
- `animate-scale`: Scale in effect

### Text

- `text-primary`: Primary text color
- `text-secondary`: Secondary text color

### Effects

- `vibrancy`: Glass morphism effect
- `card-macos`: Standard card styling
- `window-macos`: Window-like container

## Usage Tips

1. **Consistency**: Use the same variants across similar actions
2. **Hierarchy**: Use `primary` buttons for main actions, `secondary` for alternatives
3. **Spacing**: The design system uses consistent spacing (4px base unit)
4. **Animations**: Keep animations subtle and purposeful
5. **Colors**: Stick to the defined color palette for consistency

## Examples

### Form Layout

```tsx
<Card>
  <h2 className="text-xl font-semibold mb-4">User Settings</h2>
  <div className="space-y-4">
    <Input label="Name" placeholder="John Doe" />
    <Input label="Email" type="email" placeholder="john@example.com" />
    <div className="flex gap-3 justify-end mt-6">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save Changes</Button>
    </div>
  </div>
</Card>
```

### Dashboard Card

```tsx
<Card variant="elevated" isHoverable>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-secondary">Total Sales</p>
      <p className="text-2xl font-bold">$12,345</p>
    </div>
    <TrendingUpIcon className="w-8 h-8 text-macos-success" />
  </div>
</Card>
```
