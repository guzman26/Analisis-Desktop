import { Pallet } from '@/types';
import { Card, Button } from '@/components/design-system';
import { translateStatus } from '@/utils/translations';
import { Eye, CheckCircle, Package, Layers, CalendarIcon, MapPin } from 'lucide-react';
import '../styles/designSystem.css';
import styles from './PalletCard.module.css';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';

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
  const calibre = getCalibreFromCodigo(pallet.codigo);

  const handleClose = () => {
    closePallet(pallet.codigo);
    fetchActivePallets();
  };
  
  // Determine status color for improved visual hierarchy
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'open': return 'var(--macos-green)';
      case 'closed': return 'var(--macos-blue)';
      case 'pending': return 'var(--macos-orange)';
      default: return 'var(--macos-gray)';
    }
  };
  
  // Format date if available
  const formattedDate = pallet.fechaCreacion ? 
    new Date(pallet.fechaCreacion).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) : 'N/A';

  return (
    <Card
      variant="flat"
      isHoverable
      isPressable
      onClick={handleDetails}
      padding="medium"
      className={styles.palletCard}
    >
      {/* Status Indicator */}
      <div className={styles.statusIndicator} style={{
        backgroundColor: getStatusColor(pallet.estado)
      }} />
      
      {/* Main content container */}
      <div className={styles.contentContainer}>
        {/* Header Section */}
        <div className={styles.palletHeader}>
          <div className={styles.primaryInfo}>
            <div className={styles.codeContainer}>
              <span className="macos-text-headline" style={{ fontWeight: 700 }}>
                {pallet.codigo}
              </span>
              <span className={styles.statusBadge} style={{
                backgroundColor: pallet.estado.toLowerCase() === 'open' ? 
                  'var(--macos-green-transparentize-6)' : 
                  'var(--macos-blue-transparentize-6)',
                color: pallet.estado.toLowerCase() === 'open' ? 
                  'var(--macos-green)' : 
                  'var(--macos-blue)'
              }}>
                {translateStatus(pallet.estado)}
              </span>
            </div>
            <div className={styles.locationContainer}>
              <MapPin size={12} style={{ color: 'var(--macos-text-tertiary)' }} />
              <span className="macos-text-footnote" style={{ color: 'var(--macos-text-tertiary)' }}>
                {pallet.ubicacion || 'Sin ubicación'}
              </span>
            </div>
          </div>
          
          <div className={styles.dateInfo}>
            <CalendarIcon size={12} style={{ color: 'var(--macos-text-tertiary)' }} />
            <span className="macos-text-footnote" style={{ color: 'var(--macos-text-tertiary)' }}>
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <Package size={16} style={{ color: 'var(--macos-blue)' }} />
            <div className={styles.infoCol}>
              <span className="macos-text-callout" style={{ color: 'var(--macos-text-secondary)' }}>
                Cajas
              </span>
              <span className="macos-text-title-2" style={{ fontWeight: 600 }}>
                {pallet.cantidadCajas}
              </span>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <Layers size={16} style={{ color: 'var(--macos-purple)' }} />
            <div className={styles.infoCol}>
              <span className="macos-text-callout" style={{ color: 'var(--macos-text-secondary)' }}>
                Calibre
              </span>
              <span className="macos-text-title-2" style={{ fontWeight: 600 }}>
                {calibre || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Additional Info based on available pallet data */}
        <div className={styles.additionalInfo}>
          <span className="macos-text-footnote" style={{ color: 'var(--macos-text-secondary)' }}>
            Código base:
          </span>
          <span className="macos-text-footnote">
            {pallet.baseCode}
          </span>
        </div>

        {/* Actions */}
        <div className={styles.palletActions}>
          <Button
            variant="secondary"
            size="small"
            leftIcon={<Eye style={{ width: 14, height: 14 }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleDetails();
            }}
          >
            Detalles
          </Button>
          {pallet.estado === 'open' && (
            <Button
              variant="primary"
              size="small"
              leftIcon={<CheckCircle style={{ width: 14, height: 14 }} />}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              Cerrar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PalletCard;
