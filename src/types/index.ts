// Core domain types
export type PalletState = 'open' | 'closed';
export type Location = 'PACKING' | 'TRANSITO' | 'BODEGA' | 'VENTA';
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

// Pagination params
export interface PaginationParams {
  limit?: number;
  lastEvaluatedKey?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: {
    items: T[];
    count: number;
    nextKey: string | null;
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
