import { MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Pallet } from '@/types';
import { cn } from '@/lib/utils';

interface PalletDetailHeaderProps {
  pallet: Pallet;
  boxesSummary: string;
}

const locationColors: Record<string, string> = {
  packing: 'bg-blue-100 text-blue-700 border-blue-200',
  bodega: 'bg-green-100 text-green-700 border-green-200',
  venta: 'bg-purple-100 text-purple-700 border-purple-200',
  transito: 'bg-orange-100 text-orange-700 border-orange-200',
};

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function PalletDetailHeader({
  pallet,
  boxesSummary,
}: PalletDetailHeaderProps) {
  const locationColor =
    locationColors[pallet.ubicacion.toLowerCase()] ??
    'bg-gray-100 text-gray-700 border-gray-200';

  const statusColor =
    statusColors[pallet.estado] ?? 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="shrink-0 border-b px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold">Detalles de Pallet {pallet.codigo}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn('inline-flex items-center gap-1.5', locationColor)}
            >
              <MapPin className="h-3.5 w-3.5" />
              {pallet.ubicacion}
            </Badge>
            <Badge variant="outline" className={statusColor}>
              {pallet.estado === 'open' ? 'Abierto' : 'Cerrado'}
            </Badge>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Cajas: <span className="font-semibold text-foreground">{boxesSummary}</span>
        </div>
      </div>
    </div>
  );
}
