import React, { useState } from 'react';
import { Cart, Location } from '@/types';
import { formatDate } from '@/utils/formatDate';
import {
  getCalibreFromCodigo,
  getEmpresaNombre,
  getOperarioFromCodigo,
  getEmpacadoraFromCodigo,
  getTurnoFromCodigo,
} from '@/utils/getParamsFromCodigo';
import { Button } from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/app-dialog';
import {
  Calendar,
  Package,
  MapPin,
  Barcode,
  User,
  Layers,
  Building2,
  Clock,
  MoveRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { cartsApi } from '@/modules/carts';
import SelectDestinationModal from './SelectDestinationModal';

interface CartDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  onCartMoved?: () => void;
}

const CartDetailModal = ({ isOpen, onClose, cart, onCartMoved }: CartDetailModalProps) => {
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [moveFeedback, setMoveFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen || !cart || !cart.codigo) {
    return null;
  }

  // Ubicaciones válidas para carros según el backend
  const validLocations: Location[] = [
    'PACKING',
    'TRANSITO',
    'BODEGA',
    'PREVENTA',
    'VENTA',
    'RECHAZO',
    'CUARENTENA',
  ];

  // Filtrar ubicaciones disponibles (excluir la actual)
  const availableLocations = validLocations.filter(
    (loc) => loc !== cart.ubicacion
  );

  const handleMove = () => {
    setShowDestinationModal(true);
    setMoveFeedback(null);
  };

  const handleConfirmMove = async (destination: Location) => {
    if (!cart?.codigo) return;

    setIsMoving(true);
    setMoveFeedback(null);

    try {
      await cartsApi.move(cart.codigo, destination);
      setMoveFeedback({
        type: 'success',
        message: `Carro movido exitosamente a ${destination}`,
      });

      // Cerrar modales después de un breve delay para mostrar el mensaje
      setTimeout(() => {
        setShowDestinationModal(false);
        onClose();
        if (onCartMoved) {
          onCartMoved();
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error al mover carro:', error);
      setMoveFeedback({
        type: 'error',
        message: error?.message || 'Error al mover el carro. Por favor, intenta nuevamente.',
      });
    } finally {
      setIsMoving(false);
    }
  };

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent layer={60} className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalle del Carro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
        {/* Código del Carro */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Barcode className="text-primary" size={24} />
            <div>
              <div className="text-xs text-muted-foreground mb-1">Código</div>
              <div className="text-xl font-bold">{cart.codigo}</div>
            </div>
          </CardContent>
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
            value={cart.codigo ? (getCalibreFromCodigo(cart.codigo) || 'N/A') : 'N/A'}
          />

          <InfoRow
            icon={<Building2 size={18} />}
            label="Empresa"
            value={cart.codigo ? (getEmpresaNombre(cart.codigo) || 'N/A') : 'N/A'}
          />

          <InfoRow
            icon={<User size={18} />}
            label="Operario"
            value={cart.codigo ? (getOperarioFromCodigo(cart.codigo) || 'N/A') : 'N/A'}
          />

          <InfoRow
            icon={<User size={18} />}
            label="Empacadora"
            value={cart.codigo ? (getEmpacadoraFromCodigo(cart.codigo) || 'N/A') : 'N/A'}
          />

          <InfoRow
            icon={<Clock size={18} />}
            label="Turno"
            value={cart.codigo ? (getTurnoFromCodigo(cart.codigo) || 'N/A') : 'N/A'}
          />
        </div>

        {/* Información Adicional */}
        {cart.formatId && (
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-2">Formato ID</div>
              <div className="text-sm font-semibold">{cart.formatId}</div>
            </CardContent>
          </Card>
        )}

        {cart.updatedAt && (
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-2">
                Última Actualización
              </div>
              <div className="text-sm font-semibold">{formatDate(cart.updatedAt)}</div>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex-1">
              {moveFeedback && (
                <div
                  className={clsx(
                    'p-3 rounded-lg border text-sm',
                    moveFeedback.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  )}
                >
                  {moveFeedback.message}
                </div>
              )}
            </div>
            <Button
              variant="primary"
              size="medium"
              leftIcon={<MoveRight size={16} />}
              onClick={handleMove}
              disabled={isMoving || availableLocations.length === 0}
              isLoading={isMoving}
            >
              Mover
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de selección de destino */}
      <SelectDestinationModal
        isOpen={showDestinationModal}
        onClose={() => {
          setShowDestinationModal(false);
          setMoveFeedback(null);
        }}
        onConfirm={handleConfirmMove}
        currentLocation={cart.ubicacion}
        availableLocations={availableLocations}
        itemType="carro"
      />
    </DialogContent>
  </Dialog>
  );
};

export default CartDetailModal;
