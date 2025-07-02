import React from 'react';
import { Sale } from '@/types';

interface SaleSuccessStepProps {
  saleResult: Sale;
}

const SaleSuccessStep: React.FC<SaleSuccessStepProps> = ({ saleResult }) => {
  // Función para calcular el total de cajas desde los items
  const getTotalBoxes = (sale: Sale): number => {
    return (
      sale.totalBoxes ||
      sale.items?.reduce(
        (total, item) => total + (item.boxIds?.length || 0),
        0
      ) ||
      0
    );
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
    <div className="sale-success-step">
      <div className="success-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#10B981" />
          <path
            d="M9 12l2 2 4-4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="success-content">
        <h2>¡Venta Completada Exitosamente!</h2>
        <p className="success-message">
          La venta ha sido procesada correctamente y las cajas han sido marcadas
          como vendidas.
        </p>

        <div className="sale-details">
          <div className="detail-item">
            <span className="detail-label">ID de Venta:</span>
            <span className="detail-value">{saleResult.saleId}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total de Cajas:</span>
            <span className="detail-value">{getTotalBoxes(saleResult)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fecha:</span>
            <span className="detail-value">
              {new Date(saleResult.createdAt).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className="success-actions">
          {saleResult.reportUrl && (
            <button
              type="button"
              onClick={handleDownloadReport}
              className="btn btn-primary download-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="7,10 12,15 17,10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="15"
                  x2="12"
                  y2="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Descargar Reporte
            </button>
          )}

          <div className="navigation-actions">
            <button
              type="button"
              onClick={handleNewSale}
              className="btn btn-outline"
            >
              Nueva Venta
            </button>
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="btn btn-secondary"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleSuccessStep;
