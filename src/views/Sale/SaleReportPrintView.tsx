import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sale, Customer } from '@/types';
import { SalesContext } from '@/contexts/SalesContext';
import { useCustomerContext } from '@/contexts/CustomerContext';
import { formatDate } from '@/utils/formatDate';
import {
  getCompanyName,
  getCompanyRUT,
  getContactPhone,
} from '@/utils/company';
import { getOperarioFromCodigo } from '@/utils/getParamsFromCodigo';
import '@/styles/SaleReportPrintView.css';
import { WindowContainer } from '@/components/design-system';
import { Button } from '@/components/design-system';

const SaleReportPrintView: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { salesOrdersDRAFTPaginated, salesOrdersCONFIRMEDPaginated } =
    useContext(SalesContext) || {};
  const [, customerAPI] = useCustomerContext();

  useEffect(() => {
    if (
      saleId &&
      (salesOrdersDRAFTPaginated?.data || salesOrdersCONFIRMEDPaginated?.data)
    ) {
      // Search in DRAFT sales first
      let foundSale = salesOrdersDRAFTPaginated?.data?.find(
        (s) => s.saleId === saleId
      );

      // If not found in DRAFT, search in CONFIRMED sales
      if (!foundSale) {
        foundSale = salesOrdersCONFIRMEDPaginated?.data?.find(
          (s) => s.saleId === saleId
        );
      }

      if (foundSale) {
        setSale(foundSale);
      } else {
        setError('Venta no encontrada');
      }
      setLoading(false);
    } else if (saleId) {
      setError('No se pudo cargar la información de ventas');
      setLoading(false);
    }
  }, [saleId, salesOrdersDRAFTPaginated, salesOrdersCONFIRMEDPaginated]);

  // Fetch customer data when sale is found
  useEffect(() => {
    const fetchCustomer = async () => {
      if (sale?.customerId && customerAPI) {
        try {
          const customerData = await customerAPI.getCustomerById(
            sale.customerId
          );
          setCustomer(customerData);
        } catch (error) {
          console.error('Error fetching customer:', error);
        }
      }
    };

    if (sale) {
      fetchCustomer();
    }
  }, [sale, customerAPI]);

  const getTotalBoxes = () => {
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

  const getItems = () => {
    if (sale?.items && Array.isArray(sale.items) && sale.items.length > 0) {
      return sale.items;
    }
    if (sale?.metadata?.items && Array.isArray(sale.metadata.items)) {
      return sale.metadata.items;
    }
    // Reconstruct from pallets and boxes
    if (
      sale?.pallets &&
      sale?.boxes &&
      Array.isArray(sale.pallets) &&
      Array.isArray(sale.boxes)
    ) {
      const items: Array<{ palletId: string; boxIds: string[] }> = [];
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

  // Helper function to group boxes by operario
  const groupBoxesByOperario = (boxIds: string[] | undefined) => {
    if (!boxIds || boxIds.length === 0) return [];

    const groups = new Map<string, string[]>();

    boxIds.forEach((boxId: string) => {
      try {
        const normalizedCode = boxId.length >= 16 ? boxId.slice(-16) : boxId;
        const operario =
          getOperarioFromCodigo(normalizedCode) || 'Sin operario';

        if (!groups.has(operario)) {
          groups.set(operario, []);
        }
        groups.get(operario)!.push(boxId);
      } catch {
        const operario = 'Sin operario';
        if (!groups.has(operario)) {
          groups.set(operario, []);
        }
        groups.get(operario)!.push(boxId);
      }
    });

    return Array.from(groups.entries())
      .map(([operario, boxes]) => ({ operario, boxes }))
      .sort((a, b) => {
        const numA = parseInt(a.operario, 10) || 999;
        const numB = parseInt(b.operario, 10) || 999;
        return numA - numB;
      });
  };

  // Determinar si usar vista compacta (muchos pallets)
  const useCompactView = getItems().length > 10;

  // Get calibre progress info if available
  const requestedBoxesByCalibre =
    sale?.metadata?.requestedBoxesByCalibre &&
    sale.metadata.requestedBoxesByCalibre.length > 0
      ? sale.metadata.requestedBoxesByCalibre
      : null;

  const handlePrint = () => {
    // Simply print the current preview directly
    window.print();
  };

  const handleGoBack = () => {
    navigate('/sales/orders');
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="print-view-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando guía de despacho...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="print-view-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'No se pudo cargar la venta'}</p>
          <button onClick={handleGoBack} className="btn btn-secondary">
            ← Volver a Órdenes
          </button>
        </div>
      </div>
    );
  }

  return (
    <WindowContainer title="Ficha Interna" showTrafficLights={false}>
      {/* Print Actions - Hidden when printing */}
      <div className="print-actions no-print">
        <Button onClick={handleGoBack} variant="secondary">
          ← Volver a Órdenes
        </Button>
        <Button onClick={handlePrint} variant="primary">
          🖨️ Imprimir Guía
        </Button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="sale-report-print">
        {/* Header */}
        <div className="report-header">
          <div className="company-info">
            <h1 className="company-name">{getCompanyName()}</h1>
            <p className="company-subtitle">Agrícola</p>
            <div className="company-details">
              <p>RUT: {getCompanyRUT()}</p>
              <p>Dirección: Fundo San Ramiro, San Pedro, Chile</p>
              <p>Teléfono: {getContactPhone()}</p>
            </div>
          </div>
          <div className="document-info">
            <h2 className="document-title">FICHA INTERNA</h2>
            <div className="document-number">
              <strong>N° {sale.saleNumber || sale.saleId}</strong>
            </div>
            <div className="document-date">
              <p>
                <strong>Fecha:</strong> {getCurrentDate()}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="customer-section">
          <h3 className="section-title">DATOS DEL CLIENTE</h3>
          <div className="customer-grid">
            <div className="customer-field">
              <span className="field-label">Cliente:</span>
              <span className="field-value">
                {sale.customerInfo?.name || customer?.name || 'No especificado'}
              </span>
            </div>
            <div className="customer-field">
              <span className="field-label">ID Cliente:</span>
              <span className="field-value">{sale.customerId}</span>
            </div>
            <div className="customer-field">
              <span className="field-label">RUT:</span>
              <span className="field-value">
                {customer?.taxId || 'No especificado'}
              </span>
            </div>
            <div className="customer-field">
              <span className="field-label">Teléfono:</span>
              <span className="field-value">
                {sale.customerInfo?.phone ||
                  customer?.phone ||
                  'No especificado'}
              </span>
            </div>
            <div className="customer-field">
              <span className="field-label">Email:</span>
              <span className="field-value">
                {sale.customerInfo?.email ||
                  customer?.email ||
                  'No especificado'}
              </span>
            </div>
            <div className="customer-field">
              <span className="field-label">Dirección:</span>
              <span className="field-value">
                {customer?.address || 'No especificada'}
              </span>
            </div>
          </div>
        </div>

        {/* Sale Information */}
        <div className="sale-info-section">
          <h3 className="section-title">INFORMACIÓN DE LA VENTA</h3>
          <div className="sale-info-grid">
            <div className="info-field">
              <span className="field-label">Fecha de Venta:</span>
              <span className="field-value">{formatDate(sale.createdAt)}</span>
            </div>
            <div className="info-field">
              <span className="field-label">Total Pallets:</span>
              <span className="field-value">{getItems().length}</span>
            </div>
            <div className="info-field">
              <span className="field-label">Total Cajas:</span>
              <span className="field-value">
                {getTotalBoxes()}
                {sale.metadata?.totalRequestedBoxes && (
                  <span className="requested-info">
                    {' '}
                    / {sale.metadata.totalRequestedBoxes} solicitadas
                  </span>
                )}
              </span>
            </div>
            {sale.totalEggs !== undefined && sale.totalEggs > 0 && (
              <div className="info-field">
                <span className="field-label">Total Huevos:</span>
                <span className="field-value">
                  {sale.totalEggs.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Calibre Progress Section */}
          {requestedBoxesByCalibre && (
            <div className="calibre-progress-section">
              <h4 className="calibre-progress-title">Progreso por Calibre:</h4>
              <div className="calibre-progress-grid">
                {requestedBoxesByCalibre.map((req: any) => {
                  const current =
                    sale.metadata?.boxesByCalibre?.[req.calibre] || 0;
                  const isComplete = current >= req.boxCount;
                  return (
                    <div
                      key={req.calibre}
                      className={`calibre-progress-item ${isComplete ? 'complete' : ''}`}
                    >
                      <span className="calibre-label">
                        Calibre {req.calibre}:
                      </span>
                      <span className="calibre-count">
                        {current} / {req.boxCount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Items Detail */}
        <div className="items-section">
          <h3 className="section-title">DETALLE DE PRODUCTOS</h3>
          {(() => {
            const items = getItems();
            if (!items || items.length === 0) {
              return (
                <div className="items-empty-state">
                  <p>No hay productos asignados a esta venta</p>
                  {requestedBoxesByCalibre && (
                    <p className="empty-state-note">
                      Esta venta fue creada por calibre. Las cajas se asignarán
                      según el progreso por calibre.
                    </p>
                  )}
                </div>
              );
            }

            return useCompactView ? (
              // Vista compacta para muchos pallets
              <div className="compact-items-container">
                <table className="items-table compact">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Pallet ID</th>
                      <th>Cajas</th>
                      <th>Operarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const groupedBoxes = groupBoxesByOperario(item.boxIds);
                      return (
                        <tr key={index}>
                          <td className="item-number">{index + 1}</td>
                          <td className="pallet-id">{item.palletId}</td>
                          <td className="box-count">
                            {item.boxIds?.length || 0}
                          </td>
                          <td className="operarios-summary">
                            {groupedBoxes.length > 0 ? (
                              <div className="operarios-list">
                                {groupedBoxes.map((group, gIndex) => (
                                  <span key={gIndex} className="operario-badge">
                                    Op {group.operario}: {group.boxes.length}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="no-operarios">
                                Sin operarios
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              // Vista normal para pocos pallets
              <div className="items-detailed-container">
                {items.map((item, index) => {
                  const groupedBoxes = groupBoxesByOperario(item.boxIds);
                  return (
                    <div key={index} className="pallet-detail-card">
                      <div className="pallet-detail-header">
                        <div className="pallet-header-left">
                          <span className="pallet-number">#{index + 1}</span>
                          <span className="pallet-id-display">
                            {item.palletId}
                          </span>
                        </div>
                        <span className="pallet-box-count">
                          {item.boxIds?.length || 0} caja
                          {item.boxIds?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {groupedBoxes.length > 0 ? (
                        <div className="pallet-boxes-by-operario">
                          {groupedBoxes.map((group) => (
                            <div
                              key={group.operario}
                              className="operario-box-group"
                            >
                              <div className="operario-group-header">
                                <span className="operario-label">
                                  Operario {group.operario}
                                </span>
                                <span className="operario-box-count">
                                  {group.boxes.length} caja
                                  {group.boxes.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="box-codes-grid">
                                {group.boxes.map((boxId, boxIndex) => (
                                  <span key={boxIndex} className="box-code">
                                    {boxId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-boxes-message">
                          No hay cajas asignadas a este pallet
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Summary */}
        {sale.notes && (
          <div className="summary-section">
            <div className="notes-section">
              <h4>Observaciones:</h4>
              <p className="notes-text">{sale.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="report-footer">
          <div className="signatures-section">
            <div className="signature-box">
              <div className="signature-line"></div>
              <p className="signature-label">Firma Vendedor</p>
              <p className="signature-name">{getCompanyName()}</p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <p className="signature-label">Firma Cliente</p>
              <p className="signature-name">
                {sale.customerInfo?.name || customer?.name || ''}
              </p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <p className="signature-label">Firma Transportista</p>
              <p className="signature-name">_________________</p>
            </div>
          </div>

          <div className="footer-info">
            <p className="print-date">
              Documento generado el {getCurrentDate()} a las{' '}
              {new Date().toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="footer-note">
              Este documento constituye una guía de despacho válida según
              normativa vigente.
            </p>
          </div>
        </div>
      </div>
    </WindowContainer>
  );
};

export default SaleReportPrintView;
