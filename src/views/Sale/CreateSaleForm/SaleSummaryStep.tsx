import React, { useState, useMemo } from 'react';
import { Customer } from '@/types';
import { Card, Button } from '@/components/design-system';
import FreshnessIndicator from '@/components/design-system/FreshnessIndicator';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getEggCountForBox, formatEggCount } from '@/utils/eggCalculations';
import { getFreshnessInfo, calculateAverageAge, findOldestPallet } from '@/utils/freshnessCalculations';

type SaleType = 'Venta' | 'Reposición' | 'Donación' | 'Inutilizado' | 'Ración';

interface BoxData {
  boxId: string;
  palletCode: string;
  calibre: string;
  format?: string;
}

interface SaleSummaryStepProps {
  customer: Customer;
  saleType: SaleType;
  boxes: BoxData[];
  onConfirm: (notes?: string) => void;
  isSubmitting: boolean;
}

const SaleSummaryStep: React.FC<SaleSummaryStepProps> = ({
  customer,
  saleType,
  boxes,
  onConfirm,
  isSubmitting,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [expandedPallets, setExpandedPallets] = useState<Set<string>>(
    new Set()
  );

  const totalBoxes = boxes.length;

  // Calculate total eggs
  const totalEggs = useMemo(() => {
    return boxes.reduce((sum, box) => {
      const format = box.format || '1'; // Default to format 1 if not provided
      return sum + getEggCountForBox(format);
    }, 0);
  }, [boxes]);

  // Group boxes by pallet for counting
  const palletGroups = boxes.reduce(
    (acc, box) => {
      if (!acc[box.palletCode]) {
        acc[box.palletCode] = {
          calibre: box.calibre,
          boxes: [],
          format: box.format || '1',
        };
      }
      acc[box.palletCode].boxes.push(box.boxId);
      return acc;
    },
    {} as Record<string, { calibre: string; boxes: string[]; format: string }>
  );

  const totalPallets = Object.keys(palletGroups).length;

  // Calculate freshness stats
  const palletCodes = Object.keys(palletGroups);
  const avgAge = calculateAverageAge(palletCodes);
  const oldestPallet = findOldestPallet(palletCodes);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleConfirm = () => {
    onConfirm(notes);
  };

  const togglePalletExpansion = (palletCode: string) => {
    const newExpanded = new Set(expandedPallets);
    if (newExpanded.has(palletCode)) {
      newExpanded.delete(palletCode);
    } else {
      newExpanded.add(palletCode);
    }
    setExpandedPallets(newExpanded);
  };

  const formatBoxCodesPreview = (boxes: string[], maxVisible: number = 6) => {
    if (boxes.length <= maxVisible) {
      return boxes;
    }
    return boxes.slice(0, maxVisible);
  };

  return (
    <Card className="sale-summary-step p-6" variant="elevated">
      <div className="summary-section space-y-6">
        <h2 className="text-xl font-medium mb-2">Resumen de {saleType}</h2>

        {/* Quick Summary Card */}
        <Card className="quick-summary-card p-4" variant="flat">
          <div className="flex justify-between items-center">
            <div className="summary-main">
              <h3 className="text-lg font-medium text-blue-600">{saleType}</h3>
              <p className="text-xl font-semibold">{customer.name}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <span className="block text-2xl font-bold">{totalPallets}</span>
                <span className="block text-sm text-gray-500">
                  Pallet{totalPallets !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold">{totalBoxes}</span>
                <span className="block text-sm text-gray-500">
                  Caja{totalBoxes !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold">{formatEggCount(totalEggs)}</span>
                <span className="block text-sm text-gray-500">
                  Huevo{totalEggs !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Freshness Summary */}
        {avgAge !== null && (
          <Card className="p-4" variant="flat">
            <h3 className="text-lg font-medium mb-3">Frescura</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Edad Promedio:</span>
                <span className="font-medium">{avgAge} días</span>
              </div>
              {oldestPallet && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Pallet Más Antiguo:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{oldestPallet.palletCode}</span>
                    <FreshnessIndicator 
                      palletCode={oldestPallet.palletCode} 
                      size="small" 
                      showLabel={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Customer Details - Collapsible */}
        <Card className="p-4" variant="flat">
          <div className="mb-3">
            <h3 className="text-lg font-medium">Cliente Seleccionado</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Nombre:</span>
              <span className="font-medium">{customer.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Email:</span>
              <span className="font-medium">{customer.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Teléfono:</span>
              <span className="font-medium">{customer.phone}</span>
            </div>
            {customer.taxId && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">RUT:</span>
                <span className="font-medium">{customer.taxId}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Pallets & Boxes Summary - Improved */}
        <Card className="p-4" variant="flat">
          <div className="mb-4">
            <h3 className="text-lg font-medium">
              Pallets y Cajas Seleccionadas
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(palletGroups).map(([palletCode, palletData]) => {
              const isExpanded = expandedPallets.has(palletCode);
              const previewBoxes = formatBoxCodesPreview(palletData.boxes, 6);
              const hasMoreBoxes = palletData.boxes.length > 6;

              return (
                <Card
                  key={palletCode}
                  className="mb-2 border border-gray-200"
                  variant="flat"
                >
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Pallet {palletCode}</h4>
                        <FreshnessIndicator 
                          palletCode={palletCode} 
                          size="small" 
                          showLabel={false}
                        />
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs py-1 px-2 bg-blue-50 text-blue-700 rounded">
                          Calibre: {palletData.calibre}
                        </span>
                        <span className="text-xs py-1 px-2 bg-gray-50 text-gray-700 rounded">
                          {palletData.boxes.length} cajas • {formatEggCount(palletData.boxes.length * getEggCountForBox(palletData.format))} huevos
                        </span>
                      </div>
                    </div>
                    {hasMoreBoxes && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => togglePalletExpansion(palletCode)}
                        className="text-xs"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown size={14} /> Contraer
                          </>
                        ) : (
                          <>
                            <ChevronRight size={14} /> Ver todas
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="p-3 pt-0 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {(isExpanded ? palletData.boxes : previewBoxes).map(
                        (boxId) => (
                          <span
                            key={boxId}
                            className="py-1 px-2 text-xs bg-gray-100 rounded-md"
                          >
                            {boxId}
                          </span>
                        )
                      )}
                      {!isExpanded && hasMoreBoxes && (
                        <span className="py-1 px-2 text-xs bg-blue-50 text-blue-600 rounded-md">
                          +{palletData.boxes.length - previewBoxes.length} más
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Notes Section */}
        <Card className="p-4" variant="flat">
          <h3 className="text-lg font-medium mb-3">Notas Adicionales</h3>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Agregar notas sobre la operación (opcional)..."
            className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            rows={3}
            maxLength={500}
          />
          <div className="mt-1 text-xs text-right text-gray-500">
            {notes.length}/500 caracteres
          </div>
        </Card>

        {/* Confirmation */}
        <Card className="p-4 bg-blue-50" variant="flat">
          <div className="mb-4">
            <p className="text-center text-lg">
              ¿Confirma que desea procesar esta {saleType.toLowerCase()} de{' '}
              <strong>
                {totalPallets} pallet{totalPallets !== 1 ? 's' : ''}
              </strong>{' '}
              ({totalBoxes} cajas) para el cliente{' '}
              <strong>{customer.name}</strong>?
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              onClick={handleConfirm}
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : `Confirmar ${saleType}`}
            </Button>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default SaleSummaryStep;
