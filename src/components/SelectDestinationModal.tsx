import React from 'react';
import { Button } from '@/components/design-system';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/app-dialog';
import { MapPin } from 'lucide-react';
import { Location } from '@/types';

interface SelectDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (destination: Location) => void;
  currentLocation?: string;
  palletCount?: number;
  availableLocations?: Location[];
  itemType?: 'pallet' | 'carro';
}

const SelectDestinationModal: React.FC<SelectDestinationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentLocation,
  palletCount = 0,
  availableLocations,
  itemType = 'pallet',
}) => {
  // Mapeo de ubicaciones a etiquetas y descripciones
  const locationLabels: Record<Location, { label: string; description: string }> = {
    PACKING: { label: 'Packing', description: 'Mover a packing' },
    TRANSITO: { label: 'Tránsito', description: 'Mover a tránsito' },
    BODEGA: { label: 'Bodega', description: 'Mover a bodega' },
    PREVENTA: { label: 'Preventa', description: 'Mover a preventa' },
    VENTA: { label: 'Venta', description: 'Mover a venta' },
    UNSUBSCRIBED: { label: 'Unsubscribed', description: 'Mover a unsubscribed' },
    RECHAZO: { label: 'Rechazo', description: 'Mover a rechazo' },
    CUARENTENA: { label: 'Cuarentena', description: 'Mover a cuarentena' },
  };

  // Si se proporcionan ubicaciones disponibles, usarlas; si no, usar las predeterminadas
  const defaultLocations: Location[] = ['TRANSITO', 'BODEGA', 'VENTA'];
  let locationsToShow = availableLocations || defaultLocations;

  // Filtrar la ubicación actual si está especificada
  if (currentLocation) {
    locationsToShow = locationsToShow.filter((loc) => loc !== currentLocation);
  }

  // Construir la lista de destinos disponibles
  const destinations = locationsToShow.map((code) => ({
    code,
    ...locationLabels[code],
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent layer={70} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Destino</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {itemType === 'carro'
              ? 'Selecciona el destino para mover el carro:'
              : palletCount > 1
              ? `Selecciona el destino para mover ${palletCount} pallets:`
              : 'Selecciona el destino para mover el pallet:'}
          </p>

          <div className="space-y-2">
            {destinations.map((destination) => (
              <Button
                key={destination.code}
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => onConfirm(destination.code)}
              >
                <MapPin size={18} className="text-primary" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{destination.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {destination.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectDestinationModal;
