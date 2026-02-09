import type { Dispatch } from '@/types';
import type { ModuleApiAdapter } from '@/modules/core';

export type DispatchDto = Partial<Dispatch> & {
  id?: string;
  folio?: string;
  pallets?: string[];
};

const fallbackIsoDate = () => new Date().toISOString();

export const dispatchAdapter: ModuleApiAdapter<DispatchDto, Dispatch> = {
  fromDto: (dto) => ({
    id: dto.id ?? '',
    folio: dto.folio ?? '',
    fecha: dto.fecha ?? fallbackIsoDate(),
    horaLlegada: dto.horaLlegada ?? fallbackIsoDate(),
    destino: dto.destino ?? 'Otro',
    patenteCamion: dto.patenteCamion ?? '',
    nombreChofer: dto.nombreChofer ?? '',
    despachador: dto.despachador ?? '',
    cargador: dto.cargador ?? '',
    numeroSello: dto.numeroSello ?? '',
    pallets: Array.isArray(dto.pallets) ? dto.pallets : [],
    estado: dto.estado ?? 'DRAFT',
    createdAt: dto.createdAt ?? fallbackIsoDate(),
    updatedAt: dto.updatedAt ?? fallbackIsoDate(),
    createdBy: dto.createdBy,
    approvedAt: dto.approvedAt,
    approvedBy: dto.approvedBy,
    stateHistory: dto.stateHistory,
  }),
};

export const mapDispatchList = (items: DispatchDto[] = []): Dispatch[] => {
  return items.map((item) => dispatchAdapter.fromDto(item));
};
