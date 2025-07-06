import { Pallet } from '@/types';
import { Card, Button } from '@/components/design-system';
import { translateStatus } from '@/utils/translations';
import { Eye, CheckCircle } from 'lucide-react';
import '../styles/designSystem.css';

interface PalletCardProps {
  pallet: Pallet;
  setSelectedPallet: (pallet: Pallet) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  closePallet: (codigo: string) => void;
  fetchActivePallets: () => void;
}

const PalletCard = ({
  pallet,
  setSelectedPallet,
  setIsModalOpen,
  closePallet,
  fetchActivePallets,
}: PalletCardProps) => {
  const handleDetails = () => {
    setSelectedPallet(pallet);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    closePallet(pallet.codigo);
    fetchActivePallets();
  };

  return (
    <Card
      variant="flat"
      isHoverable
      isPressable
      onClick={handleDetails}
      padding="medium"
      style={{ width: '100%' }}
    >
      {/* Header */}
      <div className="macos-hstack" style={{ justifyContent: 'space-between', marginBottom: 'var(--macos-space-4)' }}>
        <span className="macos-text-headline" style={{ fontWeight: 700 }}>
          {pallet.codigo}
        </span>
        <div className="macos-hstack" style={{ gap: 'var(--macos-space-2)' }}>
          <span className="macos-text-footnote" style={{ 
            backgroundColor: 'var(--macos-gray-5)',
            color: 'var(--macos-text-secondary)',
            padding: 'var(--macos-space-1) var(--macos-space-2)',
            borderRadius: 'var(--macos-radius-small)'
          }}>
            {translateStatus(pallet.estado)}
          </span>
          <span className="macos-text-footnote" style={{ 
            backgroundColor: 'var(--macos-gray-5)',
            color: 'var(--macos-text-secondary)',
            padding: 'var(--macos-space-1) var(--macos-space-2)',
            borderRadius: 'var(--macos-radius-small)'
          }}>
            {pallet.ubicacion}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="macos-hstack" style={{ justifyContent: 'space-between', marginBottom: 'var(--macos-space-5)' }}>
        <div className="macos-stack" style={{ gap: 'var(--macos-space-1)' }}>
          <span className="macos-text-footnote" style={{ color: 'var(--macos-text-secondary)' }}>Cajas</span>
          <span className="macos-text-title-3" style={{ fontWeight: 600 }}>{pallet.cantidadCajas}</span>
        </div>
        <div className="macos-stack" style={{ gap: 'var(--macos-space-1)' }}>
          <span className="macos-text-footnote" style={{ color: 'var(--macos-text-secondary)' }}>Calibre</span>
          <span className="macos-text-title-3" style={{ fontWeight: 600 }}>{pallet.calibre}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="macos-hstack" style={{ gap: 'var(--macos-space-3)' }}>
        <Button
          variant="secondary"
          size="small"
          leftIcon={<Eye style={{ width: 14, height: 14 }} />}
          onClick={handleDetails}
        >
          Detalles
        </Button>
        {pallet.estado === 'open' && (
          <Button
            variant="primary"
            size="small"
            leftIcon={<CheckCircle style={{ width: 14, height: 14 }} />}
            onClick={handleClose}
          >
            Cerrar
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PalletCard;
