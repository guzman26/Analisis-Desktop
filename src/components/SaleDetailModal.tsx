import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sale, Customer, Box, SaleItem } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { boxesApi } from '@/modules/inventory';
import { customersApi } from '@/modules/customers';
import { getOperarioFromCodigo } from '@/utils/getParamsFromCodigo';
import BoxDetailModal from './BoxDetailModal';
import { Button } from '@/components/design-system';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/app-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StatCard from '@/components/shared/StatCard';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildSaleTimeline } from '@/utils/timelineBuilder';
import { ProductionTimeline } from '@/components/story/ProductionTimeline';

interface SaleDetailModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

const SaleDetailModal = ({ sale, isOpen, onClose }: SaleDetailModalProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [showBoxModal, setShowBoxModal] = useState(false);
  const [loadingBox, setLoadingBox] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch customer data when sale changes and modal is open
  useEffect(() => {
    const fetchCustomer = async () => {
      // Only fetch if modal is open and sale exists
      if (!isOpen || !sale?.customerId) {
        return;
      }

      // Only fetch if customerInfo is not already available
      if (sale.customerInfo?.name) {
        setCustomer(null); // Don't fetch if we already have customer info
        return;
      }

      try {
        const customerData = await customersApi.getById(sale.customerId);
        setCustomer(customerData);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setCustomer(null);
      }
    };

    fetchCustomer();
  }, [sale, isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBoxModal) {
          setShowBoxModal(false);
          setSelectedBox(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, showBoxModal, onClose]);

  // Handle box click to open box detail modal
  const handleBoxClick = async (boxCode: string) => {
    try {
      setLoadingBox(boxCode);
      const response = await boxesApi.getByCode(boxCode);

      // Extract the box data from the response
      // The API might return { data: boxData } or just boxData directly
      const boxData = response as Box;

      if (!boxData) {
        console.error('No box data received for code:', boxCode);
        return;
      }

      setSelectedBox(boxData);
      setShowBoxModal(true);
    } catch (error) {
      console.error('Error fetching box details:', error);
      // TODO: Show error message to user
    } finally {
      setLoadingBox(null);
    }
  };

  const handleCloseBoxModal = () => {
    setShowBoxModal(false);
    setSelectedBox(null);
  };

  // Helper function to group boxes by operario and sort by counter
  const groupBoxesByOperario = (boxIds: string[] | undefined) => {
    if (!boxIds || boxIds.length === 0) return [];

    const groups = new Map<string, Array<{ code: string; counter: number }>>();

    boxIds.forEach((boxId: string) => {
      try {
        // Normalize code to last 16 digits if longer
        const normalizedCode = boxId.length >= 16 ? boxId.slice(-16) : boxId;

        const operario =
          getOperarioFromCodigo(normalizedCode) || 'Sin operario';
        // Extract counter from positions 13-16 (last 3 digits)
        const counterStr =
          normalizedCode.length >= 16
            ? normalizedCode.slice(13, 16)
            : normalizedCode.slice(-3);
        const counter = parseInt(counterStr || '0', 10);

        if (!groups.has(operario)) {
          groups.set(operario, []);
        }
        groups.get(operario)!.push({ code: boxId, counter });
      } catch {
        // If parsing fails, add to "Sin operario" group
        const operario = 'Sin operario';
        if (!groups.has(operario)) {
          groups.set(operario, []);
        }
        groups.get(operario)!.push({ code: boxId, counter: 0 });
      }
    });

    // Sort boxes within each group by counter
    groups.forEach((boxes) => {
      boxes.sort((a, b) => a.counter - b.counter);
    });

    // Convert to array and sort by operario number
    return Array.from(groups.entries())
      .map(([operario, boxes]) => ({
        operario,
        boxes: boxes.map((b) => b.code),
      }))
      .sort((a, b) => {
        const numA = parseInt(a.operario, 10) || 999;
        const numB = parseInt(b.operario, 10) || 999;
        return numA - numB;
      });
  };

  // No longer needed - removed print view modal

  // Helper functions
  const getTotalBoxes = () => {
    // Use totalBoxes if available, otherwise calculate from boxes array or items
    if (sale?.totalBoxes !== undefined) {
      return sale.totalBoxes;
    }
    if (sale?.boxes && Array.isArray(sale.boxes)) {
      return sale.boxes.length;
    }
    if (sale?.items && Array.isArray(sale.items)) {
      return sale.items.reduce(
        (total, item) => total + (item.boxIds?.length || 0),
        0
      );
    }
    return 0;
  };

  const getTotalPallets = () => {
    // Use pallets array if available, otherwise use items
    if (sale?.pallets && Array.isArray(sale.pallets)) {
      return sale.pallets.length;
    }
    if (sale?.items && Array.isArray(sale.items)) {
      return sale.items.length;
    }
    return 0;
  };

  // Get items structure - prefer items, otherwise reconstruct from pallets/boxes
  const getItems = () => {
    if (sale?.items && Array.isArray(sale.items) && sale.items.length > 0) {
      return sale.items;
    }
    // Reconstruct from pallets and boxes arrays
    if (
      sale?.pallets &&
      sale?.boxes &&
      Array.isArray(sale.pallets) &&
      Array.isArray(sale.boxes)
    ) {
      // Group boxes by pallet - simplified: distribute boxes evenly
      // For accurate grouping, we'd need to query each box's palletId
      const items: SaleItem[] = [];
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

  const handleShowPrintView = () => {
    if (sale?.saleId) {
      navigate(`/sales/print/${sale.saleId}`);
    }
  };

  if (!isOpen || !sale) return null;

  const statusStyles: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    DISPATCHED: 'bg-yellow-100 text-yellow-700',
    DRAFT: 'bg-gray-100 text-gray-700',
  };

  const items = getItems();
  const saleTimeline = buildSaleTimeline(sale);
  const customerName =
    sale.customerInfo?.name || sale.customerName || customer?.name || 'Cargando...';
  const customerEmail = sale.customerInfo?.email || customer?.email || '';
  const customerPhone = sale.customerInfo?.phone || customer?.phone || '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent layer={60} className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de la Venta</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {sale.saleNumber || `Venta ${sale.saleId.substring(0, 8)}...`}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={statusStyles[sale.state || 'DRAFT'] || 'bg-muted'}>
                      {sale.state || 'DRAFT'}
                    </Badge>
                    <Badge variant="outline">{formatDate(sale.createdAt)}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="Total Cajas" value={getTotalBoxes()} />
            <StatCard label="Total Pallets" value={getTotalPallets()} />
            {sale.totalEggs !== undefined && sale.totalEggs > 0 && (
              <StatCard
                label="Total Huevos"
                value={sale.totalEggs.toLocaleString()}
              />
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historia de la venta</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductionTimeline events={saleTimeline} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">{customerName}</div>
                <Badge variant="outline">{sale.customerId}</Badge>
              </div>
              {(customerEmail || customerPhone) && (
                <div className="flex flex-wrap gap-4 text-sm">
                  {customerEmail && (
                    <a
                      href={`mailto:${customerEmail}`}
                      className="underline underline-offset-4"
                    >
                      {customerEmail}
                    </a>
                  )}
                  {customerPhone && (
                    <a
                      href={`tel:${customerPhone}`}
                      className="underline underline-offset-4"
                    >
                      {customerPhone}
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">Pallets</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {getTotalPallets()} pallet{getTotalPallets() !== 1 ? 's' : ''} •{' '}
                  {getTotalBoxes()} caja{getTotalBoxes() !== 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!items || items.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No hay items en esta venta
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const groupedBoxes = groupBoxesByOperario(item.boxIds);

                    return (
                      <div key={index} className="rounded-md border p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">#{index + 1}</Badge>
                            <span className="text-sm font-medium">
                              Pallet {item.palletId}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {item.boxIds?.length || 0} cajas
                          </Badge>
                        </div>

                        <Separator />

                        {groupedBoxes.length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            No hay cajas asignadas
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {groupedBoxes.map((group) => (
                              <div key={group.operario} className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Operario {group.operario}</span>
                                  <span>
                                    {group.boxes.length} caja
                                    {group.boxes.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {group.boxes.map((boxId: string) => (
                                    <button
                                      key={boxId}
                                      className={`rounded-md border px-2 py-1 text-xs font-mono transition-colors ${
                                        loadingBox === boxId
                                          ? 'opacity-60'
                                          : 'hover:bg-muted'
                                      }`}
                                      onClick={() => handleBoxClick(boxId)}
                                      title="Clic para ver detalles de la caja"
                                    >
                                      {loadingBox === boxId
                                        ? 'Cargando...'
                                        : boxId}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {sale.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{sale.notes}</p>
              </CardContent>
            </Card>
          )}

          <DialogFooter className="flex flex-wrap gap-2 sm:justify-between">
            <Button variant="primary" onClick={handleShowPrintView}>
              Ver Guía de Despacho
            </Button>
            {sale.reportUrl && (
              <a
                href={sale.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'secondary' }))}
              >
                Descargar Reporte
              </a>
            )}
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </div>

        <BoxDetailModal
          box={selectedBox}
          isOpen={showBoxModal}
          onClose={handleCloseBoxModal}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SaleDetailModal;
