import React from 'react';
import { formatDate } from '@/utils/formatDate';
import { Sale } from '@/types';
import { Card, Button } from '@/components/design-system';
import { Download, CheckCircle } from 'lucide-react';

interface SaleSuccessStepProps {
  saleResult: Sale;
}

const SaleSuccessStep: React.FC<SaleSuccessStepProps> = ({ saleResult }) => {
  // Función para calcular el total de cajas desde los items, boxes array, o totalBoxes
  const getTotalBoxes = (sale: Sale): number => {
    if (sale.totalBoxes !== undefined) {
      return sale.totalBoxes;
    }
    if (sale.boxes && Array.isArray(sale.boxes)) {
      return sale.boxes.length;
    }
    if (sale.items && Array.isArray(sale.items)) {
      return sale.items.reduce(
        (total, item) => total + (item.boxIds?.length || 0),
        0
      );
    }
    return 0;
  };

  const handleDownloadReport = () => {
    if (saleResult.reportUrl) {
      window.open(saleResult.reportUrl, '_blank');
    }
  };

  const handleNewSale = () => {
    window.location.href = '/sales/new';
  };

  const handleGoToDashboard = () => {
    window.location.href = '/';
  };

  return (
    <Card className="p-8 text-center max-w-3xl mx-auto" variant="elevated">
      <div className="flex justify-center mb-6">
        <CheckCircle size={64} className="text-green-500" strokeWidth={1.5} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-medium">
          ¡Venta Completada Exitosamente!
        </h2>
        <p className="text-gray-600">
          La venta ha sido procesada correctamente y las cajas han sido marcadas
          como vendidas.
        </p>

        <Card className="p-4 mb-6" variant="flat">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-2">
              <span className="block text-sm text-gray-500 mb-1">
                ID de Venta
              </span>
              <span className="block font-medium">{saleResult.saleId}</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-sm text-gray-500 mb-1">
                Total de Cajas
              </span>
              <span className="block font-medium">
                {getTotalBoxes(saleResult)}
              </span>
            </div>
            <div className="text-center p-2">
              <span className="block text-sm text-gray-500 mb-1">Fecha</span>
              <span className="block font-medium">
                {formatDate(saleResult.createdAt)}
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {saleResult.reportUrl && (
            <Button
              variant="primary"
              onClick={handleDownloadReport}
              className="flex items-center justify-center gap-2 mx-auto"
            >
              <Download size={18} />
              Descargar Reporte
            </Button>
          )}

          <div className="flex justify-center gap-4 mt-6">
            <Button variant="secondary" onClick={handleNewSale}>
              Nueva Venta
            </Button>
            <Button variant="secondary" onClick={handleGoToDashboard}>
              Ir al Dashboard
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SaleSuccessStep;
