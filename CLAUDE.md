# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lomas Altas - Analisis Desktop** is a React + TypeScript application for managing egg inventory, packaging, storage, and sales. The system tracks pallets (containing egg boxes), manages warehouse locations, handles sales orders, and provides audit functionality.

## Development Commands

### Core Commands
```bash
npm run dev              # Start development server (Vite)
npm run build            # Type-check and build for production
npm run preview          # Preview production build locally
```

### Test shadcn/ui Setup
Visit `http://localhost:5173/test/shadcn` to see all components in action.

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without modifying files
npm run type-check       # Run TypeScript compiler without emitting files
npm run check            # Run type-check + lint + format:check (full validation)
```

### Recommended Workflow
- Run `npm run check` before committing to catch all issues
- Use `npm run lint:fix` and `npm run format` to automatically fix most issues

## Architecture

### High-Level Structure

The application follows a **module-based architecture** organized by business domain:

```
src/
├── api/               # API client and endpoint definitions
├── application/       # Business logic layer (not yet fully implemented)
├── components/        # Reusable UI components
├── contexts/          # React Context providers for state management
├── hooks/             # Custom React hooks
├── routes/            # Route definitions and lazy-loaded views
├── styles/            # Global styles and CSS modules
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── views/             # Feature-specific view components
    ├── Admin/         # Administration: issues, metrics, danger zone
    ├── Bodega/        # Warehouse management
    ├── Dispatch/      # Dispatch/shipping management
    ├── Packing/       # Pallet creation and packing operations
    ├── Sale/          # Sales orders and customer management
    └── Transito/      # In-transit inventory
```

### State Management Pattern

The app uses **React Context API** for global state, with separate contexts per domain:

- **PalletContext**: Manages pallet operations (open/closed pallets, CRUD)
- **BoxesContext**: Manages box inventory and filtering
- **CustomerContext**: Customer data and preferences
- **SalesContext**: Sales orders and transactions
- **IssuesContext**: System issues and problems

Each context provides:
- State (data)
- Actions (functions to modify state)
- Loading states
- Error handling

### API Architecture

The API layer has two implementations:
1. **Legacy endpoints** (`src/api/endpoints.ts`): Direct HTTP calls to individual Lambda functions
2. **Consolidated API** (`src/api/consolidatedApi.ts`): New pattern with domain-grouped endpoints (`/inventory`, `/sales`, `/admin`)

**Migration in progress**: Gradually moving from legacy to consolidated endpoints. When adding new features, prefer the consolidated API pattern.

### Data Flow

1. **View component** renders UI and handles user interactions
2. **Context hook** (`usePallet()`, `useBoxes()`, etc.) provides state and actions
3. **Context provider** coordinates API calls and state updates
4. **API client** (`src/api/client.ts`) makes HTTP requests with error handling
5. **Backend** (AWS API Gateway + Lambda) processes requests

### Key Domain Concepts

#### Pallets
- **State**: `open` (receiving boxes) or `closed` (sealed and ready)
- **Locations**: PACKING → TRANSITO → BODEGA → PREVENTA → VENTA → UNSUBSCRIBED
- **Content Types**: BOXES (regular), LOOSE (loose eggs in carts/trays), MIXED
- **Code Structure**: 14-digit code encoding day, week, year, shift, caliber, format, company, suffix
- **Max Capacity**: Configured per pallet (typically 60 boxes)

#### Boxes
- **16-digit codes** encoding production metadata (date, caliber, operator, format, counter)
- Assigned to pallets or remain "unassigned"
- **Custom Info**: Special boxes can have detailed egg type/quantity breakdown
- Track location (PACKING, BODEGA, VENTA, etc.)

#### Sales Flow
1. Create draft order (select customer, type, items)
2. Validate inventory availability
3. Confirm order (reserves inventory, moves to PREVENTA/VENTA)
4. Print report
5. Support returns/additions after confirmation

#### Audit System
- Runs when closing pallets
- Checks: capacity, box uniqueness, sequence integrity
- Grades: EXCELLENT (100), GOOD (80-99), WARNING (50-79), CRITICAL (0-49)
- Issues can be warnings or critical

### Code Patterns and Conventions

#### Component Organization
- **View components** in `src/views/[module]/` (e.g., `views/Packing/OpenPallets.tsx`)
- **Reusable components** in `src/components/` (e.g., `BoxCard.tsx`, `PalletDetailModal.tsx`)
- Use **CSS Modules** (`.module.css`) for component-specific styles
- Use **lazy loading** for route-level components (see `src/routes/index.tsx`)

#### Type Safety
- All API responses typed in `src/types/index.ts`
- Use `CalibreCode`, `Location`, `PalletState`, `SaleType` union types
- Prefer interfaces over `any` type
- API functions return typed Promises

#### Naming Conventions
- **Spanish domain terms**: `codigo`, `calibre`, `ubicacion`, `pallet`, `caja` (keep domain language)
- **English technical terms**: `state`, `loading`, `error`, `handleClick`
- **File names**: PascalCase for components (`BoxCard.tsx`), camelCase for utilities (`boxCodeParser.ts`)

#### Error Handling
- Use `try-catch` in async functions
- Display user-friendly messages via `useNotifications()` hook (powered by Sonner)
- Log errors to console for debugging
- API errors mapped to user messages in `src/utils/errorMessages.ts`

#### Utility Functions
Key utilities in `src/utils/`:
- **boxCodeParser.ts**: Parse 16-digit box codes
- **getParamsFromCodigo.ts**: Extract metadata from pallet codes
- **generatePalletCode.ts**: Create valid pallet codes
- **freshnessCalculations.ts**: Calculate egg age/freshness
- **company.ts**: Company code mappings
- **exportToExcel.ts**: Excel export functionality
- **metricsAggregation.ts**: Aggregate inventory metrics
- **salesMetricsAggregation.ts**: Sales reporting calculations

### API Client Configuration

Base URL configured via environment variable:
```
VITE_API_URL=https://jgnmidryq7.execute-api.us-east-2.amazonaws.com
```

The client (`src/api/client.ts`) provides:
- `get<T>(path, params)`: GET requests with query params
- `post<T>(path, data)`: POST requests with JSON body
- Automatic error handling and response unwrapping

### Testing Strategy

Currently no automated tests configured. When adding tests:
- Focus on utility functions first (parsers, calculations, validators)
- Test API client error handling
- Test complex state logic in contexts
- Use React Testing Library for component tests

## Common Tasks

### Adding a New View
1. Create component in `src/views/[Module]/NewView.tsx`
2. Add lazy import in `src/routes/index.tsx`
3. Add route entry to `routes` array
4. Update navigation in `src/components/Layout.tsx` if needed

### Adding a New API Endpoint
1. Define request/response types in `src/types/index.ts`
2. Add function in `src/api/endpoints.ts` (or use consolidated API pattern)
3. Call from context provider or component
4. Handle loading/error states

### Working with Pallet Codes
```typescript
import { getParamsFromCodigo } from '@/utils/getParamsFromCodigo';
import { generatePalletCode } from '@/utils/generatePalletCode';

