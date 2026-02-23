// Core domain types
export type PalletState = 'open' | 'closed';
export type Location =
  | 'PACKING'
  | 'TRANSITO'
  | 'BODEGA'
  | 'PREVENTA'
  | 'VENTA'
  | 'UNSUBSCRIBED'
  | 'RECHAZO'
  | 'CUARENTENA';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';
export type SaleType =
  | 'Venta'
  | 'Reposición'
  | 'Donación'
  | 'Inutilizado'
  | 'Ración';
export type SaleState =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'DISPATCHED'
  | 'PARTIALLY_RETURNED'
  | 'FULLY_RETURNED'
  | 'COMPLETED'
  | 'CANCELLED';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type Priority = 'low' | 'medium' | 'high';
export type DispatchState = 'DRAFT' | 'APPROVED' | 'CANCELLED';
export type DispatchDestination = 'Bodega Lomas Altas Capilla' | 'Otro';

// Códigos de calibre válidos (centralizados)
export type CalibreCode =
  | '01' // ESPECIAL BCO
  | '02' // EXTRA BCO
  | '04' // GRANDE BCO
  | '07' // MEDIANO BCO
  | '09' // TERCERA BCO
  | '15' // CUARTA BCO
  | '12' // JUMBO BCO
  | '03' // ESPECIAL COLOR
  | '05' // EXTRA COLOR
  | '06' // GRANDE COLOR
  | '13' // MEDIANO COLOR
  | '11' // TERCERA COLOR
  | '16' // CUARTA COLOR
  | '14' // JUMBO COLOR
  | '08'; // SUCIO / TRIZADO

// Pagination params (cursor-based). Support both keys during migration.
export interface PaginationParams {
  limit?: number;
  lastKey?: string;
  // Deprecated alias supported by backend in some endpoints
  lastEvaluatedKey?: string;
}

// Paginated response – consolidated API format (data is unwrapped)
export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  nextKey?: string | null;
}

// Domain entities
export interface Pallet {
  codigo: string;
  baseCode: string;
  suffix: string;
  pkFecha: string;
  fechaCalibreFormato: string;
  estado: PalletState;
  cajas?: string[]; // Optional: may be boxes instead
  boxes?: string[]; // Alternative field name from API
  cantidadCajas?: number; // Optional: may be undefined for legacy data
  fechaCreacion: string;
  ubicacion: Location;
  calibre: string; // CalibreCode o nombre formateado
  // Capacidad máxima de cajas configurada para el pallet
  maxBoxes?: number;
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
  calibre: string; // CalibreCode - cambio de number a string para consistencia
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

export interface Cart {
  codigo: string;
  pkTipo: 'CART';
  calibre: string;
  formato: string; // '4' o '5' para carros
  empresa: string;
  operario: string;
  empacadora: string;
  turno: string;
  ubicacion: Location;
  cantidadBandejas: number;
  cantidadHuevos: number;
  formatId?: string | null;
  fechaCreacion: string;
  updatedAt: string;
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
  saleNumber?: string; // Número único de venta (ej: V-2024-0001)
  customerId: string;
  type: SaleType;
  state?: SaleState;
  customerInfo?: {
    name: string;
    email?: string;
    phone?: string;
  };
  customerName?: string; // Backend also provides customerName directly
  items?: SaleItem[]; // Optional - for backward compatibility
  pallets?: string[]; // Array of pallet codes
  boxes?: string[]; // Array of box codes
  createdAt: string;
  reportUrl?: string;
  totalBoxes?: number;
  totalEggs?: number;
  notes?: string;
  metadata?: {
    deliveryDate?: string;
    priority?: Priority;
    returnHistory?: ReturnRecord[];
    additionHistory?: AdditionRecord[];
    requestedBoxesByCalibre?: Array<{ calibre: string; boxCount: number }>; // Cajas solicitadas por calibre
    totalRequestedBoxes?: number; // Total de cajas solicitadas
    boxesByCalibre?: Record<string, number>; // Cajas actuales por calibre
    [key: string]: any;
  };
  confirmedAt?: string;
  dispatchedAt?: string;
  completedAt?: string;
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
  fechaDesde?: string;
  fechaHasta?: string;
  calibre?: string;
  empresa?: string;
  turno?: string;
  searchTerm?: string;
}

export interface GetActivePalletsParams extends PaginationParams {
  ubicacion: Location;
}

export interface GetCartsParams extends PaginationParams {
  ubicacion?: Location;
  filters?: {
    calibre?: string;
    formato?: string;
    empresa?: string;
    turno?: string;
  };
}

export interface GetCustomersParams {
  status?: CustomerStatus;
  searchTerm?: string;
}

export interface GetSalesOrdersParamsPaginated extends PaginationParams {
  state?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  filters?: {
    state?: string;
    customerId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  };
}

export interface GetIssuesParamsPaginated extends PaginationParams {
  filters?: {
    status?: string;
    ubicacion?: string;
  };
}

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
  totalEggs?: number;
}

// Nueva estructura para selección por calibre y cantidad
export interface CalibreSelection {
  calibre: string;
  boxCount: number;
}

