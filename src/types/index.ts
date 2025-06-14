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
