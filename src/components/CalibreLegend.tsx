import React, { useState } from 'react';
import { CALIBRE_MAP } from '@/utils/getParamsFromCodigo';
import { Info } from 'lucide-react';
import { Card } from '@/components/design-system';

interface CalibreLegendProps {
  /** Mostrar solo los calibres que están presentes en los datos */
  onlyShow?: string[];
  /** Estilo compacto para mostrar como tooltip o dropdown */
  compact?: boolean;
}

/**
 * Componente que muestra una leyenda de los códigos de calibre
 * y su significado.
 */
const CalibreLegend: React.FC<CalibreLegendProps> = ({ onlyShow, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filtrar solo los calibres que están en los datos si se especifica
  const calibresToShow = onlyShow
    ? Object.entries(CALIBRE_MAP).filter(([code]) => onlyShow.includes(code))
    : Object.entries(CALIBRE_MAP);

  // Agrupar por tipo (BLANCO, COLOR, OTROS)
  const blancos = calibresToShow.filter(([_, name]) => name.includes('BCO'));
  const color = calibresToShow.filter(([_, name]) => name.includes('COLOR'));
  const otros = calibresToShow.filter(([_, name]) => !name.includes('BCO') && !name.includes('COLOR'));

  if (compact) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--macos-space-1)',
            padding: 'var(--macos-space-2) var(--macos-space-3)',
            backgroundColor: 'var(--macos-blue)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--macos-radius-medium)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <Info size={14} />
          Leyenda de Calibres
        </button>

        {isOpen && (
          <>
            {/* Backdrop para cerrar al hacer clic fuera */}
            <div
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
              }}
            />
            
            {/* Contenido del tooltip */}
            <Card
              variant="default"
              padding="medium"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 'var(--macos-space-2)',
                zIndex: 1000,
                minWidth: '320px',
                maxWidth: '480px',
                maxHeight: '400px',
                overflowY: 'auto',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
              }}
            >
              {renderLegendContent(blancos, color, otros)}
            </Card>
          </>
        )}
      </div>
    );
  }

  // Versión expandida (para mostrar directamente en la página)
  return (
    <Card variant="flat" padding="medium">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--macos-space-2)',
          marginBottom: 'var(--macos-space-3)',
        }}
      >
        <Info size={16} style={{ color: 'var(--macos-blue)' }} />
        <h4
          className="macos-text-headline"
          style={{ margin: 0, color: 'var(--macos-text-primary)' }}
        >
          Leyenda de Calibres
        </h4>
      </div>
      {renderLegendContent(blancos, color, otros)}
    </Card>
  );
};

function renderLegendContent(
  blancos: [string, string][],
  color: [string, string][],
  otros: [string, string][]
) {
  const renderGroup = (title: string, items: [string, string][], bgColor: string) => {
    if (items.length === 0) return null;

    return (
      <div style={{ marginBottom: 'var(--macos-space-3)' }}>
        <h5
          className="macos-text-subheadline"
          style={{
            margin: '0 0 var(--macos-space-2) 0',
            color: 'var(--macos-text-secondary)',
            fontWeight: 600,
          }}
        >
          {title}
        </h5>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 'var(--macos-space-2)',
          }}
        >
          {items.map(([code, name]) => (
            <div
              key={code}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-2)',
                padding: 'var(--macos-space-2)',
                backgroundColor: bgColor,
                borderRadius: 'var(--macos-radius-small)',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  color: 'var(--macos-text-primary)',
                  fontFamily: 'monospace',
                  minWidth: '24px',
                }}
              >
                {code}
              </span>
              <span
                className="macos-text-caption-1"
                style={{
                  color: 'var(--macos-text-secondary)',
                  fontSize: '11px',
                }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderGroup('Huevos Blancos', blancos, 'rgba(59, 130, 246, 0.08)')}
      {renderGroup('Huevos de Color', color, 'rgba(251, 146, 60, 0.08)')}
      {renderGroup('Otros', otros, 'rgba(107, 114, 128, 0.08)')}
    </div>
  );
}

export default CalibreLegend;



