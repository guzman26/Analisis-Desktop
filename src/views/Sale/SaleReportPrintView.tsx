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
    if (sale?.pallets && sale?.boxes && Array.isArray(sale.pallets) && Array.isArray(sale.boxes)) {
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

  // Función para mostrar códigos de cajas de manera más eficiente
  const formatBoxCodes = (boxIds: string[], maxVisible: number = 6) => {
    if (!boxIds || boxIds.length === 0) return 'Sin cajas';

    if (boxIds.length <= maxVisible) {
      return boxIds;
    }

    return {
      visible: boxIds.slice(0, maxVisible),
      remaining: boxIds.length - maxVisible,
      total: boxIds.length,
    };
  };

  // Determinar si usar vista compacta (muchos pallets)
  const useCompactView = getItems().length > 10;

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
              <strong>N° {sale.saleId}</strong>
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
              <span className="field-value">{getTotalBoxes()}</span>
            </div>
          </div>
        </div>

        {/* Items Detail */}
        <div className="items-section">
          <h3 className="section-title">DETALLE DE PRODUCTOS</h3>
          {useCompactView ? (
            // Vista compacta para muchos pallets
            <div className="compact-items-container">
              <div className="compact-summary">
                <p>
                  <strong>Resumen:</strong> {getItems().length} pallets
                  con {getTotalBoxes()} cajas en total
                </p>
              </div>
              <table className="items-table compact">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Pallet ID</th>
                    <th>Cajas</th>
                    <th>Primeras Cajas</th>
                  </tr>
                </thead>
                <tbody>
                  {getItems().map((item, index) => {
                    const boxCodesData = formatBoxCodes(item.boxIds || [], 4);
                    return (
                      <tr key={index}>
                        <td className="item-number">{index + 1}</td>
                        <td className="pallet-id">{item.palletId}</td>
                        <td className="box-count">
                          {item.boxIds?.length || 0}
                        </td>
                        <td className="box-codes">
                          {typeof boxCodesData === 'string' ? (
                            <span className="no-boxes">{boxCodesData}</span>
                          ) : Array.isArray(boxCodesData) ? (
                            <div className="box-codes-grid">
                              {boxCodesData.map((boxId, boxIndex) => (
                                <span key={boxIndex} className="box-code">
                                  {boxId}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="box-codes-compact">
                              <div className="box-codes-grid">
                                {boxCodesData.visible.map((boxId, boxIndex) => (
                                  <span key={boxIndex} className="box-code">
                                    {boxId}
                                  </span>
                                ))}
                              </div>
                              <span className="remaining-count">
                                +{boxCodesData.remaining} más
                              </span>
                            </div>
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
            <table className="items-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Pallet ID</th>
                  <th>Cantidad Cajas</th>
                  <th>Códigos de Cajas</th>
                </tr>
              </thead>
              <tbody>
                {getItems().map((item, index) => {
                  const boxCodesData = formatBoxCodes(item.boxIds || [], 8);
                  return (
                    <tr key={index}>
                      <td className="item-number">{index + 1}</td>
                      <td className="pallet-id">{item.palletId}</td>
                      <td className="box-count">{item.boxIds?.length || 0}</td>
                      <td className="box-codes">
                        {typeof boxCodesData === 'string' ? (
                          <span className="no-boxes">{boxCodesData}</span>
                        ) : Array.isArray(boxCodesData) ? (
                          <div className="box-codes-grid">
                            {boxCodesData.map((boxId, boxIndex) => (
                              <span key={boxIndex} className="box-code">
                                {boxId}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="box-codes-detailed">
                            <div className="box-codes-grid">
                              {boxCodesData.visible.map((boxId, boxIndex) => (
                                <span key={boxIndex} className="box-code">
                                  {boxId}
                                </span>
                              ))}
                            </div>
                            <div className="remaining-info">
                              <span className="remaining-count">
                                +{boxCodesData.remaining} cajas adicionales
                              </span>
                              <small>(Total: {boxCodesData.total} cajas)</small>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary */}
        <div className="summary-section">
          <div className="summary-grid">
            <div className="summary-left">
              {sale.notes && (
                <div className="notes-section">
                  <h4>Observaciones:</h4>
                  <p className="notes-text">{sale.notes}</p>
                </div>
              )}
            </div>
            <div className="summary-right">
              <div className="totals-box">
                <div className="total-row">
                  <span className="total-label">Total Pallets:</span>
                  <span className="total-value">{getItems().length}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Total Cajas:</span>
                  <span className="total-value">{getTotalBoxes()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
