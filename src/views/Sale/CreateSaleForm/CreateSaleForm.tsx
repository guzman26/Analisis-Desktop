import React, { useState } from 'react';
import { usePalletServerState } from '@/modules/inventory';
import { Customer, Sale, SaleRequest, CalibreSelection } from '@/types';
import { useNotifications } from '@/components/Notification/Notification';
import SaleTypeSelectionStep from './SaleTypeSelectionStep';
import CustomerSelectionStep from './CustomerSelectionStep';
import BoxSelectionStep from './BoxSelectionStep';
import SaleSummaryStep from './SaleSummaryStep';
import SaleSuccessStep from './SaleSuccessStep';
import '@/styles/CreateSaleForm.css';
import { Button } from '@/components/design-system';
import { WindowContainer } from '@/components/design-system';
import {
  useConfirmedSalesOrdersInfiniteQuery,
  useCreateSaleMutation,
  useDraftSalesOrdersInfiniteQuery,
  salesApi,
} from '@/modules/sales';

type SaleType = 'Venta' | 'Reposición' | 'Donación' | 'Inutilizado' | 'Ración';

interface CreateSaleFormState {
  step: number;
  selectedSaleType: SaleType | null;
  selectedCustomer: Customer | null;
  selectedCalibres: CalibreSelection[];
  isSubmitting: boolean;
  saleResult: Sale | null;
}

const CreateSaleForm: React.FC = () => {
  const [state, setState] = useState<CreateSaleFormState>({
    step: 0,
    selectedSaleType: null,
    selectedCustomer: null,
    selectedCalibres: [],
    isSubmitting: false,
    saleResult: null,
  });

  const { fetchClosedPalletsInBodega } = usePalletServerState();
  const draftSales = useDraftSalesOrdersInfiniteQuery();
  const confirmedSales = useConfirmedSalesOrdersInfiniteQuery();
  const createSaleMutation = useCreateSaleMutation();
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

  const handleCalibresSelect = (calibres: CalibreSelection[]) => {
    setState((prev) => ({
      ...prev,
      selectedCalibres: calibres,
      step: prev.step + 1,
    }));
  };

  const handleSubmit = async (notes?: string) => {
    // Validar que haya al menos un calibre con cantidad > 0
    const hasValidCalibres = state.selectedCalibres.some(
      (cal) => cal.boxCount > 0
    );

    if (
      !state.selectedSaleType ||
      !state.selectedCustomer ||
      !hasValidCalibres
    ) {
      showError('Datos incompletos para crear la venta. Debe seleccionar al menos un calibre con cantidad mayor a 0.');
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Filtrar solo calibres con cantidad > 0
      const validCalibres = state.selectedCalibres.filter(
        (cal) => cal.boxCount > 0
      );

      // Validate stock availability in BODEGA before creating the draft order.
      const validation = await salesApi.validateByCalibres(validCalibres);
      if (!validation.valid) {
        const unavailable = validation.calibreAvailability?.filter(
          (entry) => entry.missing > 0
        );
        const details =
          unavailable && unavailable.length > 0
            ? unavailable
                .map(
                  (entry) =>
                    `Calibre ${entry.calibre}: faltan ${entry.missing} caja(s)`
                )
                .join(', ')
            : validation.message;

        showError(
          details ||
            'No hay stock suficiente en BODEGA para completar la solicitud'
        );
        setState((prev) => ({ ...prev, isSubmitting: false }));
        return;
      }

      const saleRequest: SaleRequest = {
        customerId: state.selectedCustomer.customerId,
        type: state.selectedSaleType,
        calibres: validCalibres,
        notes,
      };

      // Crear la solicitud de venta con solo la información de calibres y cantidades
      showSuccess('Creando solicitud de venta...');
      const sale = await createSaleMutation.mutateAsync(saleRequest);

      setState((prev) => ({
        ...prev,
        saleResult: sale,
        step: 4,
        isSubmitting: false,
      }));

      // Step 5: Refresh data in contexts
      await draftSales.refresh();
      await confirmedSales.refresh();
      await fetchClosedPalletsInBodega();

      const totalRequestedBoxes = validCalibres.reduce((sum, cal) => sum + cal.boxCount, 0);
      const saleNumberText = sale.saleNumber ? ` (${sale.saleNumber})` : '';
      showSuccess(
        `Solicitud de venta creada exitosamente${saleNumberText}. ` +
        `Total solicitado: ${totalRequestedBoxes} cajas. ` +
        `Las cajas se asignarán durante el despacho en la aplicación móvil.`
      );
    } catch (error) {
      console.error('Error creating sale:', error);

      // Enhanced error handling with specific messages
      let errorMessage = 'Error al crear la venta';

      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();

        if (errorMsg.includes('customer') && errorMsg.includes('not active')) {
          errorMessage = 'El cliente seleccionado no está activo';
        } else if (errorMsg.includes('not found') || errorMsg.includes('no encontrado')) {
          errorMessage = 'Algunos elementos no fueron encontrados. Actualice la página.';
        } else if (
          errorMsg.includes('not available') ||
          errorMsg.includes('not in bodega') ||
          errorMsg.includes('no está en bodega') ||
          errorMsg.includes('debe estar en bodega')
        ) {
          errorMessage = 'Algunas cajas o pallets ya no están en BODEGA. Actualice la selección.';
        } else if (errorMsg.includes('reservada') || errorMsg.includes('reserved')) {
          errorMessage = 'Algunas cajas están reservadas para otra venta. Actualice la selección.';
        } else if (errorMsg.includes('ya fue vendida') || errorMsg.includes('already sold')) {
          errorMessage = 'Algunas cajas ya fueron vendidas. Actualice la selección.';
        } else if (errorMsg.includes('duplicada') || errorMsg.includes('duplicate')) {
          errorMessage = 'Se detectó un intento de venta duplicada. Por favor, intente nuevamente.';
        } else if (
          errorMsg.includes('network') ||
          errorMsg.includes('networkerror') ||
          errorMsg.includes('fetch')
        ) {
          errorMessage = 'Error de conexión. Verifique su conexión a internet.';
        } else if (errorMsg.includes('debe estar cerrado') || errorMsg.includes('must be closed')) {
          errorMessage = 'Algunos pallets deben estar cerrados antes de crear la venta.';
        } else {
          // Show the actual error message if it's in Spanish or a known format
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
        // Validar que haya al menos un calibre con cantidad > 0
        return state.selectedCalibres.some((cal) => cal.boxCount > 0);
      case 3:
        return true;
      default:
        return false;
    }
  };

  // Get selected calibres data for rendering in summary
  const getSelectedCalibresData = () => {
    return state.selectedCalibres.filter((cal) => cal.boxCount > 0);
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
            selectedCalibres={state.selectedCalibres}
            onNext={handleCalibresSelect}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <SaleSummaryStep
            customer={state.selectedCustomer!}
            saleType={state.selectedSaleType!}
            calibres={getSelectedCalibresData()}
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
        return 'Seleccionar Calibres y Cantidades';
      case 3:
        return 'Confirmar Venta';
      case 4:
        return 'Venta Completada';
      default:
        return '';
    }
  };

  return (
    <WindowContainer title="Nueva Venta" >
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
