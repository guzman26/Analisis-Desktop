import { CheckSquare, Layers, Package, PackageX } from 'lucide-react';

import { Button, Card } from '@/components/design-system';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  formatCalibreName,
  getCalibreFromCodigo,
  getContadorFromCodigo,
  getOperarioFromCodigo,
} from '@/utils/getParamsFromCodigo';

interface PalletBoxesTabProps {
  boxCodes: string[];
  selectionMode: boolean;
  selectedBoxCodes: Set<string>;
  isMovingBoxes: boolean;
  moveFeedback: {
    type: 'success' | 'error';
    message: string;
  } | null;
  onBoxClick: (codigo: string) => void;
  onToggleBoxSelection: (codigo: string) => void;
  onToggleSelectAll: () => void;
  onOpenTargetModal: () => void;
}

export default function PalletBoxesTab({
  boxCodes,
  selectionMode,
  selectedBoxCodes,
  isMovingBoxes,
  moveFeedback,
  onBoxClick,
  onToggleBoxSelection,
  onToggleSelectAll,
  onOpenTargetModal,
}: PalletBoxesTabProps) {
  const selectedCount = selectedBoxCodes.size;

  return (
    <div className="space-y-4 pb-1">
      <Card variant="flat">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <h3 className="text-sm font-medium">Historial reciente</h3>
            <Badge variant="secondary">{boxCodes.length}</Badge>
          </div>

          {selectionMode && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="small" onClick={onToggleSelectAll}>
                {selectedCount === boxCodes.length
                  ? 'Deseleccionar todo'
                  : 'Seleccionar todo'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedCount} seleccionada(s)
              </span>
            </div>
          )}
        </div>

        {boxCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <PackageX className="mb-3 h-8 w-8 opacity-60" />
            No hay cajas registradas en este pallet
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {boxCodes.map((codigo, index) => {
              const isSelected = selectedBoxCodes.has(codigo);
              return (
                <div
                  key={codigo}
                  className="group relative min-w-0 overflow-hidden rounded-md border bg-card transition-all duration-200 hover:border-primary hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => onBoxClick(codigo)}
                    className="absolute inset-0 z-0 cursor-pointer"
                    aria-label={`Abrir caja ${codigo}`}
                  />

                  {selectionMode && (
                    <div className="absolute left-3 top-3 z-20 rounded bg-background/80 p-0.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleBoxSelection(codigo)}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </div>
                  )}

                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary to-primary/70" />

                  <div className="relative z-10 min-w-0 space-y-3 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="truncate text-xs font-medium text-muted-foreground">
                          Caja #{index + 1}
                        </span>
                      </div>
                      <div className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-xs text-muted-foreground">Codigo</p>
                      <p className="break-all font-mono text-sm font-medium">{codigo}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Op: {getOperarioFromCodigo(codigo)}
                      </span>
                      <span className="rounded-md border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Cal: {formatCalibreName(getCalibreFromCodigo(codigo))}
                      </span>
                      <span className="rounded-md border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        N°{getContadorFromCodigo(codigo)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {selectionMode && (
        <Card variant="flat">
          <div className="space-y-3">
            <Button
              variant="primary"
              size="medium"
              leftIcon={<CheckSquare size={16} />}
              disabled={isMovingBoxes || selectedCount === 0}
              onClick={onOpenTargetModal}
            >
              {isMovingBoxes ? 'Moviendo...' : 'Mover seleccionadas'}
            </Button>

            {moveFeedback && (
              <div
                className={`rounded-md border p-3 text-sm ${
                  moveFeedback.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {moveFeedback.message}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
