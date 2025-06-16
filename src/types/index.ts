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
