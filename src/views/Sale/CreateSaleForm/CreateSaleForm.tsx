import React, { useState, useContext } from 'react';
import { useFilteredPallets, usePalletContext } from '@/contexts/PalletContext';
import { SalesContext } from '@/contexts/SalesContext';
import { Customer, Pallet, Sale, SaleRequest, SaleItem } from '@/types';
import { getPalletBoxes } from '@/utils/palletHelpers';
import { createSale, validateInventory } from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';
import SaleTypeSelectionStep from './SaleTypeSelectionStep';
import CustomerSelectionStep from './CustomerSelectionStep';
import BoxSelectionStep from './BoxSelectionStep';
import SaleSummaryStep from './SaleSummaryStep';
import SaleSuccessStep from './SaleSuccessStep';
import '@/styles/CreateSaleForm.css';
import { Button } from '@/components/design-system';
import { WindowContainer } from '@/components/design-system';

type SaleType = 'Venta' | 'Reposición' | 'Donación' | 'Inutilizado' | 'Ración';

interface CreateSaleFormState {
  step: number;
  selectedSaleType: SaleType | null;
  selectedCustomer: Customer | null;
  selectedBoxCodes: string[];
  isSubmitting: boolean;
  saleResult: Sale | null;
}

const CreateSaleForm: React.FC = () => {
  const [state, setState] = useState<CreateSaleFormState>({
    step: 0,
    selectedSaleType: null,
    selectedCustomer: null,
    selectedBoxCodes: [],
    isSubmitting: false,
    saleResult: null,
  });

  const { pallets: closedPalletsInBodegaPaginated } = useFilteredPallets();
  const { fetchClosedPalletsInBodega } = usePalletContext();
  const { refreshAllSales } = useContext(SalesContext);
  const { showSuccess, showError } = useNotifications();

  const handleNext = () => {
    setState((prev) => ({ ...prev, step: prev.step + 1 }));
  };

  const handleBack = () => {
    setState((prev) => ({ ...prev, step: prev.step - 1 }));
  };

  const handleCustomerSelect = (customer: Customer) => {
    setState((prev) => ({ ...prev, selectedCustomer: customer }));
  };

  const handleBoxCodesSelect = (boxCodes: string[]) => {
    setState((prev) => ({ ...prev, selectedBoxCodes: boxCodes }));
  };

  const handleSubmit = async (notes?: string) => {
    if (
      !state.selectedSaleType ||
      !state.selectedCustomer ||
      state.selectedBoxCodes.length === 0
    ) {
      showError('Datos incompletos para crear la venta');
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Step 1: Validate inventory availability
      showSuccess('Validando inventario...');
      const validationResult = await validateInventory(state.selectedBoxCodes);

      if (!validationResult.valid) {
        const unavailableCount = validationResult.unavailableBoxes.length;
        const reasons = validationResult.unavailableBoxes
          .slice(0, 3)
          .map((box) => `${box.boxId}: ${box.reason}`)
          .join(', ');

        showError(
          `${unavailableCount} caja(s) no disponible(s). Ejemplos: ${reasons}. Por favor, actualice la selección.`
        );
        setState((prev) => ({ ...prev, isSubmitting: false }));
        return;
      }

      // Step 2: Group selected boxes by their pallets
      const palletGroupedBoxes = new Map<string, string[]>();

      closedPalletsInBodegaPaginated.forEach((pallet: Pallet) => {
        const selectedBoxesInPallet = getPalletBoxes(pallet).filter((boxId) =>
          state.selectedBoxCodes.includes(boxId)
        );

        if (selectedBoxesInPallet.length > 0) {
          palletGroupedBoxes.set(pallet.codigo, selectedBoxesInPallet);
        }
      });

      if (palletGroupedBoxes.size === 0) {
        showError('No se pudieron agrupar las cajas por pallets');
        setState((prev) => ({ ...prev, isSubmitting: false }));
        return;
      }

      // Step 3: Create items array with pallets containing their boxes
      const items: SaleItem[] = Array.from(palletGroupedBoxes.entries()).map(
        ([palletId, boxIds]) => ({
          palletId,
          boxIds,
        })
      );

      const saleRequest: SaleRequest = {
        customerId: state.selectedCustomer.customerId,
        type: state.selectedSaleType,
        items,
        notes,
      };

      // Step 4: Create the sale
      showSuccess('Creando venta...');
      const sale = await createSale(saleRequest);

      setState((prev) => ({
        ...prev,
        saleResult: sale,
        step: 4,
        isSubmitting: false,
      }));

      // Step 5: Refresh data in contexts
      refreshAllSales();
      fetchClosedPalletsInBodega();

      showSuccess(
        `Venta creada exitosamente: ${sale.totalBoxes} cajas${sale.totalEggs ? ` (${sale.totalEggs.toLocaleString()} huevos)` : ''}`
      );
    } catch (error) {
      console.error('Error creating sale:', error);

      // Enhanced error handling with specific messages
      let errorMessage = 'Error al crear la venta';

      if (error instanceof Error) {
        if (
          error.message.includes('Customer') &&
          error.message.includes('not active')
        ) {
          errorMessage = 'El cliente seleccionado no está activo';
        } else if (error.message.includes('not found')) {
          errorMessage =
            'Algunos elementos no fueron encontrados. Actualice la página.';
        } else if (
          error.message.includes('not available') ||
          error.message.includes('not in BODEGA')
        ) {
          errorMessage =
            'Algunas cajas ya no están disponibles. Actualice la selección.';
        } else if (
          error.message.includes('network') ||
          error.message.includes('NetworkError')
        ) {
          errorMessage = 'Error de conexión. Verifique su conexión a internet.';
        } else {
          errorMessage = error.message;
        }
      }

      showError(errorMessage);
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const canProceedToNext = () => {
    switch (state.step) {
      case 0:
        return state.selectedSaleType !== null;
      case 1:
        return state.selectedCustomer !== null;
      case 2:
        return state.selectedBoxCodes.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  // Get selected box data for rendering in summary
  const getSelectedBoxData = () => {
    const selectedBoxData: {
      boxId: string;
      palletCode: string;
      calibre: string;
    }[] = [];

    closedPalletsInBodegaPaginated.forEach((pallet: Pallet) => {
      getPalletBoxes(pallet).forEach((boxId: string) => {
        if (state.selectedBoxCodes.includes(boxId)) {
          selectedBoxData.push({
            boxId,
            palletCode: pallet.codigo,
            calibre: pallet.calibre,
          });
        }
      });
    });

    return selectedBoxData;
  };

  const renderStepContent = () => {
    switch (state.step) {
      case 0:
        return (
          <SaleTypeSelectionStep
            selectedType={state.selectedSaleType}
            onSelect={(saleType) =>
              setState((prev) => ({ ...prev, selectedSaleType: saleType }))
            }
          />
        );
      case 1:
        return (
          <CustomerSelectionStep
            selectedCustomer={state.selectedCustomer}
            onSelect={handleCustomerSelect}
          />
        );
      case 2:
        return (
          <BoxSelectionStep
            selectedBoxCodes={state.selectedBoxCodes}
            onSelectionChange={handleBoxCodesSelect}
          />
        );
      case 3:
        return (
          <SaleSummaryStep
            customer={state.selectedCustomer!}
            saleType={state.selectedSaleType!}
            boxes={getSelectedBoxData()}
            onConfirm={handleSubmit}
            isSubmitting={state.isSubmitting}
          />
        );
      case 4:
        return <SaleSuccessStep saleResult={state.saleResult!} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (state.step) {
      case 0:
        return 'Seleccionar Tipo de Venta';
      case 1:
        return 'Seleccionar Cliente';
      case 2:
        return 'Seleccionar Cajas';
      case 3:
        return 'Confirmar Venta';
      case 4:
        return 'Venta Completada';
      default:
        return '';
    }
  };

  return (
    <WindowContainer title="Nueva Venta" showTrafficLights={false}>
      <div className="sale-form-header">
        <h1>Nueva Venta</h1>
        <div className="step-indicator">
          <span className="step-title">{getStepTitle()}</span>
          <span className="step-counter">Paso {state.step + 1} de 5</span>
        </div>
      </div>

      <div className="sale-form-content">{renderStepContent()}</div>

      {state.step < 4 && (
        <div className="sale-form-controls">
          {state.step > 0 && (
            <Button
              type="button"
              onClick={handleBack}
              variant="secondary"
              disabled={state.isSubmitting}
            >
              Atrás
            </Button>
          )}

          {state.step < 3 && (
            <Button
              type="button"
              onClick={handleNext}
              variant="primary"
              disabled={!canProceedToNext()}
            >
              Siguiente
            </Button>
          )}
        </div>
      )}
    </WindowContainer>
  );
};

export default CreateSaleForm;
