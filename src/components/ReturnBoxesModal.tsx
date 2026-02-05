import React, { useState } from 'react';
import { Sale, ReturnReason } from '@/types';
import { returnBoxes } from '@/api/endpoints';
import { useNotifications } from './Notification/Notification';
import { Button } from './design-system';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface ReturnBoxesModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RETURN_REASONS: Array<{ value: ReturnReason; label: string }> = [
  { value: 'damaged', label: 'Dañado' },
  { value: 'wrong_caliber', label: 'Calibre Incorrecto' },
  { value: 'customer_request', label: 'Solicitud del Cliente' },
  { value: 'quality_issue', label: 'Problema de Calidad' },
  { value: 'expired', label: 'Vencido' },
  { value: 'other', label: 'Otro' },
];

const ReturnBoxesModal: React.FC<ReturnBoxesModalProps> = ({
  sale,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]);
  const [reason, setReason] = useState<ReturnReason>('customer_request');
  const [reasonDetails, setReasonDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotifications();

  // Get all boxes from sale items, pallets/boxes, or metadata.items
  const getItems = () => {
    if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
      return sale.items;
    }
    // Check metadata.items
    if (sale.metadata?.items && Array.isArray(sale.metadata.items)) {
      return sale.metadata.items;
    }
    // Reconstruct from pallets and boxes arrays
    if (sale.pallets && sale.boxes && Array.isArray(sale.pallets) && Array.isArray(sale.boxes)) {
      const items: Array<{ palletId: string; boxIds: string[] }> = [];
      const boxesPerPallet = Math.ceil(sale.boxes.length / sale.pallets.length);
      let boxIndex = 0;
      
      for (const palletId of sale.pallets) {
        const boxIds = sale.boxes.slice(boxIndex, boxIndex + boxesPerPallet);
        if (boxIds.length > 0) {
          items.push({ palletId, boxIds });
        }
        boxIndex += boxesPerPallet;
      }
      
      return items;
    }
    return [];
  };

  const allBoxes = getItems().flatMap((item) => ({
    palletId: item.palletId,
    boxIds: item.boxIds,
  }));

  const handleToggleBox = (boxId: string) => {
    setSelectedBoxes((prev) =>
      prev.includes(boxId) ? prev.filter((id) => id !== boxId) : [...prev, boxId]
    );
  };

  const handleSelectAll = () => {
    const allBoxIds = allBoxes.flatMap((item) => item.boxIds);
    setSelectedBoxes(allBoxIds);
  };

  const handleDeselectAll = () => {
    setSelectedBoxes([]);
  };

  const handleSubmit = async () => {
    if (selectedBoxes.length === 0) {
      showError('Debe seleccionar al menos una caja para devolver');
      return;
    }

    if (reason === 'other' && !reasonDetails.trim()) {
      showError('Debe proporcionar detalles para "Otro" motivo');
      return;
    }

    setIsSubmitting(true);

    try {
      await returnBoxes({
        saleId: sale.saleId,
        boxIds: selectedBoxes,
        reason,
        reasonDetails: reasonDetails.trim() || undefined,
      });

      showSuccess(`${selectedBoxes.length} caja(s) devuelta(s) exitosamente`);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error returning boxes:', error);
      showError(
        error instanceof Error ? error.message : 'Error al procesar la devolución'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedBoxes([]);
    setReason('customer_request');
    setReasonDetails('');
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
          <DialogTitle>Devolver Cajas</DialogTitle>
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
                <span className="text-muted-foreground">Total Cajas</span>
                <span className="font-medium">{sale.totalBoxes}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium">Seleccionar Cajas</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isSubmitting}
                >
                  Seleccionar Todas
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={isSubmitting}
                >
                  Deseleccionar Todas
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {allBoxes.map((item) => (
                <Card key={item.palletId}>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Pallet: {item.palletId}</span>
                      <span className="text-muted-foreground">
                        {item.boxIds.length} cajas
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {item.boxIds.map((boxId: string) => (
                        <Label
                          key={boxId}
                          className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs"
                        >
                          <Checkbox
                            checked={selectedBoxes.includes(boxId)}
                            onCheckedChange={() => handleToggleBox(boxId)}
                            disabled={isSubmitting}
                          />
                          <span className="font-mono">{boxId}</span>
                        </Label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              {selectedBoxes.length} caja(s) seleccionada(s)
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Motivo de Devolución</h3>
            <div className="space-y-2">
              <Label htmlFor="return-reason">Motivo</Label>
              <Select
                value={reason}
                onValueChange={(value) => setReason(value as ReturnReason)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="return-reason">
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason-details">
                {reason === 'other'
                  ? 'Detalles'
                  : 'Detalles Adicionales (Opcional)'}
              </Label>
              <Textarea
                id="reason-details"
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                disabled={isSubmitting}
                rows={reason === 'other' ? 3 : 2}
                placeholder={
                  reason === 'other'
                    ? 'Describa el motivo de la devolución...'
                    : 'Información adicional...'
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedBoxes.length === 0}
          >
            {isSubmitting
              ? 'Procesando...'
              : `Devolver ${selectedBoxes.length} Caja(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnBoxesModal;