// Parse existing code
const params = getParamsFromCodigo('12324101101000');
// Returns: { dia, semana, año, turno, calibre, formato, empresa }

// Generate new code
const newCode = generatePalletCode({
  turno: 1,
  calibre: '01',
  formato: 1,
  empresa: 1
});
```

### Working with Box Codes
```typescript
import { parseBoxCode } from '@/utils/boxCodeParser';
import { formatBoxInfo } from '@/utils/boxCodeFormatters';

// Parse 16-digit code
const boxData = parseBoxCode('1234567890123456');
// Returns: { calibre, operario, contador, ... }

// Format for display
const formatted = formatBoxInfo(box);
```

### Handling Locations and State Transitions

Valid location transitions:
- PACKING → TRANSITO → BODEGA (normal flow)
- BODEGA → PREVENTA → VENTA (sales flow)
- Any → UNSUBSCRIBED (removal)

Pallet states:
- `open`: Can add/remove boxes
- `closed`: Sealed, can only move locations

### Path Alias
The project uses `@` as an alias for `/src`:
```typescript
import { Box } from '@/types';
import { parseBoxCode } from '@/utils/boxCodeParser';
import { useBoxes } from '@/contexts/BoxesContext';
```

## UI Component Library: shadcn/ui

The project uses **shadcn/ui** as its component library, with custom extensions for Lomas Altas-specific features. shadcn/ui is built on Radix UI and Tailwind CSS.

### Component Architecture

The application has **three layers** of components:

1. **Base shadcn/ui components** (`src/components/ui/`) - Unmodified shadcn components
2. **Extended components** (`src/components/ui/*-extended.tsx`) - shadcn components with Lomas Altas extensions
3. **Custom components** (`src/components/design-system/`) - Unique components not from shadcn

**Import Pattern**: Always import from `@/components/design-system` for consistency:

```typescript
// ✅ Correct - uses design system facade
import { Button, Input, Card, Modal } from '@/components/design-system';

// ❌ Avoid - direct imports bypass the facade
import { Button } from '@/components/ui/button';
```

The design system facade (`src/components/design-system/index.ts`) exports the right component version automatically.

### Extended Components (Migrated to shadcn/ui)

These components wrap shadcn/ui with additional features:

#### Button (`button-extended.tsx`)
- **Added features**: `isLoading`, `leftIcon`, `rightIcon`
- **Legacy support**: Maps `primary` → `default`, `danger` → `destructive`, `small` → `sm`, `medium` → `default`, `large` → `lg`
- **Usage**:
  ```typescript
  <Button isLoading={isSubmitting}>Submit</Button>
  <Button leftIcon={<Plus />}>Add Pallet</Button>
  <Button variant="destructive">Delete</Button>
  ```

#### Input (`input-extended.tsx`)
- **Added features**: `label`, `error`, `helperText`, `leftIcon`, `rightIcon`
- **Usage**:
  ```typescript
  <Input
    label="Email"
    error="Invalid email"
    leftIcon={<Mail />}
    placeholder="Enter email"
  />
  ```

#### Card (`card-extended.tsx`)
- **Added features**: `variant`, `isHoverable`, `isPressable`, `isSelected`, `padding`
- **Usage**:
  ```typescript
  <Card isHoverable isPressable onClick={handleClick}>
    <CardHeader>
      <CardTitle>Clickable Card</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
  ```

### Custom Components (Kept from Original Design System)

These components remain custom because they have unique functionality:

- **Modal** (`Modal.tsx`) - macOS traffic lights, resizable windows
- **DataTable** (`DataTable.tsx`) - Complex sorting and expandable rows (to be migrated)
- **EditableCell** - Inline editing with debounce
- **WindowContainer** - Layout component
- **LoadingOverlay** - Loading state overlay

### Available shadcn/ui Base Components

Located in `src/components/ui/`:
- **Button, Card, Input, Label, Badge** - Use extended versions via design-system
- **Dialog** - Modal dialogs
- **Form** - Form components with React Hook Form integration
- **Select, Textarea, Checkbox, Radio Group, Switch** - Form inputs
- **Alert Dialog, Popover, Tooltip** - Overlay components
- **Table, Scroll Area, Tabs, Separator** - Layout components
- **Sonner** - Toast notifications ✅ **INTEGRATED** (use `useNotifications()` hook)

### React Hook Form Integration

The project uses **React Hook Form** with **Zod** for form validation. Form helpers are available in `@/components/ui/form-helpers`:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormInput, FormTextarea, FormSelect } from '@/components/ui/form-helpers';
import { Button } from '@/components/design-system';

// Define validation schema
const customerSchema = z.object({
  nombre: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format').optional(),
  telefono: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

function CreateCustomerForm() {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    console.log('Form data:', data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={form.control}
          name="nombre"
          label="Customer Name"
          placeholder="Enter name"
        />

        <FormInput
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="email@example.com"
        />

        <FormTextarea
          control={form.control}
          name="notes"
          label="Notes"
          placeholder="Additional notes"
          rows={4}
        />

        <FormSelect
          control={form.control}
          name="type"
          label="Customer Type"
          options={[
            { value: 'MAYORISTA', label: 'Wholesaler' },
            { value: 'MINORISTA', label: 'Retailer' },
          ]}
        />

        <Button type="submit" isLoading={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
```

**Benefits**:
- Type-safe forms with Zod schema inference
- Automatic validation and error messages
- Built-in loading states
- Consistent styling across all forms

### Notification System (Sonner)

The project uses **Sonner** (shadcn/ui toast library) for all notifications. The `useNotifications()` hook provides a simple API:

```typescript
import { useNotifications } from '@/components/Notification';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Data saved successfully');
    } catch (error) {
      showError('Failed to save data', 5000); // Custom duration (ms)
    }
  };

  return (
    <Button onClick={handleSave}>Save</Button>
  );
}
```

**API**:
- `showSuccess(message: string, duration?: number)` - Green checkmark icon, 4s default
- `showError(message: string, duration?: number)` - Red X icon, 5s default
- `showWarning(message: string, duration?: number)` - Orange triangle icon, 4s default
- `showInfo(message: string, duration?: number)` - Blue info icon, 4s default

**Features**:
- Positioned at top-right corner (macOS style)
- Auto-dismiss with configurable duration
- Smooth slide-in animations
- Multiple toasts stack nicely
- Accessible (ARIA attributes)
- Consistent with shadcn/ui design system

**Note**: The Toaster component is already configured in `App.tsx` - no setup needed in individual components.

### Using Components

```typescript
import { Button, Card, Input } from '@/components/design-system';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card-extended';
import { Badge } from '@/components/ui/badge';

// Button with legacy variant support
<Button variant="primary">Primary (maps to default)</Button>
<Button variant="destructive">Delete</Button>
<Button isLoading={true}>Loading...</Button>

// Card with interactions
<Card isHoverable isPressable onClick={handleClick}>
  <CardHeader>
    <CardTitle>Pallet 12324101101000</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
</Card>

// Input with label and error
<Input
  label="Box Code"
  error={errors.code?.message}
  placeholder="Enter 16-digit code"
/>

// Badge with custom colors (macOS integration)
<Badge className="bg-green-100 text-green-700 border-green-200">
  <MapPin className="w-3 h-3 mr-1" />
  BODEGA
</Badge>
```

### Utility Function: `cn()`

Use the `cn()` utility (from `@/lib/utils`) to merge Tailwind classes:

```typescript
import { cn } from '@/lib/utils';

<Card className={cn(
  'transition-all',
  isSelected && 'border-macos-accent ring-2 ring-macos-accent/20',
  isHovered && 'shadow-lg'
)} />
```

### macOS Colors with shadcn/ui

Your existing macOS color palette works seamlessly with shadcn/ui:

```typescript
// Use macOS colors alongside shadcn/ui classes
<Button className="bg-macos-accent hover:bg-macos-accent-hover">
  macOS Style Button
</Button>

// Location badges with macOS colors
<Badge className="bg-green-100 text-green-700">BODEGA</Badge>
<Badge className="bg-blue-100 text-blue-700">PACKING</Badge>
<Badge className="bg-orange-100 text-orange-700">TRANSITO</Badge>
```

### Adding New Components

To add more shadcn/ui components:

```bash
# Install a specific component
npx shadcn@latest add [component-name]

# Examples
npx shadcn@latest add table
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add textarea
```

This will copy the component into `src/components/ui/` where you can customize it.

## Important Notes

### Business Rules
- Pallets must have at least 1 box to close (no empty closed pallets)
- Boxes must have valid 16-digit codes
- Pallet codes are 14 digits
- Each box can only belong to one pallet
- Sales can only use boxes in BODEGA location
- Audit must pass before closing (or user must explicitly override)

### Code Quality Standards
- All new code must pass TypeScript type checking
- Follow existing patterns for consistency
- Use Spanish for domain concepts (pallet, calibre, ubicacion)
- Use English for technical concepts (state, loading, error)
- Keep components focused and single-purpose
- Extract complex logic into custom hooks or utility functions

### Backend Integration
The backend is serverless AWS (API Gateway + Lambda + DynamoDB). Key points:
- API returns data in various formats (migrating to standardized format)
- Some responses wrap data in `{ data: ... }`, others return directly
- Pagination uses cursor-based approach with `lastKey`/`nextKey`
- Concurrent modifications possible (no optimistic locking yet)

### Performance Considerations
- Views use lazy loading to reduce initial bundle size
- Large lists should use pagination (pallets, boxes, sales)
- Contexts re-fetch data after mutations to stay in sync
- Consider memoization for expensive calculations (freshness, metrics)

## Domain-Specific Knowledge

### Caliber Codes (Calibre)
Eggs classified by size and color:
- `01`: ESPECIAL BCO (white, special)
- `02`: EXTRA BCO (white, extra)
- `03`: ESPECIAL COLOR
- `04`: GRANDE BCO
- `07`: MEDIANO BCO
- `08`: SUCIO / TRIZADO (dirty/cracked)
- See full list in `src/types/index.ts` (`CalibreCode`)

### Format Codes (Formato)
Box sizes:
- `1`: 180 units
- `2`: 100 JUMBO
- `3`: Dozen

### Company Codes (Empresa)
- `01`: Lomas Altas
- `02`: Santa Marta
- `03`: Coliumo
- `04`: El Monte
- `05`: Libre

### Shift Codes (Turno)
- `1`: Morning (Mañana)
- `2`: Afternoon (Tarde)
- `3`: Night (Noche)

## Reference Documentation

For detailed user workflows and operations, see `MANUAL_OPERADORES.md` which contains:
- Step-by-step operator instructions
- UI interaction flows
- Code structure explanations
- Troubleshooting guides
- FAQ section
