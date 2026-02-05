import { useState, useEffect, useRef } from 'react';
import { Box, Pallet } from '@/types';
import { getBoxByCode, getPalletByCode } from '@/api/endpoints';
import { Button } from './design-system';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
      // Extraer mensaje de error de diferentes formatos
      let errorMessage =
        'Error al buscar el pallet. Verifique el código e intente nuevamente.';

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
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
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Buscar Pallet por Código de Caja</DialogTitle>
          </DialogHeader>

        <div className="space-y-5">
          {/* Input Section */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Escanear o ingresar código de caja
            </label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={boxCode}
                onChange={(e) => setBoxCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingrese el código de la caja..."
                disabled={loading}
                className="font-mono"
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
            <Card>
              <CardContent className="p-4 flex items-center gap-2 text-destructive">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </CardContent>
            </Card>
          )}

          {/* Success Message - Solo mostrar si el modal de detalles no está abierto */}
          {foundBox && foundPallet && !showPalletDetail && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Search size={16} />
                  <span className="text-sm font-medium">
                    Pallet encontrado - Mostrando detalles...
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Caja: <strong>{foundBox.codigo}</strong>
                  <br />
                  Pallet: <strong>{foundPallet.codigo}</strong>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground p-3 rounded-md bg-muted/40">
            <strong>Instrucciones:</strong>
            <br />
            • Escanee o ingrese el código de barras de una caja
            <br />
            • El sistema buscará el pallet al que pertenece la caja
            <br />• Podrá ver los detalles del pallet e imprimir su tarjeta
          </div>
        </div>
      </DialogContent>
    </Dialog>

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









