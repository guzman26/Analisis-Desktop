import React from 'react';
import { Modal, Button } from '@/components/design-system';
import { MapPin } from 'lucide-react';

interface SelectDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (destination: 'TRANSITO' | 'BODEGA' | 'VENTA') => void;
  currentLocation?: string;
  palletCount?: number;
}

const SelectDestinationModal: React.FC<SelectDestinationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentLocation,
  palletCount = 0,
}) => {
  const destinations: Array<{
    code: 'TRANSITO' | 'BODEGA' | 'VENTA';
    label: string;
    description: string;
  }> = [
    {
      code: 'TRANSITO',
      label: 'Tránsito',
      description: 'Mover pallets a tránsito',
    },
    {
      code: 'BODEGA',
      label: 'Bodega',
      description: 'Mover pallets a bodega',
    },
    {
      code: 'VENTA',
      label: 'Venta',
      description: 'Mover pallets a venta',
    },
  ];

  // Filtrar el destino actual si está especificado
  const availableDestinations = currentLocation
    ? destinations.filter((d) => d.code !== currentLocation)
    : destinations;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Destino"
      size="small"
    >
      <div style={{ paddingBottom: 'var(--macos-space-5)' }}>
        <p
          className="macos-text-body"
          style={{ marginBottom: 'var(--macos-space-4)' }}
        >
          {palletCount > 1
            ? `Selecciona el destino para mover ${palletCount} pallets:`
            : 'Selecciona el destino para mover el pallet:'}
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--macos-space-2)',
            marginBottom: 'var(--macos-space-5)',
          }}
        >
          {availableDestinations.map((destination) => (
            <button
              key={destination.code}
              onClick={() => onConfirm(destination.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-3)',
                padding: 'var(--macos-space-3)',
                border: '1px solid var(--macos-border)',
                borderRadius: 'var(--macos-radius-sm)',
                backgroundColor: 'var(--macos-fill-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--macos-fill-tertiary)';
                e.currentTarget.style.borderColor = 'var(--macos-blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--macos-fill-secondary)';
                e.currentTarget.style.borderColor = 'var(--macos-border)';
              }}
            >
              <MapPin
                size={18}
                style={{ color: 'var(--macos-blue)' }}
              />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p
                  className="macos-text-body"
                  style={{
                    fontWeight: 600,
                    color: 'var(--macos-text-primary)',
                    marginBottom: '2px',
                  }}
                >
                  {destination.label}
                </p>
                <p
                  className="macos-text-footnote"
                  style={{ color: 'var(--macos-text-secondary)' }}
                >
                  {destination.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'var(--macos-space-3)',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="secondary" size="small" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectDestinationModal;

