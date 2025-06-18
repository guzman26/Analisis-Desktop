export interface Pallet {
  codigo: string;
  baseCode: string;
  suffix: string;
  pkFecha: string;
  fechaCalibreFormato: string;
  estado: 'open' | 'closed';
  cajas: string[];
  cantidadCajas: number;
  fechaCreacion: string;
  ubicacion: 'PACKING' | 'TRANSITO' | 'BODEGA' | 'VENTA';
  calibre: string;
}

export interface GetPalletsParams {
  estado?: 'open' | 'closed';
  ubicacion?: 'PACKING' | 'TRANSITO' | 'BODEGA' | 'VENTA';
  fechaDesde?: string;
  fechaHasta?: string;
}

// Parámetros de paginación para activePallets
export interface PaginationParams {
  limit?: number;
  lastEvaluatedKey?: string;
}

// Parámetros para obtener pallets con paginación
export interface GetPalletsParamsPaginated
  extends GetPalletsParams,
    PaginationParams {}

// Parámetros para obtener órdenes de venta con paginación
export interface GetSalesOrdersParamsPaginated extends PaginationParams {
  estado?: string;
  ubicacion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Respuesta de la API paginada
export interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: {
    items: T[];
    count: number;
    nextKey: string | null;
  };
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
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  // Sales tracking - using strings to match DynamoDB GSI requirements
  totalPurchases: string;
  totalSpent: string;
  lastPurchaseDate: string | null;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  contactPerson?: string;
  metadata?: Record<string, any>;
}

export interface GetCustomersParams {
  status?: 'ACTIVE' | 'INACTIVE';
  searchTerm?: string;
}

export interface SaleItem {
  palletId: string;
  boxIds: string[];
}

export interface Sale {
  saleId: string;
  customerId: string;
  customerInfo?: {
    name: string;
    email?: string;
    phone?: string;
  };
  items: SaleItem[];
  createdAt: string;
  reportUrl?: string;
  totalBoxes: number;
  unitPrice?: number;
  totalAmount?: number;
  notes?: string;
}

export interface SaleRequest {
  customerId: string;
  items: SaleItem[];
  unitPrice?: number;
  totalAmount?: number;
  notes?: string;
}

export interface SaleReport {
  url: string;
  generatedAt: string;
  format: string;
}
