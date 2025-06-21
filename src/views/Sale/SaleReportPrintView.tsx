import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sale, Customer } from '@/types';
import { SalesContext } from '@/contexts/SalesContext';
import { CustomerContext } from '@/contexts/CustomerContext';
import { formatDate } from '@/utils/formatDate';
import '@/styles/SaleReportPrintView.css';

const SaleReportPrintView: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { salesOrdersDRAFTPaginated } = useContext(SalesContext) || {};
  const customerContext = useContext(CustomerContext);
  const { getCustomerByIdFunction } = customerContext || {};

  // Find sale by ID from context
  useEffect(() => {
    if (saleId && salesOrdersDRAFTPaginated?.data) {
      const foundSale = salesOrdersDRAFTPaginated.data.find(
        (s) => s.saleId === saleId
      );
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
  }, [saleId, salesOrdersDRAFTPaginated]);

  // Fetch customer data when sale is found
  useEffect(() => {
    const fetchCustomer = async () => {
      if (sale?.customerId && getCustomerByIdFunction) {
        try {
          const customerData = await getCustomerByIdFunction(sale.customerId);
          setCustomer(customerData);
        } catch (error) {
          console.error('Error fetching customer:', error);
        }
      }
    };

    if (sale) {
      fetchCustomer();
    }
  }, [sale, getCustomerByIdFunction]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalBoxes = () => {
    return (
      sale?.items?.reduce(
        (total, item) => total + (item.boxIds?.length || 0),
        0
      ) || 0
    );
  };

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
    <div className="print-view-container">
      {/* Print Actions - Hidden when printing */}
      <div className="print-actions no-print">
        <button onClick={handleGoBack} className="btn btn-secondary">
          ← Volver a Órdenes
        </button>
        <button onClick={handlePrint} className="btn btn-primary">
          🖨️ Imprimir Guía
        </button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="sale-report-print">
        {/* Header */}
        <div className="report-header">
          <div className="company-info">
            <h1 className="company-name">Lomas Altas</h1>
            <p className="company-subtitle">Agrícola</p>
            <div className="company-details">
              <p>RUT: 87.590.100-1</p>
              <p>Dirección: Fundo San Ramiro, San Pedro, Chile</p>
              <p>Teléfono: Por definir</p>
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
              <span className="field-value">{sale.items?.length || 0}</span>
            </div>
            <div className="info-field">
              <span className="field-label">Total Cajas:</span>
              <span className="field-value">{getTotalBoxes()}</span>
            </div>
            {sale.unitPrice && (
              <div className="info-field">
                <span className="field-label">Precio por Caja:</span>
                <span className="field-value">
                  {formatCurrency(sale.unitPrice)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Items Detail */}
        <div className="items-section">
          <h3 className="section-title">DETALLE DE PRODUCTOS</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Pallet ID</th>
                <th>Cantidad Cajas</th>
                <th>Códigos de Cajas</th>
                {sale.unitPrice && <th>Subtotal</th>}
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index}>
                  <td className="item-number">{index + 1}</td>
                  <td className="pallet-id">{item.palletId}</td>
                  <td className="box-count">{item.boxIds?.length || 0}</td>
                  <td className="box-codes">
                    <div className="box-codes-grid">
                      {item.boxIds?.map((boxId, boxIndex) => (
                        <span key={boxIndex} className="box-code">
                          {boxId}
                        </span>
                      )) || 'Sin cajas'}
                    </div>
                  </td>
                  {sale.unitPrice && (
                    <td className="subtotal">
                      {formatCurrency(
                        (item.boxIds?.length || 0) * sale.unitPrice
                      )}
                    </td>
                  )}
                </tr>
              )) || (
                <tr>
                  <td colSpan={sale.unitPrice ? 5 : 4} className="no-items">
                    No hay productos en esta venta
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  <span className="total-value">{sale.items?.length || 0}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Total Cajas:</span>
                  <span className="total-value">{getTotalBoxes()}</span>
                </div>
                {sale.unitPrice && (
                  <div className="total-row">
                    <span className="total-label">Precio por Caja:</span>
                    <span className="total-value">
                      {formatCurrency(sale.unitPrice)}
                    </span>
                  </div>
                )}
                {sale.totalAmount && (
                  <div className="total-row final-total">
                    <span className="total-label">TOTAL GENERAL:</span>
                    <span className="total-value">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </div>
                )}
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
              <p className="signature-name">Lomas Altas</p>
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
    </div>
  );
};

export default SaleReportPrintView;
