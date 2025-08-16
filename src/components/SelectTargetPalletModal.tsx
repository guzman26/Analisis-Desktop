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
} from '@/utils/getParamsFromCodigo';

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
              <div className="p-3 text-macos-text-secondary">
                No hay pallets abiertos disponibles en PACKING
              </div>
            )}
            {!loading &&
              pallets.map((p) => {
                const isSelected = selectedCode === p.codigo;
                return (
                  <button
                    key={p.codigo}
                    className={`w-full text-left px-3 py-2 transition-colors ${
                      isSelected
                        ? 'bg-macos-accent/10 border-l-4 border-macos-accent'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCode(p.codigo)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-macos-text">
                          {p.codigo}
                        </span>
                        <span className="text-sm text-macos-text-secondary">
                          Calibre: {getCalibreFromCodigo(p.codigo)} · Cajas:{' '}
                          {p.cantidadCajas} · Turno:{' '}
                          {getTurnoNombre(p.baseCode)}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-macos-accent text-sm font-medium">
                          Seleccionado
                        </span>
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
            Enviar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectTargetPalletModal;
