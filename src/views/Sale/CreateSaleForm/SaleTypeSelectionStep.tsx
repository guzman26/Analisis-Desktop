import React from 'react';
import { Card } from '@/components/design-system';
import { Check, Circle } from 'lucide-react';

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
    <Card className="sale-type-selection-step p-6" variant="elevated">
      <div className="step-header mb-6">
        <h2 className="text-xl font-medium mb-2">Tipo de Operación</h2>
        <p className="text-sm text-gray-500">Selecciona el tipo de operación que deseas realizar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {saleTypes.map((type) => (
          <Card
            key={type.value}
            className={`cursor-pointer transition-all duration-200 ${
              selectedType === type.value ? 'ring-2 ring-blue-500' : ''
            }`}
            variant={selectedType === type.value ? 'elevated' : 'flat'}
            onClick={() => onSelect(type.value)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">{type.label}</h3>
                <div className="w-5 h-5 flex items-center justify-center">
                  {selectedType === type.value ? 
                    <Check size={18} className="text-blue-500" /> : 
                    <Circle size={18} className="text-gray-300" />}
                </div>
              </div>
              <p className="text-sm text-gray-500">{type.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default SaleTypeSelectionStep;
