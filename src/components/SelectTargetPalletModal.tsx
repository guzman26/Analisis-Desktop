import React, { useEffect, useMemo, useState } from 'react';

import { Button, LoadingOverlay } from '@/components/design-system';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/app-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePalletServerState } from '@/modules/inventory';
import { cn } from '@/lib/utils';
import {
  formatCalibreName,
  getCalibreFromCodigo,
  getEmpresaFromCodigo,
  getTurnoNombre,
} from '@/utils/getParamsFromCodigo';
import { getPalletBoxCount } from '@/utils/palletHelpers';
import { Package } from 'lucide-react';
import { normalizeCompanyCode } from '@/utils/company';

interface SelectTargetPalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  excludePalletCode?: string;
  onConfirm: (targetPalletCode: string) => void;
}

const SelectTargetPalletModal: React.FC<SelectTargetPalletModalProps> = ({
  isOpen,
  onClose,
  excludePalletCode,
  onConfirm,
}) => {
  const { openPallets, fetchActivePallets, loading } = usePalletServerState();
  const [selectedCode, setSelectedCode] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      void fetchActivePallets();
      setSelectedCode('');
      setQuery('');
    }
  }, [fetchActivePallets, isOpen]);

  const pallets = useMemo(
    () => {
      const sourceCompany = excludePalletCode
        ? normalizeCompanyCode(getEmpresaFromCodigo(excludePalletCode))
        : '';

      return openPallets
        .filter((pallet) => pallet.codigo !== excludePalletCode)
        .filter((pallet) => {
          if (!sourceCompany) return true;
          return normalizeCompanyCode(getEmpresaFromCodigo(pallet.codigo)) === sourceCompany;
        })
        .filter((pallet) =>
          query.trim()
            ? pallet.codigo.toLowerCase().includes(query.trim().toLowerCase())
            : true
        );
    },
    [excludePalletCode, openPallets, query]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent layer={70} className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Seleccionar pallet destino</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <LoadingOverlay show={loading} text="Cargando pallets abiertos..." />

          <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <Package className="mr-1 inline h-4 w-4" />
              Selecciona el pallet destino para mover las cajas elegidas.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-pallet-search" className="text-sm font-medium">
              Buscar por codigo
            </Label>
            <Input
              id="target-pallet-search"
              placeholder="Ej: 43225..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <Card>
            <ScrollArea className="h-80">
              {loading && (
                <div className="p-4 text-sm text-muted-foreground">Cargando...</div>
              )}

              {!loading && pallets.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No hay pallets abiertos disponibles en PACKING
                </div>
              )}

              {!loading && pallets.length > 0 && (
                <RadioGroup value={selectedCode} onValueChange={setSelectedCode}>
                  <div className="divide-y">
                    {pallets.map((pallet) => {
                      const isSelected = selectedCode === pallet.codigo;
                      const calibre = getCalibreFromCodigo(pallet.codigo);
                      const capacityInfo =
                        typeof pallet.maxBoxes === 'number' &&
                        !Number.isNaN(pallet.maxBoxes)
                          ? `${getPalletBoxCount(pallet)}/${pallet.maxBoxes}`
                          : `${getPalletBoxCount(pallet)}`;

                      const radioId = `target-${pallet.codigo}`;

                      return (
                        <Label
                          key={pallet.codigo}
                          htmlFor={radioId}
                          className={cn(
                            'flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors',
                            isSelected
                              ? 'border-l-4 border-primary bg-primary/10'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <RadioGroupItem id={radioId} value={pallet.codigo} className="mt-1" />

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <Package className="h-4 w-4 text-primary" />
                              <span className="break-all font-mono text-sm font-semibold">
                                {pallet.codigo}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span className="rounded-md border bg-muted px-2 py-0.5">
                                {formatCalibreName(calibre)}
                              </span>
                              <span>Cajas: {capacityInfo}</span>
                              <span>Turno: {getTurnoNombre(pallet.codigo)}</span>
                            </div>
                          </div>
                        </Label>
                      );
                    })}
                  </div>
                </RadioGroup>
              )}
            </ScrollArea>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={!selectedCode}
            onClick={() => onConfirm(selectedCode)}
          >
            Confirmar y mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectTargetPalletModal;