export interface SaleRequest {
  customerId: string;
  type: SaleType;
  items?: SaleItem[]; // Opcional para mantener compatibilidad
  calibres?: CalibreSelection[]; // Nueva estructura para selección por calibre
  notes?: string;
  metadata?: {
    deliveryDate?: string;
    priority?: Priority;
    [key: string]: any;
  };
}

// Customer Preferences
export interface CustomerPreferences {
  customerId: string;
  topCalibers: Array<{
    caliber: string;
    count: number;
    percentage: number;
  }>;
  topFormats: Array<{
    format: string;
    count: number;
    percentage: number;
  }>;
  avgBoxesPerOrder: number;
  avgEggsPerOrder: number;
  lastPurchase: string | null;
  totalOrders: number;
  totalBoxes: number;
  totalEggs: number;
}

// Return and Exchange types
export type ReturnReason =
  | 'damaged'
  | 'wrong_caliber'
  | 'customer_request'
  | 'quality_issue'
  | 'expired'
  | 'other';

export interface ReturnRecord {
  returnId: string;
  boxIds: string[];
  reason: ReturnReason;
  reasonDetails?: string;
  returnedAt: string;
  returnedBy: string;
}

export interface AdditionRecord {
  additionId: string;
  boxIds: string[];
  addedAt: string;
  addedBy: string;
  reason?: string;
}

export interface ReturnBoxesRequest {
  saleId: string;
  boxIds: string[];
  reason: ReturnReason;
  reasonDetails?: string;
}

export interface AddBoxesToSaleRequest {
  saleId: string;
  items?: SaleItem[];
  boxCode?: string;
  palletCode?: string;
  reason?: string;
}

export interface AddBoxesToSaleResponse {
  sale: Sale;
  currentEggs?: number;
  isComplete?: boolean;
  boxesByCalibre?: Record<string, number>;
  remainingBoxes?: Record<string, number>;
  addedItem?: {
    type: 'box' | 'pallet';
    code: string;
    calibre?: string | null;
    eggs?: number;
  };
  batch?: {
    processed: number;
    mode: 'items';
  };
}

// Inventory Validation types
export interface BoxAvailability {
  boxId: string;
  available: boolean;
  reason?: string;
  currentUbicacion?: Location;
  reservedFor?: string;
}

export interface InventoryValidationResult {
  valid: boolean;
  calibreAvailability?: Array<{
    calibre: string;
    requested: number;
    available: number;
    missing: number;
  }>;
  totalItems?: number;
  totalBoxes?: number;
  unavailableBoxes?: BoxAvailability[];
  palletErrors?: Array<{
    palletId: string;
    available: boolean;
    reason: string;
    errorCode?: string;
    currentUbicacion?: string;
    currentEstado?: string;
  }>;
  boxErrors?: Array<{
    boxId: string;
    palletId: string;
    available: boolean;
    reason: string;
    errorCode?: string;
    currentUbicacion?: string;
    reservedFor?: string;
    reservedSaleId?: string;
    soldTo?: string;
    actualPalletId?: string;
  }>;
  errors?: Array<{
    type: string;
    message: string;
    item?: any;
  }>;
  summary?: {
    totalErrors: number;
    palletErrorCount: number;
    boxErrorCount: number;
  };
  message?: string;
  totalChecked?: number;
  totalAvailable?: number;
}

// Enhanced Error types
export type SalesErrorCode =
  | 'CUSTOMER_INACTIVE'
  | 'BOX_NOT_AVAILABLE'
  | 'BOX_NOT_FOUND'
  | 'PALLET_MISMATCH'
  | 'INVALID_TRANSITION'
  | 'CONCURRENT_MODIFICATION'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface SalesError extends Error {
  code: SalesErrorCode;
  details?: Record<string, any>;
  recoverable?: boolean;
}

// Transport resource types
export interface Truck {
  id: string;
  patente: string;
  descripcion?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id: string;
  nombre: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dispatcher {
  id: string;
  nombre: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Loader {
  id: string;
  nombre: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Dispatch types
export interface Dispatch {
  id: string;
  folio: string;
  fecha: string;
  horaLlegada: string;
  destino: DispatchDestination;
  patenteCamion: string;
  nombreChofer: string;
  despachador: string;
  cargador: string;
  numeroSello: string;
  pallets: string[];
  estado: DispatchState;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  stateHistory?: Array<{
    state: DispatchState;
    timestamp: string;
    userId: string;
    notes?: string;
  }>;
}

export interface CreateDispatchRequest {
  fecha: string;
  horaLlegada: string;
  destino: DispatchDestination;
  patenteCamion: string;
  nombreChofer: string;
  despachador: string;
  cargador: string;
  numeroSello: string;
  pallets: string[];
  userId?: string;
}

export interface UpdateDispatchRequest {
  fecha?: string;
  horaLlegada?: string;
  destino?: DispatchDestination;
  patenteCamion?: string;
  nombreChofer?: string;
  despachador?: string;
  cargador?: string;
  numeroSello?: string;
  pallets?: string[];
}

export interface GetDispatchesParamsPaginated extends PaginationParams {
  estado?: DispatchState;
  destino?: DispatchDestination;
  startDate?: string;
  endDate?: string;
}
