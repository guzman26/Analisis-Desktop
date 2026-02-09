import { MapPin, MoveRight } from 'lucide-react';

import { Button, Card } from '@/components/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pallet } from '@/types';

interface PalletActionsTabProps {
  pallet: Pallet;
  moveLocations: string[];
  onMovePallet?: (codigo: string, location: string) => void;
}

export default function PalletActionsTab({
  pallet,
  moveLocations,
  onMovePallet,
}: PalletActionsTabProps) {
  return (
    <div className="space-y-4 pb-1">
      <Card variant="flat">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Acciones disponibles</h3>
          <p className="text-sm text-muted-foreground">
            Usa la barra inferior para cerrar pallet, generar etiqueta o activar modo de seleccion.
          </p>
        </div>
      </Card>

      {pallet.estado === 'closed' && (
        <Card variant="flat">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium">Mover pallet cerrado</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona la ubicacion destino para mover este pallet.
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="medium"
                  leftIcon={<MoveRight size={16} />}
                  disabled={!onMovePallet || moveLocations.length === 0}
                >
                  Mover Pallet
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {moveLocations.map((location) => (
                  <DropdownMenuItem
                    key={location}
                    onClick={() => onMovePallet?.(pallet.codigo, location)}
                  >
                    <MapPin className="h-4 w-4" />
                    Mover a {location}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      )}
    </div>
  );
}
