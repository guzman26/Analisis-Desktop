import React from 'react';
import { Cart } from '@/types';
import { formatDate } from '@/utils/formatDate';
import {
  getCalibreFromCodigo,
  getEmpresaNombre,
  getOperarioFromCodigo,
  getEmpacadoraFromCodigo,
  getTurnoFromCodigo,
} from '@/utils/getParamsFromCodigo';
import { Modal, Card } from '@/components/design-system';
import {
  Calendar,
  Package,
  MapPin,
  Barcode,
  User,
  Layers,
  Building2,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';

interface CartDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
}

const CartDetailModal = ({ isOpen, onClose, cart }: CartDetailModalProps) => {
  if (!isOpen || !cart) {
    return null;
  }

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
        'flex items-start gap-3 p-3 rounded-lg border',
        className || 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="flex-shrink-0 mt-0.5 text-gray-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );

  const locationColors = {
    packing: 'bg-blue-100 text-blue-700 border-blue-200',
    bodega: 'bg-green-100 text-green-700 border-green-200',
    venta: 'bg-purple-100 text-purple-700 border-purple-200',
    transito: 'bg-orange-100 text-orange-700 border-orange-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const locationColor =
    locationColors[
      (cart.ubicacion?.toLowerCase() ?? '') as keyof typeof locationColors
    ] || locationColors.default;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Carro" size="large">
      <div className="space-y-4">
        {/* Código del Carro */}
        <Card variant="flat" className="p-4">
          <div className="flex items-center gap-3">
            <Barcode className="text-blue-600" size={24} />
            <div>
              <div className="text-xs text-gray-500 mb-1">Código</div>
              <div className="text-xl font-bold text-gray-900">{cart.codigo}</div>
            </div>
          </div>
        </Card>

        {/* Información Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow
            icon={<MapPin size={18} />}
            label="Ubicación"
            value={
              <span
                className={clsx(
                  'px-2 py-1 rounded text-xs font-medium border',
                  locationColor
                )}
              >
                {cart.ubicacion || 'Sin ubicación'}
              </span>
            }
          />

          <InfoRow
            icon={<Calendar size={18} />}
            label="Fecha de Creación"
            value={formatDate(cart.fechaCreacion) || 'N/A'}
          />

          <InfoRow
            icon={<Package size={18} />}
            label="Bandejas"
            value={cart.cantidadBandejas || 0}
          />

          <InfoRow
            icon={<Layers size={18} />}
            label="Total de Huevos"
            value={cart.cantidadHuevos || 0}
          />

          <InfoRow
            icon={<Layers size={18} />}
            label="Calibre"
            value={getCalibreFromCodigo(cart.codigo) || 'N/A'}
          />

          <InfoRow
            icon={<Building2 size={18} />}
            label="Empresa"
            value={getEmpresaNombre(cart.codigo) || 'N/A'}
          />

          <InfoRow
            icon={<User size={18} />}
            label="Operario"
            value={getOperarioFromCodigo(cart.codigo) || 'N/A'}
          />

          <InfoRow
            icon={<User size={18} />}
            label="Empacadora"
            value={getEmpacadoraFromCodigo(cart.codigo) || 'N/A'}
          />

          <InfoRow
            icon={<Clock size={18} />}
            label="Turno"
            value={getTurnoFromCodigo(cart.codigo) || 'N/A'}
          />
        </div>

        {/* Información Adicional */}
        {cart.formatId && (
          <Card variant="flat" className="p-4">
            <div className="text-xs text-gray-500 mb-2">Formato ID</div>
            <div className="text-sm font-semibold text-gray-900">
              {cart.formatId}
            </div>
          </Card>
        )}

        {cart.updatedAt && (
          <Card variant="flat" className="p-4">
            <div className="text-xs text-gray-500 mb-2">Última Actualización</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatDate(cart.updatedAt)}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default CartDetailModal;

