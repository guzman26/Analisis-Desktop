import { useState, useEffect, useRef } from 'react';
import { Box, Pallet } from '@/types';
import { getBoxByCode, getPalletByCode } from '@/api/endpoints';
import { Modal, Button, Card } from './design-system';
import PalletDetailModal from './PalletDetailModal';
import { Search, AlertCircle, Loader2 } from 'lucide-react';

interface ScanBoxToFindPalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScanBoxToFindPalletModal = ({
  isOpen,
  onClose,
}: ScanBoxToFindPalletModalProps) => {
  const [boxCode, setBoxCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundBox, setFoundBox] = useState<Box | null>(null);
  const [foundPallet, setFoundPallet] = useState<Pallet | null>(null);
  const [showPalletDetail, setShowPalletDetail] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBoxCode('');
      setError(null);
      setFoundBox(null);
      setFoundPallet(null);
      setShowPalletDetail(false);
    }
  }, [isOpen]);

  const handleScan = async () => {
    if (!boxCode.trim()) {
      setError('Por favor ingrese un código de caja');
      return;
    }

    setLoading(true);
    setError(null);
    setFoundBox(null);
    setFoundPallet(null);

    try {
      // Buscar la caja por código
      const box = await getBoxByCode(boxCode.trim());

      if (!box) {
        setError('Caja no encontrada en el sistema');
        setLoading(false);
        return;
      }

      setFoundBox(box);

      // Verificar si la caja tiene un pallet asignado
      if (!box.palletId || box.palletId === 'UNASSIGNED') {
        setError('Esta caja no está asignada a ningún pallet');
        setLoading(false);
        return;
      }

      // Buscar el pallet
      const pallet = await getPalletByCode(box.palletId);

      if (!pallet) {
        setError('Pallet no encontrado en el sistema');
        setLoading(false);
        return;
      }

      setFoundPallet(pallet);
      // Abrir automáticamente el modal de detalles del pallet
      setShowPalletDetail(true);
    } catch (err: any) {
      console.error('Error al buscar pallet:', err);
      setError(
        err?.message ||
          'Error al buscar el pallet. Verifique el código e intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleScan();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Buscar Pallet por Código de Caja"
        size="medium"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--macos-space-5)',
          }}
        >
          {/* Input Section */}
          <div>
            <label
              className="macos-text-callout"
              style={{
                display: 'block',
                marginBottom: 'var(--macos-space-2)',
                color: 'var(--macos-text-primary)',
                fontWeight: 500,
              }}
            >
              Escanear o ingresar código de caja
            </label>
            <div style={{ display: 'flex', gap: 'var(--macos-space-2)' }}>
              <input
                ref={inputRef}
                type="text"
                value={boxCode}
                onChange={(e) => setBoxCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingrese el código de la caja..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: 'var(--macos-space-3)',
                  borderRadius: 'var(--macos-radius-2)',
                  border: '1px solid var(--macos-border)',
                  fontSize: 'var(--macos-text-body-size)',
                  fontFamily: 'monospace',
                }}
                autoFocus
              />
              <Button
                variant="primary"
                size="medium"
                onClick={handleScan}
                disabled={loading || !boxCode.trim()}
                leftIcon={
                  loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )
                }
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Card variant="flat" padding="medium">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--macos-space-2)',
                  color: 'var(--macos-red)',
                }}
              >
                <AlertCircle size={16} />
                <span className="macos-text-body">{error}</span>
              </div>
            </Card>
          )}

          {/* Success Message - Solo mostrar si el modal de detalles no está abierto */}
          {foundBox && foundPallet && !showPalletDetail && (
            <Card variant="flat" padding="medium">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--macos-space-3)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--macos-space-2)',
                    color: 'var(--macos-green)',
                  }}
                >
                  <Search size={16} />
                  <span className="macos-text-body" style={{ fontWeight: 500 }}>
                    Pallet encontrado - Mostrando detalles...
                  </span>
                </div>
                <div
                  className="macos-text-callout"
                  style={{ color: 'var(--macos-text-secondary)' }}
                >
                  Caja: <strong>{foundBox.codigo}</strong>
                  <br />
                  Pallet: <strong>{foundPallet.codigo}</strong>
                </div>
              </div>
            </Card>
          )}

          {/* Instructions */}
          <div
            className="macos-text-footnote"
            style={{
              color: 'var(--macos-text-tertiary)',
              padding: 'var(--macos-space-3)',
              backgroundColor: 'var(--macos-gray-transparentize-6)',
              borderRadius: 'var(--macos-radius-2)',
            }}
          >
            <strong>Instrucciones:</strong>
            <br />
            • Escanee o ingrese el código de barras de una caja
            <br />
            • El sistema buscará el pallet al que pertenece la caja
            <br />• Podrá ver los detalles del pallet e imprimir su tarjeta
          </div>
        </div>
      </Modal>

      {/* Pallet Detail Modal */}
      {foundPallet && (
        <PalletDetailModal
          pallet={foundPallet}
          isOpen={showPalletDetail}
          onClose={() => {
            setShowPalletDetail(false);
          }}
        />
      )}
    </>
  );
};

export default ScanBoxToFindPalletModal;
