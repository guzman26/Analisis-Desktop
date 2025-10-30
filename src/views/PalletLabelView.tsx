import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pallet } from '@/types';
import {
  formatCalibreName,
  getCalibreFromCodigo,
} from '@/utils/getParamsFromCodigo';
import { formatDate } from '@/utils/formatDate';
import { WindowContainer, Button } from '@/components/design-system';
import JsBarcode from 'jsbarcode';
import { getPalletByCode } from '@/api/endpoints';
import '@/styles/PalletLabel.css';

const PalletLabelView: React.FC = () => {
  const { palletCode } = useParams<{ palletCode: string }>();
  const navigate = useNavigate();
  const [pallet, setPallet] = useState<Pallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrCodeRef = useRef<SVGSVGElement>(null);

  // For now, we'll create a mock pallet based on the code
  // In a real implementation, you would fetch this from your API
  useEffect(() => {
    if (palletCode) {
      const fetchPallet = async () => {
        try {
          const response = await getPalletByCode(palletCode);
          setPallet(response);
          setLoading(false);
        } catch (err) {
          setError('Error al cargar la información del pallet');
          setLoading(false);
        }
      };
      fetchPallet();
    } else {
      setError('Código de pallet no proporcionado');
      setLoading(false);
    }
  }, [palletCode]);

  useEffect(() => {
    if (barcodeRef.current && pallet?.codigo) {
      // Generar código de barras
      JsBarcode(barcodeRef.current, pallet.codigo, {
        format: 'CODE128',
        width: 3,
        height: 80,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
      });
    }

    if (qrCodeRef.current && pallet?.codigo) {
      // Generar código QR simple
      JsBarcode(qrCodeRef.current, pallet.codigo, {
        format: 'CODE128',
        width: 2,
        height: 40,
        displayValue: false,
        margin: 5,
      });
    }
  }, [pallet?.codigo]);

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const getCurrentDate = () => formatDate(new Date());

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="route-loading-container">
        <div className="route-loading-spinner"></div>
        <p>Cargando etiqueta de pallet...</p>
      </div>
    );
  }

  if (error || !pallet) {
    return (
      <div className="route-loading-container">
        <h2>Error</h2>
        <p>{error || 'No se pudo cargar la información del pallet'}</p>
        <Button onClick={handleGoBack} variant="secondary">
          ← Volver
        </Button>
      </div>
    );
  }

  const calibre = getCalibreFromCodigo(pallet.codigo);

  return (
    <WindowContainer title="Etiqueta de Pallet" showTrafficLights={false}>
      {/* Print Actions - Hidden when printing */}
      <div className="print-actions no-print">
        <Button onClick={handleGoBack} variant="secondary">
          ← Volver
        </Button>
        <Button onClick={handlePrint} variant="primary">
          🖨️ Imprimir Etiqueta
        </Button>
      </div>

      {/* Printable Content */}
      <div className="pallet-label-print">
        {/* Header con logo y empresa */}
        <div className="label-header">
          <div className="company-section">
            <h1 className="company-name">Lomas Altas</h1>
            <p className="company-subtitle">Agrícola</p>
            <p className="company-contact">
              Fundo San Ramiro, San Pedro, Chile
            </p>
          </div>
          <div className="qr-section">
            <svg ref={qrCodeRef} className="qr-code"></svg>
            <p className="qr-label">Escanear</p>
          </div>
        </div>

        {/* Código de barras principal */}
        <div className="barcode-section">
          <svg ref={barcodeRef} className="main-barcode"></svg>
        </div>

        {/* Información principal del pallet */}
        <div className="pallet-info-section">
          <div className="main-info">
            <div className="pallet-code-display">
              <span className="code-label">CÓDIGO PALLET</span>
              <span className="code-value">{pallet.codigo}</span>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">CALIBRE</span>
                <span className="info-value">{formatCalibreName(calibre)}</span>
              </div>

              <div className="info-item">
                <span className="info-label">CAJAS</span>
                <span className="info-value">{pallet.cantidadCajas}</span>
              </div>

              <div className="info-item">
                <span className="info-label">UBICACIÓN</span>
                <span className="info-value">{pallet.ubicacion}</span>
              </div>

              <div className="info-item">
                <span className="info-label">ESTADO</span>
                <span className="info-value">
                  {pallet.estado === 'open' ? 'ABIERTO' : 'CERRADO'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="dates-section">
          <div className="date-item">
            <span className="date-label">FECHA CREACIÓN:</span>
            <span className="date-value">
              {pallet.fechaCreacion ? formatDate(pallet.fechaCreacion) : 'N/A'}
            </span>
          </div>

          <div className="date-item">
            <span className="date-label">FECHA IMPRESIÓN:</span>
            <span className="date-value">
              {getCurrentDate()} - {getCurrentTime()}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="additional-info">
          {pallet.baseCode && (
            <div className="base-code">
              <span className="base-code-label">CÓDIGO BASE:</span>
              <span className="base-code-value">{pallet.baseCode}</span>
            </div>
          )}

          <div className="handling-instructions">
            <h3>INSTRUCCIONES DE MANEJO</h3>
            <ul>
              <li>Mantener en lugar seco y ventilado</li>
              <li>No apilar más de 3 pallets</li>
              <li>Temperatura ambiente</li>
              <li>Verificar estado de cajas antes del despacho</li>
            </ul>
          </div>
        </div>

        {/* Footer con información de contacto */}
        <div className="label-footer">
          <div className="contact-info">
            <p>
              <strong>Lomas Altas Agrícola</strong>
            </p>
            <p>RUT: 87.590.100-1</p>
            <p>Teléfono: Por definir | Email: contacto@lomasaltas.cl</p>
          </div>

          <div className="print-info">
            <p className="print-timestamp">
              Impreso: {getCurrentDate()} {getCurrentTime()}
            </p>
            <p className="system-info">Sistema de Gestión Lomas Altas v1.0</p>
          </div>
        </div>
      </div>
    </WindowContainer>
  );
};

export default PalletLabelView;
