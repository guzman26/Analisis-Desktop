import React, { useState, useEffect, useContext } from 'react';
import { PalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';

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
  const { closedPalletsInBodegaPaginated } = useContext(PalletContext);

  const [selectedPallet, setSelectedPallet] = useState<string | null>(null);

  // Fetch pallets on component mount if not already loaded
  useEffect(() => {
    if (closedPalletsInBodegaPaginated.data.length === 0) {
      closedPalletsInBodegaPaginated.refresh();
    }
  }, []);

  // Process pallets and track selected boxes
  const palletGroups: PalletGroup[] = closedPalletsInBodegaPaginated.data.map(
    (pallet) => ({
      pallet,
      selectedBoxIds: pallet.cajas.filter((boxId) =>
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
    <div className="box-selection-step">
      <div className="step-header">
        <h2>
          {selectedPallet
            ? `Seleccionar Cajas - Pallet ${selectedPallet}`
            : 'Seleccionar Pallets'}
        </h2>
        <p>
          {selectedPallet
            ? 'Selecciona las cajas que deseas incluir en la venta'
            : 'Selecciona los pallets de bodega y luego las cajas que deseas incluir en la venta'}
        </p>
      </div>

      {selectedPallet && (
        <div className="navigation-controls">
          <button
            type="button"
            onClick={handleBackToPallets}
            className="back-button"
          >
            ← Volver a Pallets
          </button>
        </div>
      )}

      {/* Selection Counter */}
      <div className="selection-counter">
        <span className="counter-text">
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
            <div className="no-pallets-message">
              <p>No hay pallets disponibles en bodega.</p>
            </div>
          ) : (
            <div className="pallets-grid">
              {palletGroups.map((group) => {
                const { pallet } = group;
                const isFullySelected = pallet.cajas.every((boxId) =>
                  selectedBoxCodes.includes(boxId)
                );
                const isPartiallySelected =
                  group.selectedBoxIds.length > 0 && !isFullySelected;

                return (
                  <div
                    key={pallet.codigo}
                    className={`pallet-card ${isFullySelected ? 'fully-selected' : ''} ${isPartiallySelected ? 'partially-selected' : ''}`}
                  >
                    <div className="pallet-header">
                      <h3>Pallet {pallet.codigo}</h3>
                      <span className={`pallet-location ${pallet.ubicacion}`}>
                        {pallet.ubicacion}
                      </span>
                    </div>

                    <div className="pallet-stats">
                      <div className="stat">
                        <span className="stat-value">
                          {pallet.cajas.length}
                        </span>
                        <span className="stat-label">Cajas Total</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">
                          {group.selectedBoxIds.length}
                        </span>
                        <span className="stat-label">Seleccionadas</span>
                      </div>
                    </div>

                    <div className="pallet-info-extra">
                      <div className="info-row">
                        <span className="label">Calibre:</span>
                        <span className="value">{pallet.calibre}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Estado:</span>
                        <span className={`status-badge ${pallet.estado}`}>
                          {pallet.estado}
                        </span>
                      </div>
                    </div>

                    <div className="pallet-actions">
                      <button
                        type="button"
                        onClick={() => handlePalletClick(pallet.codigo)}
                        className="btn btn-outline btn-details"
                      >
                        Ver Cajas ({pallet.cajas.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePalletToggle(pallet.codigo)}
                        className={`btn ${isFullySelected ? 'btn-danger' : 'btn-primary'} btn-toggle`}
                      >
                        {isFullySelected
                          ? 'Deseleccionar Todo'
                          : 'Seleccionar Todo'}
                      </button>
                    </div>
                  </div>
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
              <div className="pallet-info">
                <h3>Pallet {selectedPalletGroup.pallet.codigo}</h3>
                <div className="pallet-meta">
                  <span>Ubicación: {selectedPalletGroup.pallet.ubicacion}</span>
                  <span>Calibre: {selectedPalletGroup.pallet.calibre}</span>
                  <span>Estado: {selectedPalletGroup.pallet.estado}</span>
                  <span>
                    Total: {selectedPalletGroup.pallet.cajas.length} cajas
                  </span>
                  <span>
                    Seleccionadas: {selectedPalletGroup.selectedBoxIds.length}{' '}
                    cajas
                  </span>
                </div>
              </div>

              <div className="boxes-grid">
                {selectedPalletGroup.pallet.cajas.map((boxId) => (
                  <div
                    key={boxId}
                    className={`box-item ${selectedBoxCodes.includes(boxId) ? 'selected' : ''}`}
                    onClick={() => handleBoxToggle(boxId)}
                  >
                    <div className="box-header">
                      <span className="box-code">{boxId}</span>
                      <div className="selection-indicator">
                        {selectedBoxCodes.includes(boxId) ? '✓' : '○'}
                      </div>
                    </div>
                    <div className="box-meta">
                      <span>Pallet: {selectedPalletGroup.pallet.codigo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BoxSelectionStep;
