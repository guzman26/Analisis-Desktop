import React, { useState } from 'react';
import { Button } from '@/components/design-system';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/app-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePalletServerState } from '@/modules/inventory';
import { Location } from '@/types';
import { COMPANY_CATALOG, normalizeCompanyCode } from '@/utils/company';

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
  const { createLooseEggPallet } = usePalletServerState();
  const [baseCode, setBaseCode] = useState('');
  const [ubicacion, setUbicacion] = useState<Location>(defaultLocation);
  const [carts, setCarts] = useState<string>('');
  const [trays, setTrays] = useState<string>('');
  const [eggs, setEggs] = useState<string>('');
  const [empresa, setEmpresa] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyOptions = React.useMemo(
    () =>
      Object.entries(COMPANY_CATALOG)
        .filter(([key]) => /^\d{2}$/.test(key))
        .sort(([a], [b]) => Number(a) - Number(b)),
    []
  );

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
    const normalizedEmpresa = normalizeCompanyCode(empresa);
    if (!normalizedEmpresa) {
      setError('Empresa inválida');
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
        empresa: normalizedEmpresa,
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent layer={60} className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nuevo Pallet de Huevo Suelto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Código base</Label>
              <Input
                placeholder="Ej: 123456789"
                value={baseCode}
                onChange={(e) => setBaseCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input
                placeholder="PACKING"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value as Location)}
              />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select
                value={empresa || 'unselected'}
                onValueChange={(value) =>
                  setEmpresa(value === 'unselected' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">Seleccionar empresa</SelectItem>
                  {companyOptions.map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Carritos</Label>
              <Input
                type="number"
                min={0}
                value={carts}
                onChange={(e) => setCarts(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bandejas</Label>
              <Input
                type="number"
                min={0}
                value={trays}
                onChange={(e) => setTrays(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Huevos</Label>
              <Input
                type="number"
                min={0}
                value={eggs}
                onChange={(e) => setEggs(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-xs text-destructive">{error}</div>}

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PalletLooseEggsModal;
