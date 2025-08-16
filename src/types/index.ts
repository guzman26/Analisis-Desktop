// Core domain types
export type PalletState = 'open' | 'closed';
export type Location =
  | 'PACKING'
  | 'TRANSITO'
  | 'BODEGA'
  | 'PREVENTA'
  | 'VENTA'
  | 'UNSUBSCRIBED';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';
export type SaleType =
  | 'Venta'
  | 'Reposición'
  | 'Donación'
  | 'Inutilizado'
  | 'Ración';
export type SaleState = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type Priority = 'low' | 'medium' | 'high';

// Pagination params (cursor-based). Support both keys during migration.
export interface PaginationParams {
  limit?: number;
  lastKey?: string;
  // Deprecated alias supported by backend in some endpoints
  lastEvaluatedKey?: string;
}

// Paginated response – standardized wrapper
export interface PaginatedResponse<T> {
  status: 'success' | 'fail' | 'error';
  message: string;
  data: {
    items: T[];
    count: number;
    nextKey: string | null;
  };
  meta?: {
    requestId: string;
    timestamp: string; // ISO-8601
  };
}

// Domain entities
export interface Pallet {
  codigo: string;
  baseCode: string;
  suffix: string;
  pkFecha: string;
  fechaCalibreFormato: string;
  estado: PalletState;
  cajas: string[];
  cantidadCajas: number;
  fechaCreacion: string;
  ubicacion: Location;
  calibre: string;
  // Nuevo: tipo de contenido del pallet y cantidades de huevo suelto
  contentType?: PalletContentType;
  looseEggs?: LooseEggs;
}

// Custom info structure for eggs in a box
export interface EggInfo {
  code: string;
  quantity: number;
}

// Tipos para pallets con huevo suelto
export type PalletContentType = 'BOXES' | 'LOOSE' | 'MIXED';

export interface LooseEggs {
  carts: number; // carritos
  trays: number; // bandejas
  eggs: number; // huevos
}

// Requests para crear pallets de huevo suelto
export interface CreateLooseEggPalletRequest {
  codigo: string; // baseCode del pallet
  ubicacion?: Location;
  carts?: number;
  trays?: number;
  eggs?: number;
  empresa?: string | number;
}

export interface Box {
  id: string;
  codigo: string;
  empacadora: string;
  calibre: number;
  formato_caja: string;
  operario: string;
  estado: string;
  fecha_registro: string;
  semana: number;
  ubicacion: string;
  horario_proceso: string;
  contador: number;
  quantity: number;
  dia_semana: string;
  año: number;
  descripcion: string;
  palletId: string;
  customInfo?: EggInfo[];
}

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  contactPerson?: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  totalPurchases: string;
  lastPurchaseDate: string | null;
}

export interface Sale {
  saleId: string;
  customerId: string;
  type: SaleType;
  state?: SaleState;
  customerInfo?: {
    name: string;
    email?: string;
    phone?: string;
  };
  items: SaleItem[];
  createdAt: string;
  reportUrl?: string;
  totalBoxes?: number;
  notes?: string;
  metadata?: {
    deliveryDate?: string;
    priority?: Priority;
    [key: string]: any;
  };
}

// Audit types
export type AuditGrade = 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
export type IssueSeverity = 'WARNING' | 'CRITICAL';
export type IssueType =
  | 'COUNT_MISMATCH'
  | 'OVERFILLED'
  | 'UNDERUTILIZED'
  | 'DUPLICATE_BOXES'
  | 'SEQUENCE_GAPS'
  | 'DUPLICATE_SEQUENCES'
  | 'INVALID_BOX_CODES'
  | 'SEQUENCE_CHECK_ERROR'
  | 'INVALID_PALLET_CODE'
  | 'PALLET_NOT_FOUND'
  | 'AUDIT_ERROR';

export interface AuditIssue {
  type: IssueType;
  severity: IssueSeverity;
  message: string;
  details: {
    [key: string]: any;
  };
}

export interface AuditSummary {
  capacityPassed: boolean;
  uniquenessPassed: boolean;
  sequencePassed: boolean;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
}

export interface PalletAuditResult {
  passed: boolean;
  grade: AuditGrade;
  score: number;
  summary: AuditSummary;
  issues: AuditIssue[];
  details?: {
    [key: string]: any;
  };
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus | string;
  createdAt: string;
}

// Query parameters
export interface GetPalletsParams {
  estado?: PalletState;
  ubicacion?: Location;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface GetPalletsParamsPaginated
  extends GetPalletsParams,
    PaginationParams {}

// New types for closed and active pallets
export interface GetClosedPalletsParams extends PaginationParams {
  ubicacion: Location;
}

export interface GetActivePalletsParams extends PaginationParams {
  ubicacion: Location;
}

export interface GetCustomersParams {
  status?: CustomerStatus;
  searchTerm?: string;
}

export interface GetSalesOrdersParamsPaginated extends PaginationParams {
  state?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface GetIssuesParamsPaginated extends PaginationParams {}

// Server filter parameters for boxes inventory listing
export interface BoxFilterParams {
  calibre?: string | number;
  formato?: string;
  formato_caja?: string;
  empresa?: string | number;
  horario?: string;
  horario_proceso?: string;
  codigoPrefix?: string; // deprecated, use codigo
  codigo?: string; // nuevo: acepta exacto (16) o contiene (<16)
}

// Form data types
export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  contactPerson?: string;
  metadata?: Record<string, any>;
}

export interface SaleItem {
  palletId: string;
  boxIds: string[];
}

export interface SaleRequest {
  customerId: string;
  type: SaleType;
  items: SaleItem[];
  notes?: string;
  metadata?: {
    deliveryDate?: string;
    priority?: Priority;
    [key: string]: any;
  };
}
