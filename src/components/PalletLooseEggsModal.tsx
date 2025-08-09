import React, { useState } from 'react';
import Modal from '@/components/design-system/Modal';
import { Button, Input } from '@/components/design-system';
import { usePalletContext } from '@/contexts/PalletContext';
import { Location } from '@/types';

interface PalletLooseEggsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: Location;
}

const PalletLooseEggsModal: React.FC<PalletLooseEggsModalProps> = ({
  isOpen,
  onClose,
  defaultLocation = 'PACKING',
}) => {
  const { createLooseEggPallet } = usePalletContext();
  const [baseCode, setBaseCode] = useState('');
  const [ubicacion, setUbicacion] = useState<Location>(defaultLocation);
  const [carts, setCarts] = useState<string>('');
  const [trays, setTrays] = useState<string>('');
  const [eggs, setEggs] = useState<string>('');
  const [empresa, setEmpresa] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!baseCode) {
      setError('Ingrese el código base');
      return;
    }
    if (!carts && !trays && !eggs) {
      setError('Ingrese cantidad en carritos, bandejas o huevos');
      return;
    }
    if (!empresa) {
      setError('Seleccione la empresa');
      return;
    }
    setSubmitting(true);
    try {
      await createLooseEggPallet({
        codigo: baseCode,
        ubicacion,
        carts: carts ? Number(carts) : undefined,
        trays: trays ? Number(trays) : undefined,
        eggs: eggs ? Number(eggs) : undefined,
        empresa,
      });
      onClose();
      // reset
      setBaseCode('');
      setCarts('');
      setTrays('');
      setEggs('');
      setEmpresa('');
    } catch (err) {
      console.error(err);
      setError('Error al crear pallet de huevo suelto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Pallet de Huevo Suelto"
      size="large"
    >
      <form onSubmit={handleSubmit} className="macos-stack" style={{ gap: 12 }}>
        <div className="macos-hstack" style={{ gap: 12 }}>
          <Input
            label="Código base"
            placeholder="Ej: 123456789"
            value={baseCode}
            onChange={(e) => setBaseCode(e.target.value)}
          />
          <Input
            label="Ubicación"
            placeholder="PACKING"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value as Location)}
          />
          <Input
            label="Empresa"
            placeholder="Ej: 1"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
          />
        </div>
        <div className="macos-hstack" style={{ gap: 12 }}>
          <Input
            label="Carritos"
            type="number"
            min={0}
            value={carts}
            onChange={(e) => setCarts(e.target.value)}
          />
          <Input
            label="Bandejas"
            type="number"
            min={0}
            value={trays}
            onChange={(e) => setTrays(e.target.value)}
          />
          <Input
            label="Huevos"
            type="number"
            min={0}
            value={eggs}
            onChange={(e) => setEggs(e.target.value)}
          />
        </div>
        {error && (
          <div
            className="macos-text-footnote"
            style={{ color: 'var(--macos-red)' }}
          >
            {error}
          </div>
        )}
        <div
          className="macos-hstack"
          style={{ justifyContent: 'flex-end', gap: 8 }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear Pallet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PalletLooseEggsModal;
