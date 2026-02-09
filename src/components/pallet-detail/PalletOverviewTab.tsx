import {
  Building2,
  Calendar,
  Clock,
  Hash,
  Layers,
  Package,
} from 'lucide-react';

import { Card } from '@/components/design-system';
import InfoRow from '@/components/shared/InfoRow';
import { Pallet } from '@/types';
import {
  formatCalibreName,
  getEmpresaNombre,
  getTurnoNombre,
} from '@/utils/getParamsFromCodigo';

interface PalletOverviewTabProps {
  pallet: Pallet;
  formattedDate: string;
  calibre: string;
  realBoxCount: number;
}

export default function PalletOverviewTab({
  pallet,
  formattedDate,
  calibre,
  realBoxCount,
}: PalletOverviewTabProps) {
  return (
    <div className="space-y-4 pb-1">
      <Card variant="flat" padding="none">
        <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="space-y-1">
            <InfoRow
              icon={<Package className="h-5 w-5" />}
              label="Calibre"
              value={formatCalibreName(calibre)}
            />
            <InfoRow
              icon={<Calendar className="h-5 w-5" />}
              label="Fecha de Creacion"
              value={formattedDate}
            />
          </div>
          <div className="space-y-1">
            <InfoRow
              icon={<Layers className="h-5 w-5" />}
              label="Total de Cajas"
              value={realBoxCount}
            />
            <InfoRow
              icon={<Package className="h-5 w-5" />}
              label="Capacidad (maxBoxes)"
              value={pallet.maxBoxes ?? 'N/A'}
            />
            <InfoRow
              icon={<Hash className="h-5 w-5" />}
              label="Estado"
              value={pallet.estado === 'open' ? 'Abierto' : 'Cerrado'}
            />
            <InfoRow
              icon={<Building2 className="h-5 w-5" />}
              label="Empresa"
              value={getEmpresaNombre(pallet.codigo)}
            />
            <InfoRow
              icon={<Clock className="h-5 w-5" />}
              label="Turno"
              value={getTurnoNombre(pallet.codigo)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
