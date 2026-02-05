import React, { useState } from 'react';
import { CALIBRE_MAP } from '@/utils/getParamsFromCodigo';
import { Info } from 'lucide-react';
import { Button } from '@/components/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="small" leftIcon={<Info size={14} />}>
            Leyenda de Calibres
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] max-h-[400px] overflow-y-auto">
          {renderLegendContent(blancos, color, otros)}
        </PopoverContent>
      </Popover>
    );
  }

  // Versión expandida (para mostrar directamente en la página)
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info size={16} className="text-primary" />
          Leyenda de Calibres
        </CardTitle>
      </CardHeader>
      <CardContent>{renderLegendContent(blancos, color, otros)}</CardContent>
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
      <div className="mb-4">
        <h5 className="mb-2 text-xs font-semibold text-muted-foreground">
          {title}
        </h5>
        <div className="grid grid-cols-2 gap-2">
          {items.map(([code, name]) => (
            <div
              key={code}
              className="flex items-center gap-2 rounded-md px-2 py-1"
              style={{ backgroundColor: bgColor }}
            >
              <span className="min-w-[24px] font-mono text-xs font-bold">
                {code}
              </span>
              <span className="text-[11px] text-muted-foreground">{name}</span>
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



