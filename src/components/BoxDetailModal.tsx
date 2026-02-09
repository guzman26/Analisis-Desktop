import React, { useMemo } from 'react';
import { Box } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';
import {
  processBoxCustomInfo,
  calculateTotalEggs,
  getMostFrequentCode,
  tryParseBoxCode,
  formatParsedBoxCode,
  getProductionInfo,
  getProductInfo,
} from '@/utils';
import { Button } from '@/components/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/app-dialog';
import {
  Calendar,
  Package,
  MapPin,
  Barcode,
  User,
  Layers,
  Hash,
  Clock,
  CalendarDays,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';
import InfoRow from '@/components/shared/InfoRow';

interface BoxDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: Box | null;
}

const BoxDetailModal = ({ isOpen, onClose, box }: BoxDetailModalProps) => {
  if (!isOpen || !box) {
    return null;
  }

  // Parsear el código de la caja para extraer información
  const parsedCode = useMemo(() => {
    return tryParseBoxCode(box.codigo);
  }, [box.codigo]);

  const formattedCode = useMemo(() => {
    return parsedCode ? formatParsedBoxCode(parsedCode) : null;
  }, [parsedCode]);

  const productionInfo = useMemo(() => {
    return parsedCode ? getProductionInfo(parsedCode) : null;
  }, [parsedCode]);

  const productInfo = useMemo(() => {
    return parsedCode ? getProductInfo(parsedCode) : null;
  }, [parsedCode]);

  // Procesar customInfo si está disponible
  const processedCustomInfo = box.customInfo
    ? processBoxCustomInfo(box.customInfo as any)
    : [];
  const totalEggs = calculateTotalEggs(processedCustomInfo);
  const mostFrequentCode = getMostFrequentCode(processedCustomInfo);

  const locationColors = {
    packing: 'bg-blue-100 text-blue-700 border-blue-200',
    bodega: 'bg-green-100 text-green-700 border-green-200',
    venta: 'bg-purple-100 text-purple-700 border-purple-200',
    transito: 'bg-orange-100 text-orange-700 border-orange-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const locationColor =
    locationColors[
      (box.ubicacion?.toLowerCase() ?? '') as keyof typeof locationColors
    ] || locationColors.default;

  const statusColors = {
    activo: 'bg-green-100 text-green-700 border-green-200',
    inactivo: 'bg-red-100 text-red-700 border-red-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusColor =
    statusColors[
      (box.estado?.toLowerCase() ?? '') as keyof typeof statusColors
    ] || statusColors.default;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent layer={70} className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Detalles de Caja {box.codigo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
        {/* Status Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <span
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md border inline-flex items-center gap-2',
                locationColor
              )}
            >
              <MapPin className="w-4 h-4" />
              {box.ubicacion || 'Sin ubicación'}
            </span>
            <span
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md border',
                statusColor
              )}
            >
              {box.estado || 'Sin estado'}
            </span>
          </div>
          {box.palletId && (
            <span className="text-sm text-muted-foreground">
              Pallet:{' '}
              <span className="font-medium text-primary">
                {box.palletId}
              </span>
            </span>
          )}
        </div>

        {/* Main Information */}
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <InfoRow icon={<Barcode className="w-5 h-5" />} label="Código" value={box.codigo} />
              <InfoRow
                icon={<Calendar className="w-5 h-5" />}
                label="Fecha de Registro"
                value={box.fecha_registro ? formatDate(box.fecha_registro) : 'N/A'}
              />
              <InfoRow
                icon={<User className="w-5 h-5" />}
                label="Empacadora"
                value={box.empacadora || formattedCode?.packerDisplay || 'N/A'}
              />
              <InfoRow
                icon={<User className="w-5 h-5" />}
                label="Operario"
                value={box.operario || formattedCode?.operatorDisplay || 'N/A'}
              />
            </div>
            <div className="space-y-1">
              <InfoRow
                icon={<Package className="w-5 h-5" />}
                label="Calibre"
                value={
                  box.calibre
                    ? formatCalibreName(box.calibre)
                    : productInfo?.caliberDisplay || 'N/A'
                }
              />
              <InfoRow
                icon={<Layers className="w-5 h-5" />}
                label="Formato de Caja"
                value={box.formato_caja || productInfo?.formatDisplay || 'N/A'}
              />
              <InfoRow
                icon={<Hash className="w-5 h-5" />}
                label="Contador"
                value={box.contador || productInfo?.counterDisplay || 'N/A'}
              />
              <InfoRow
                icon={<Hash className="w-5 h-5" />}
                label="Cantidad"
                value={box.quantity || 'N/A'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Production Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Información de Producción
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Semana</p>
              <p className="font-medium">
                {box.semana || productionInfo?.weekOfYear || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Año</p>
              <p className="font-medium">
                {box.año || productionInfo?.year || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Día de la Semana</p>
              <p className="font-medium">
                {box.dia_semana || productionInfo?.dayOfWeekDisplay || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Horario</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {box.horario_proceso || productionInfo?.shiftDisplay || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Info - Eggs Information */}
        {processedCustomInfo.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              Información de Huevos
              <span className="ml-2 px-2 py-0.5 rounded-md bg-blue-100 text-xs text-blue-700">
                {totalEggs} huevos
              </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 p-3 rounded-md border bg-muted/30">
                <div>
                  <p className="text-xs text-muted-foreground">Total de Huevos</p>
                  <p className="text-lg font-semibold">{totalEggs}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Código Principal</p>
                  <p className="text-sm font-mono font-medium">
                    {mostFrequentCode || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Desglose por Código:
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {processedCustomInfo.map((eggInfo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm font-mono">
                          {eggInfo.code}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {eggInfo.quantity} huevos
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {box.descripcion && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{box.descripcion}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary">Editar Información</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BoxDetailModal;
