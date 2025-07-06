import React, { useState, useEffect } from 'react';
import { useFilteredPallets } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import { Card, Button } from '@/components/design-system';
import { ArrowLeft, Check, Circle } from 'lucide-react';


interface BoxSelectionStepProps {
  selectedBoxCodes: string[];
  onSelectionChange: (selectedBoxCodes: string[]) => void;
}

interface PalletGroup {
  pallet: Pallet;
  selectedBoxIds: string[];
}

const BoxSelectionStep: React.FC<BoxSelectionStepProps> = ({
  selectedBoxCodes,
  onSelectionChange,
}) => {
  const { pallets: closedPalletsInBodegaPaginated } = useFilteredPallets();

  const [selectedPallet, setSelectedPallet] = useState<string | null>(null);

  // Fetch pallets on component mount if not already loaded
  useEffect(() => {
    // Data is automatically fetched by useFilteredPallets hook
  }, []);

  // Process pallets and track selected boxes
  const palletGroups: PalletGroup[] = closedPalletsInBodegaPaginated.map(
    (pallet: any) => ({
      pallet,
      selectedBoxIds: pallet.cajas.filter((boxId: any) =>
        selectedBoxCodes.includes(boxId)
      ),
    })
  );

  const selectedPalletGroup = palletGroups.find(
    (group) => group.pallet.codigo === selectedPallet
  );

  // Handle pallet selection/deselection (select all boxes in pallet)
  const handlePalletToggle = (palletCode: string) => {
    const palletGroup = palletGroups.find(
      (group) => group.pallet.codigo === palletCode
    );
    if (!palletGroup) return;

    const allBoxIds = palletGroup.pallet.cajas;
    const isFullySelected = allBoxIds.every((boxId) =>
      selectedBoxCodes.includes(boxId)
    );

    let newSelectedBoxCodes: string[];
    if (isFullySelected) {
      // Deselect all boxes from this pallet
      newSelectedBoxCodes = selectedBoxCodes.filter(
        (boxId) => !allBoxIds.includes(boxId)
      );
    } else {
      // Select all boxes from this pallet
      const newBoxIds = allBoxIds.filter(
        (boxId) => !selectedBoxCodes.includes(boxId)
      );
      newSelectedBoxCodes = [...selectedBoxCodes, ...newBoxIds];
    }

    onSelectionChange(newSelectedBoxCodes);
  };

  // Handle individual box selection within a pallet
  const handleBoxToggle = (boxId: string) => {
    const newSelectedBoxCodes = selectedBoxCodes.includes(boxId)
      ? selectedBoxCodes.filter((id) => id !== boxId)
      : [...selectedBoxCodes, boxId];

    onSelectionChange(newSelectedBoxCodes);
  };

  const handleBackToPallets = () => {
    setSelectedPallet(null);
  };

  const handlePalletClick = (palletCode: string) => {
    setSelectedPallet(palletCode);
  };

  return (
    <Card className="box-selection-step p-6" variant="elevated">
      <div className="mb-6">
        <h2 className="text-xl font-medium mb-2">
          {selectedPallet
            ? `Seleccionar Cajas - Pallet ${selectedPallet}`
            : 'Seleccionar Pallets'}
        </h2>
        <p className="text-sm text-gray-500">
          {selectedPallet
            ? 'Selecciona las cajas que deseas incluir en la venta'
            : 'Selecciona los pallets de bodega y luego las cajas que deseas incluir en la venta'}
        </p>
      </div>

      {selectedPallet && (
        <div className="mb-4">
          <Button
            variant="secondary"
            size="small"
            onClick={handleBackToPallets}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Volver a Pallets
          </Button>
        </div>
      )}

      {/* Selection Counter */}
      <div className="mb-4 bg-blue-50 rounded-md p-3 text-center">
        <span className="text-blue-700 font-medium">
          {selectedBoxCodes.length} caja
          {selectedBoxCodes.length !== 1 ? 's' : ''} seleccionada
          {selectedBoxCodes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Show either pallets or boxes depending on selection */}
      {!selectedPallet ? (
        // Pallet Selection View
        <div className="pallets-section">
          {palletGroups.length === 0 ? (
            <Card className="p-8 text-center" variant="flat">
              <p className="text-gray-500">No hay pallets disponibles en bodega.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {palletGroups.map((group) => {
                const { pallet } = group;
                const isFullySelected = pallet.cajas.every((boxId) =>
                  selectedBoxCodes.includes(boxId)
                );
                // We'll use the selectedBoxIds count directly instead of a separate variable

                return (
                  <Card
                    key={pallet.codigo}
                    className="h-full"
                    variant="flat"
                  >
                    <div className="pallet-header">
                      <h3>Pallet {pallet.codigo}</h3>
                      <span className={`pallet-location ${pallet.ubicacion}`}>
                        {pallet.ubicacion}
                      </span>
                    </div>

                    <div className="flex justify-around p-4 border-b border-gray-100">
                      <div className="p-4 border-b border-gray-100">
                        <span className="text-lg font-medium block">
                          Pallet {pallet.codigo}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-blue-600">
                          {group.selectedBoxIds.length}
                        </span>
                        <span className="block text-sm text-gray-500">Cajas Total</span>
                      </div>
                    </div>

                    <div className="p-4 border-b border-gray-100">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-sm text-gray-500 block">Calibre:</span>
                          <span className="font-medium">{pallet.calibre}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 block">Estado:</span>
                          <span className={`inline-block px-2 py-1 rounded-md text-sm ${pallet.estado.toLowerCase() === 'cerrado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {pallet.estado}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handlePalletClick(pallet.codigo)}
                        className="w-full"
                      >
                        Ver Cajas ({pallet.cajas.length})
                      </Button>
                      <Button
                        variant={isFullySelected ? "danger" : "primary"}
                        onClick={() => handlePalletToggle(pallet.codigo)}
                        className="w-full"
                      >
                        {isFullySelected
                          ? 'Deseleccionar Todo'
                          : 'Seleccionar Todo'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Box Selection View for Selected Pallet
        <div className="boxes-section">
          {selectedPalletGroup && (
            <>
              <Card className="mb-4" variant="flat">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">Pallet {selectedPalletGroup.pallet.codigo}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Ubicación:</span>
                      <span className="font-medium">{selectedPalletGroup.pallet.ubicacion}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Calibre:</span>
                      <span className="font-medium">{selectedPalletGroup.pallet.calibre}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Estado:</span>
                      <span className={`inline-block px-2 py-1 rounded-md text-xs ${selectedPalletGroup.pallet.estado.toLowerCase() === 'cerrado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {selectedPalletGroup.pallet.estado}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-medium">{selectedPalletGroup.pallet.cajas.length} cajas</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Seleccionadas:</span>
                      <span className="font-medium text-blue-600">{selectedPalletGroup.selectedBoxIds.length} cajas</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedPalletGroup.pallet.cajas.map((boxId) => (
                  <Card
                    key={boxId}
                    className={`cursor-pointer transition-all ${selectedBoxCodes.includes(boxId) ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                    variant={selectedBoxCodes.includes(boxId) ? 'elevated' : 'flat'}
                    onClick={() => handleBoxToggle(boxId)}
                  >
                    <div className="p-3 flex justify-between items-center">
                      <span className="font-medium">{boxId}</span>
                      <div className="w-5 h-5 flex items-center justify-center">
                        {selectedBoxCodes.includes(boxId) ? 
                          <Check size={16} className="text-blue-500" /> : 
                          <Circle size={16} className="text-gray-300" />}
                      </div>
                    </div>
                    <div className="px-3 pb-3 pt-0 text-xs text-gray-500">
                      <span>Pallet: {selectedPalletGroup.pallet.codigo}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default BoxSelectionStep;
