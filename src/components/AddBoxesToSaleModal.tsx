import React, { useState } from 'react';
import { Sale } from '@/types';
import { addBoxesToSale } from '@/api/endpoints';
import { useFilteredPallets } from '@/contexts/PalletContext';
import { getPalletBoxes } from '@/utils/palletHelpers';
import { useNotifications } from './Notification/Notification';
import { Button } from './design-system';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface AddBoxesToSaleModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBoxesToSaleModal: React.FC<AddBoxesToSaleModalProps> = ({
  sale,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { pallets: closedPalletsInBodega } = useFilteredPallets();
  const [selectedBoxes, setSelectedBoxes] = useState<Map<string, string[]>>(new Map());
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const handleToggleBox = (palletId: string, boxId: string) => {
    setSelectedBoxes((prev) => {
      const newMap = new Map(prev);
      const palletBoxes = newMap.get(palletId) || [];
      
      if (palletBoxes.includes(boxId)) {
        const filtered = palletBoxes.filter((id) => id !== boxId);
        if (filtered.length === 0) {
          newMap.delete(palletId);
        } else {
          newMap.set(palletId, filtered);
        }
      } else {
        newMap.set(palletId, [...palletBoxes, boxId]);
      }
      
      return newMap;
    });
  };

  const handleSelectAllFromPallet = (palletId: string, boxIds: string[]) => {
    setSelectedBoxes((prev) => {
      const newMap = new Map(prev);
      newMap.set(palletId, boxIds);
      return newMap;
    });
  };

  const handleDeselectAllFromPallet = (palletId: string) => {
    setSelectedBoxes((prev) => {
      const newMap = new Map(prev);
      newMap.delete(palletId);
      return newMap;
    });
  };

  const getTotalSelectedBoxes = () => {
    return Array.from(selectedBoxes.values()).reduce(
      (sum, boxes) => sum + boxes.length,
      0
    );
  };

  const handleSubmit = async () => {
    const totalBoxes = getTotalSelectedBoxes();
    
    if (totalBoxes === 0) {
      showError('Debe seleccionar al menos una caja');
      return;
    }

    setIsSubmitting(true);

    try {
      const items = Array.from(selectedBoxes.entries()).map(([palletId, boxIds]) => ({
        palletId,
        boxIds,
      }));

      await addBoxesToSale({
        saleId: sale.saleId,
        items,
        reason: reason.trim() || undefined,
      });

      showSuccess(`${totalBoxes} caja(s) agregada(s) exitosamente`);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error adding boxes to sale:', error);
      showError(
        error instanceof Error ? error.message : 'Error al agregar cajas'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedBoxes(new Map());
    setReason('');
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Agregar Cajas a Venta</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de Venta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID Venta</span>
                <span className="font-medium">{sale.saleId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium">{sale.customerInfo?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cajas Actuales</span>
                <span className="font-medium">{sale.totalBoxes}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Pallets Disponibles en Bodega</h3>
              <span className="text-xs text-muted-foreground">
                {closedPalletsInBodega.length} pallet(s)
              </span>
            </div>

            {closedPalletsInBodega.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  No hay pallets cerrados disponibles en bodega
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {closedPalletsInBodega.map((pallet) => {
                  const boxes = getPalletBoxes(pallet);
                  const selectedFromPallet = selectedBoxes.get(pallet.codigo) || [];

                  return (
                    <Card key={pallet.codigo}>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{pallet.codigo}</p>
                            <p className="text-xs text-muted-foreground">
                              Calibre: {pallet.calibre}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={() =>
                                handleSelectAllFromPallet(pallet.codigo, boxes)
                              }
                              disabled={isSubmitting}
                            >
                              Seleccionar Todas
                            </Button>
                            {selectedFromPallet.length > 0 && (
                              <>
                                <Separator orientation="vertical" className="h-4" />
                                <Button
                                  type="button"
                                  variant="link"
                                  size="sm"
                                  onClick={() =>
                                    handleDeselectAllFromPallet(pallet.codigo)
                                  }
                                  disabled={isSubmitting}
                                >
                                  Deseleccionar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{boxes.length} cajas</span>
                          {selectedFromPallet.length > 0 && (
                            <span className="font-medium text-foreground">
                              {selectedFromPallet.length} seleccionada(s)
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {boxes.map((boxId) => (
                            <Label
                              key={boxId}
                              className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs"
                            >
                              <Checkbox
                                checked={selectedFromPallet.includes(boxId)}
                                onCheckedChange={() =>
                                  handleToggleBox(pallet.codigo, boxId)
                                }
                                disabled={isSubmitting}
                              />
                              <span className="font-mono">{boxId}</span>
                            </Label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {getTotalSelectedBoxes() > 0 && (
              <div className="text-xs text-muted-foreground">
                {getTotalSelectedBoxes()} caja(s) seleccionada(s) de{' '}
                {selectedBoxes.size} pallet(s)
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Motivo (Opcional)</h3>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              rows={2}
              placeholder="Descripción del motivo para agregar cajas..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || getTotalSelectedBoxes() === 0}
          >
            {isSubmitting
              ? 'Procesando...'
              : `Agregar ${getTotalSelectedBoxes()} Caja(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBoxesToSaleModal;
