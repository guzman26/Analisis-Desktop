import React, { useState } from 'react';
import { useFilteredPallets } from '@/contexts/PalletContext';
import { Customer, Pallet, Sale, SaleRequest, SaleItem } from '@/types';
import { createSale } from '@/api/endpoints';
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
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Group selected boxes by their pallets
      const palletGroupedBoxes = new Map<string, string[]>();

      closedPalletsInBodegaPaginated.forEach((pallet: Pallet) => {
        const selectedBoxesInPallet = pallet.cajas.filter((boxId) =>
          state.selectedBoxCodes.includes(boxId)
        );

        if (selectedBoxesInPallet.length > 0) {
          palletGroupedBoxes.set(pallet.codigo, selectedBoxesInPallet);
        }
      });

      // Create items array with pallets containing their boxes
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

      const sale = await createSale(saleRequest);

      setState((prev) => ({
        ...prev,
        saleResult: sale,
        step: 4,
        isSubmitting: false,
      }));

      // Refresh available pallets
      // TODO: Implement refresh functionality
    } catch (error) {
      console.error('Error creating sale:', error);
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
      pallet.cajas.forEach((boxId: string) => {
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
