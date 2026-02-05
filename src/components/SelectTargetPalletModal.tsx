import React, { useEffect, useState } from 'react';
import { Button, LoadingOverlay } from '@/components/design-system';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { usePalletContext } from '@/contexts/PalletContext';
import {
  getCalibreFromCodigo,
  getTurnoNombre,
  formatCalibreName,
} from '@/utils/getParamsFromCodigo';
import { Package, CheckCircle } from 'lucide-react';

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
  const { openPallets, fetchActivePallets, loading } = usePalletContext();
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchActivePallets();
      setSelectedCode('');
      setQuery('');
    }
  }, [isOpen]);

  const pallets = openPallets
    .filter((p) => p.codigo !== excludePalletCode)
    .filter((p) =>
      query.trim()
        ? p.codigo.toLowerCase().includes(query.trim().toLowerCase())
        : true
    );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Seleccionar pallet destino</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <LoadingOverlay show={loading} text="Cargando pallets abiertos…" />

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <Package className="w-4 h-4 inline mr-1" />
              Seleccione el pallet de destino para mover las cajas seleccionadas.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar por código</label>
            <Input
              placeholder="Ej: 43225…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Card>
            <div className="max-h-80 overflow-y-auto divide-y">
              {loading && (
                <div className="p-3 text-muted-foreground">Cargando…</div>
              )}
              {!loading && pallets.length === 0 && (
                <div className="p-3 text-muted-foreground text-center">
                  No hay pallets abiertos disponibles en PACKING
                </div>
              )}
              {!loading &&
                pallets.map((p) => {
                  const isSelected = selectedCode === p.codigo;
                  const calibre = getCalibreFromCodigo(p.codigo);
                  const capacityInfo = p.maxBoxes
                    ? `${p.cantidadCajas}/${p.maxBoxes}`
                    : `${p.cantidadCajas}`;

                  return (
                    <button
                      key={p.codigo}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border-l-4 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedCode(p.codigo)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-primary" />
                            <span className="font-mono font-semibold">
                              {p.codigo}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-md bg-muted border">
                              {formatCalibreName(calibre)}
                            </span>
                            <span>Cajas: {capacityInfo}</span>
                            <span>Turno: {getTurnoNombre(p.codigo)}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-primary">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              Seleccionado
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
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
