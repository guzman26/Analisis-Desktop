import React, { useState, useContext } from 'react';
import { PalletContext } from '@/contexts/PalletContext';
import {
  Customer,
  Pallet,
  Sale,
  SaleRequest,
  SaleItem,
} from '@/types';
import { createSale } from '@/api/post';
import CustomerSelectionStep from './CustomerSelectionStep';
import BoxSelectionStep from './BoxSelectionStep';
import SaleSummaryStep from './SaleSummaryStep';
import SaleSuccessStep from './SaleSuccessStep';
import '@/styles/CreateSaleForm.css';

interface CreateSaleFormState {
  step: number;
  selectedCustomer: Customer | null;
  selectedBoxCodes: string[];
  unitPrice: number;
  isSubmitting: boolean;
  saleResult: Sale | null;
}

const CreateSaleForm: React.FC = () => {
  const [state, setState] = useState<CreateSaleFormState>({
    step: 0,
    selectedCustomer: null,
    selectedBoxCodes: [],
    unitPrice: 0,
    isSubmitting: false,
    saleResult: null,
  });

  const { closedPalletsInBodegaPaginated } = useContext(PalletContext);

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

  // Group selected box codes by their pallets
  const groupBoxesByPallet = (): SaleItem[] => {
    const palletGroups: Record<string, string[]> = {};

    // Iterate through pallets to find which ones contain our selected box codes
    closedPalletsInBodegaPaginated.data.forEach((pallet: Pallet) => {
      const selectedBoxesInPallet = pallet.cajas.filter((boxId: string) =>
        state.selectedBoxCodes.includes(boxId)
      );

      if (selectedBoxesInPallet.length > 0) {
        palletGroups[pallet.codigo] = selectedBoxesInPallet;
      }
    });

    const result = Object.entries(palletGroups).map(([palletId, boxIds]) => ({
      palletId,
      boxIds,
    }));

    return result;
  };

  const handleSubmit = async (unitPrice: number) => {
    if (
      !state.selectedCustomer ||
      state.selectedBoxCodes.length === 0 ||
      unitPrice <= 0
    ) {
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, unitPrice }));

    try {
      const saleRequest: SaleRequest = {
        customerId: state.selectedCustomer.customerId,
        items: groupBoxesByPallet(),
        unitPrice: unitPrice,
        totalAmount: unitPrice * state.selectedBoxCodes.length,
      };

      const sale = await createSale(saleRequest);

      

      setState((prev) => ({
        ...prev,
        saleResult: sale,
        step: 3,
        isSubmitting: false,
      }));

      // Refresh available pallets
      closedPalletsInBodegaPaginated.refresh();
    } catch (error) {
      console.error('Error creating sale:', error);
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const canProceedToNext = () => {
    switch (state.step) {
      case 0:
        return state.selectedCustomer !== null;
      case 1:
        return state.selectedBoxCodes.length > 0;
      case 2:
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

    closedPalletsInBodegaPaginated.data.forEach((pallet: Pallet) => {
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
          <CustomerSelectionStep
            selectedCustomer={state.selectedCustomer}
            onSelect={handleCustomerSelect}
          />
        );
      case 1:
        return (
          <BoxSelectionStep
            selectedBoxCodes={state.selectedBoxCodes}
            onSelectionChange={handleBoxCodesSelect}
          />
        );
      case 2:
        return (
          <SaleSummaryStep
            customer={state.selectedCustomer!}
            boxes={getSelectedBoxData()}
            onConfirm={handleSubmit}
            isSubmitting={state.isSubmitting}
          />
        );
      case 3:
        return <SaleSuccessStep saleResult={state.saleResult!} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (state.step) {
      case 0:
        return 'Seleccionar Cliente';
      case 1:
        return 'Seleccionar Cajas';
      case 2:
        return 'Confirmar Venta';
      case 3:
        return 'Venta Completada';
      default:
        return '';
    }
  };

  return (
    <div className="create-sale-form">
      <div className="sale-form-header">
        <h1>Nueva Venta</h1>
        <div className="step-indicator">
          <span className="step-title">{getStepTitle()}</span>
          <span className="step-counter">Paso {state.step + 1} de 4</span>
        </div>
      </div>

      <div className="sale-form-content">{renderStepContent()}</div>

      {state.step < 3 && (
        <div className="sale-form-controls">
          {state.step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-secondary"
              disabled={state.isSubmitting}
            >
              Atrás
            </button>
          )}

          {state.step < 2 && (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
              disabled={!canProceedToNext()}
            >
              Siguiente
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateSaleForm;
