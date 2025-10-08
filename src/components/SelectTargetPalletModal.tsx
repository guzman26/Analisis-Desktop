import React, { useEffect, useState } from 'react';
import Modal from '@/components/design-system/Modal';
import {
  Button,
  Card,
  Input,
  LoadingOverlay,
} from '@/components/design-system';
import { usePalletContext } from '@/contexts/PalletContext';
import {
  getCalibreFromCodigo,
  getTurnoNombre,
  formatCalibreName,
} from '@/utils/getParamsFromCodigo';
import { Package, CheckCircle } from 'lucide-react';

interface SelectTargetPalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  excludePalletCode?: string;
  onConfirm: (targetPalletCode: string) => void;
}

const SelectTargetPalletModal: React.FC<SelectTargetPalletModalProps> = ({
  isOpen,
  onClose,
  excludePalletCode,
  onConfirm,
}) => {
  const { openPallets, fetchActivePallets, loading } = usePalletContext();
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchActivePallets();
      setSelectedCode('');
      setQuery('');
    }
  }, [isOpen]);

  const pallets = openPallets
    .filter((p) => p.codigo !== excludePalletCode)
    .filter((p) =>
      query.trim()
        ? p.codigo.toLowerCase().includes(query.trim().toLowerCase())
        : true
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar pallet destino"
      size="large"
    >
      <div className="macos-stack" style={{ gap: 12 }}>
        <LoadingOverlay show={loading} text="Cargando pallets abiertos…" />
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-macos-sm">
          <p className="text-sm text-blue-800">
            <Package className="w-4 h-4 inline mr-1" />
            Seleccione el pallet de destino para mover las cajas seleccionadas.
          </p>
        </div>
        
        <Input
          label="Buscar por código"
          placeholder="Ej: 43225…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Card variant="flat" padding="none">
          <div className="max-h-80 overflow-y-auto divide-y divide-macos-border">
            {loading && (
              <div className="p-3 text-macos-text-secondary">Cargando…</div>
            )}
            {!loading && pallets.length === 0 && (
              <div className="p-3 text-macos-text-secondary text-center">
                No hay pallets abiertos disponibles en PACKING
              </div>
            )}
            {!loading &&
              pallets.map((p) => {
                const isSelected = selectedCode === p.codigo;
                const calibre = getCalibreFromCodigo(p.codigo);
                const capacityInfo = p.maxBoxes 
                  ? `${p.cantidadCajas}/${p.maxBoxes}`
                  : `${p.cantidadCajas}`;
                
                return (
                  <button
                    key={p.codigo}
                    className={`w-full text-left px-4 py-3 transition-all ${
                      isSelected
                        ? 'bg-macos-accent/10 border-l-4 border-macos-accent'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCode(p.codigo)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-macos-accent" />
                          <span className="font-mono font-semibold text-macos-text">
                            {p.codigo}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-macos-text-secondary">
                          <span className="px-2 py-0.5 rounded-macos-sm bg-gray-100 border border-macos-border">
                            {formatCalibreName(calibre)}
                          </span>
                          <span>Cajas: {capacityInfo}</span>
                          <span>Turno: {getTurnoNombre(p.baseCode)}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-macos-accent">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Seleccionado
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </Card>

        <div
          className="macos-hstack"
          style={{ justifyContent: 'flex-end', gap: 8 }}
        >
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={!selectedCode}
            onClick={() => onConfirm(selectedCode)}
          >
            Confirmar y mover
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectTargetPalletModal;
