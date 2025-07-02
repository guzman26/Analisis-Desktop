import React from 'react';

type SaleType = 'Venta' | 'Reposición' | 'Donación' | 'Inutilizado' | 'Ración';

interface SaleTypeSelectionStepProps {
  selectedType: SaleType | null;
  onSelect: (type: SaleType) => void;
}

const SaleTypeSelectionStep: React.FC<SaleTypeSelectionStepProps> = ({
  selectedType,
  onSelect,
}) => {
  const saleTypes: { value: SaleType; label: string; description: string }[] = [
    {
      value: 'Venta',
      label: 'Venta',
      description: 'Venta comercial regular de productos',
    },
    {
      value: 'Reposición',
      label: 'Reposición',
      description: 'Reposición de productos defectuosos o faltantes',
    },
    {
      value: 'Donación',
      label: 'Donación',
      description: 'Donación benéfica de productos',
    },
    {
      value: 'Inutilizado',
      label: 'Inutilizado',
      description: 'Productos que no pueden ser vendidos',
    },
    {
      value: 'Ración',
      label: 'Ración',
      description: 'Distribución interna de raciones',
    },
  ];

  return (
    <div className="sale-type-selection-step">
      <div className="step-header">
        <h2>Tipo de Operación</h2>
        <p>Selecciona el tipo de operación que deseas realizar</p>
      </div>

      <div className="sale-types-grid">
        {saleTypes.map((type) => (
          <div
            key={type.value}
            className={`sale-type-card ${
              selectedType === type.value ? 'selected' : ''
            }`}
            onClick={() => onSelect(type.value)}
          >
            <div className="sale-type-header">
              <h3>{type.label}</h3>
              <div className="selection-indicator">
                {selectedType === type.value ? '✓' : '○'}
              </div>
            </div>
            <p className="sale-type-description">{type.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaleTypeSelectionStep;
