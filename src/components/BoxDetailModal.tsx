import React from 'react';
import { Box } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';
import {
  processBoxCustomInfo,
  calculateTotalEggs,
  getMostFrequentCode,
} from '@/utils';
import { Modal, Button, Card } from '@/components/design-system';
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

interface BoxDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: Box | null;
}

const BoxDetailModal = ({ isOpen, onClose, box }: BoxDetailModalProps) => {
  if (!isOpen || !box) {
    return null;
  }

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
      box.ubicacion.toLowerCase() as keyof typeof locationColors
    ] || locationColors.default;

  const statusColors = {
    activo: 'bg-green-100 text-green-700 border-green-200',
    inactivo: 'bg-red-100 text-red-700 border-red-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusColor =
    statusColors[box.estado.toLowerCase() as keyof typeof statusColors] ||
    statusColors.default;

  const InfoRow = ({
    icon,
    label,
    value,
    className,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={clsx(
        'flex items-start gap-3 p-3 rounded-macos-sm hover:bg-gray-50 transition-colors',
        className
      )}
    >
      <div className="text-macos-text-secondary mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-macos-text-secondary">{label}</p>
        <p className="text-base font-medium text-macos-text">{value}</p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles de Caja ${box.codigo}`}
      size="large"
      showTrafficLights={true}
    >
      <div className="space-y-6">
        {/* Status Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <span
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-macos-sm border inline-flex items-center gap-2',
                locationColor
              )}
            >
              <MapPin className="w-4 h-4" />
              {box.ubicacion}
            </span>
            <span
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-macos-sm border',
                statusColor
              )}
            >
              {box.estado}
            </span>
          </div>
          {box.palletId && (
            <span className="text-sm text-macos-text-secondary">
              Pallet:{' '}
              <span className="font-medium text-macos-accent">
                {box.palletId}
              </span>
            </span>
          )}
        </div>

        {/* Main Information */}
        <Card variant="flat" padding="none">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-macos-border">
            <div className="space-y-1">
              <InfoRow
                icon={<Barcode className="w-5 h-5" />}
                label="Código"
                value={box.codigo}
              />
              <InfoRow
                icon={<Calendar className="w-5 h-5" />}
                label="Fecha de Registro"
                value={formatDate(box.fecha_registro)}
              />
              <InfoRow
                icon={<User className="w-5 h-5" />}
                label="Empacadora"
                value={box.empacadora}
              />
              <InfoRow
                icon={<User className="w-5 h-5" />}
                label="Operario"
                value={box.operario}
              />
            </div>
            <div className="space-y-1">
              <InfoRow
                icon={<Package className="w-5 h-5" />}
                label="Calibre"
                value={formatCalibreName(box.calibre.toString())}
              />
              <InfoRow
                icon={<Layers className="w-5 h-5" />}
                label="Formato de Caja"
                value={box.formato_caja}
              />
              <InfoRow
                icon={<Hash className="w-5 h-5" />}
                label="Contador"
                value={box.contador}
              />
              <InfoRow
                icon={<Hash className="w-5 h-5" />}
                label="Cantidad"
                value={box.quantity}
              />
            </div>
          </div>
        </Card>

        {/* Production Information */}
        <Card variant="flat">
          <h3 className="text-sm font-medium text-macos-text mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Información de Producción
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-macos-text-secondary">Semana</p>
              <p className="font-medium text-macos-text">{box.semana}</p>
            </div>
            <div>
              <p className="text-macos-text-secondary">Año</p>
              <p className="font-medium text-macos-text">{box.año}</p>
            </div>
            <div>
              <p className="text-macos-text-secondary">Día de la Semana</p>
              <p className="font-medium text-macos-text">{box.dia_semana}</p>
            </div>
            <div>
              <p className="text-macos-text-secondary">Horario</p>
              <p className="font-medium text-macos-text flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {box.horario_proceso}
              </p>
            </div>
          </div>
        </Card>

        {/* Custom Info - Eggs Information */}
        {processedCustomInfo.length > 0 && (
          <Card variant="flat">
            <h3 className="text-sm font-medium text-macos-text mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Información de Huevos
              <span className="ml-2 px-2 py-0.5 rounded-macos-sm bg-blue-100 text-xs text-blue-700">
                {totalEggs} huevos
              </span>
            </h3>

            <div className="space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-macos-sm">
                <div>
                  <p className="text-xs text-macos-text-secondary">
                    Total de Huevos
                  </p>
                  <p className="text-lg font-semibold text-macos-text">
                    {totalEggs}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-macos-text-secondary">
                    Código Principal
                  </p>
                  <p className="text-sm font-mono font-medium text-macos-text">
                    {mostFrequentCode || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Detailed List */}
              <div>
                <p className="text-xs text-macos-text-secondary mb-2">
                  Desglose por Código:
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {processedCustomInfo.map((eggInfo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-macos-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-macos-accent"></div>
                        <span className="text-sm font-mono text-macos-text">
                          {eggInfo.code}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-macos-text">
                        {eggInfo.quantity} huevos
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Description */}
        {box.descripcion && (
          <Card variant="flat">
            <h3 className="text-sm font-medium text-macos-text mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descripción
            </h3>
            <p className="text-sm text-macos-text whitespace-pre-wrap">
              {box.descripcion}
            </p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-macos-border">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary">Editar Información</Button>
        </div>
      </div>
    </Modal>
  );
};

export default BoxDetailModal;
