import { CheckCircle, MapPin, MoveRight, Printer } from 'lucide-react';

import { Button } from '@/components/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pallet } from '@/types';

interface PalletFooterActionsProps {
  pallet: Pallet;
  selectionMode: boolean;
  moveLocations: string[];
  onPrintLabel: () => void;
  onToggleSelectionMode: () => void;
  onStartAudit: () => void;
  onMovePallet?: (codigo: string, location: string) => void;
}

export default function PalletFooterActions({
  pallet,
  selectionMode,
  moveLocations,
  onPrintLabel,
  onToggleSelectionMode,
  onStartAudit,
  onMovePallet,
}: PalletFooterActionsProps) {
  return (
    <div className="shrink-0 border-t px-6 py-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="secondary"
          size="medium"
          leftIcon={<Printer size={16} />}
          onClick={onPrintLabel}
        >
          Generar Etiqueta
        </Button>

        {pallet.estado === 'open' ? (
          <>
            <Button
              variant={selectionMode ? 'primary' : 'secondary'}
              size="medium"
              leftIcon={<MoveRight size={16} />}
              onClick={onToggleSelectionMode}
            >
              {selectionMode ? 'Cancelar mover' : 'Mover Cajas'}
            </Button>
            <Button
              variant="primary"
              size="medium"
              leftIcon={<CheckCircle size={16} />}
              onClick={onStartAudit}
            >
              Cerrar Pallet
            </Button>
          </>
        ) : (
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
        )}
      </div>
    </div>
  );
}
