import { useState } from 'react';
import { Cart } from '@/types';
import { Card, Button, Modal } from '@/components/design-system';
import {
  Eye,
  MapPin,
  CalendarIcon,
  Package,
  Layers,
  Trash2,
} from 'lucide-react';
import '../styles/designSystem.css';
import styles from './PalletCard.module.css';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';
import { formatDate } from '@/utils/formatDate';
import { getEmpresaNombre } from '@/utils/getParamsFromCodigo';

interface CartCardProps {
  cart: Cart;
  setSelectedCart: (cart: Cart) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  onDelete?: (codigo: string) => Promise<void>;
}

const CartCard = ({
  cart,
  setSelectedCart,
  setIsModalOpen,
  onDelete,
}: CartCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDetails = () => {
    setSelectedCart(cart);
    setIsModalOpen(true);
  };

  const calibre = getCalibreFromCodigo(cart.codigo);

  // Función para eliminar el carro
  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(cart.codigo);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error al eliminar carro:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date if available (DD/MM/YYYY)
  const formattedDate = cart.fechaCreacion
    ? formatDate(cart.fechaCreacion)
    : 'N/A';

  return (
    <>
      <Card
        variant="flat"
        isHoverable
        isPressable
        onClick={handleDetails}
        padding="medium"
        className={styles.palletCard}
      >
        {/* Status Indicator - siempre azul para carros */}
        <div
          className={styles.statusIndicator}
          style={{
            backgroundColor: 'var(--macos-blue)',
          }}
        />

        {/* Main content container */}
        <div className={styles.contentContainer}>
          {/* Header Section */}
          <div className={styles.palletHeader}>
            <div className={styles.primaryInfo}>
              <div className={styles.codeContainer}>
                <span
                  className="macos-text-headline"
                  style={{ fontWeight: 700 }}
                >
                  {cart.codigo}
                </span>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: 'var(--macos-blue-transparentize-6)',
                    color: 'var(--macos-blue)',
                  }}
                >
                  Carro
                </span>
              </div>
              <div className={styles.locationContainer}>
                <MapPin
                  size={12}
                  style={{ color: 'var(--macos-text-tertiary)' }}
                />
                <span
                  className="macos-text-footnote"
                  style={{ color: 'var(--macos-text-tertiary)' }}
                >
                  {cart.ubicacion || 'Sin ubicación'}
                </span>
              </div>
            </div>

            <div className={styles.dateInfo}>
              <CalendarIcon
                size={12}
                style={{ color: 'var(--macos-text-tertiary)' }}
              />
              <span
                className="macos-text-footnote"
                style={{ color: 'var(--macos-text-tertiary)' }}
              >
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <Package size={16} style={{ color: 'var(--macos-blue)' }} />
              <div className={styles.infoCol}>
                <span
                  className="macos-text-callout"
                  style={{ color: 'var(--macos-text-secondary)' }}
                >
                  Bandejas
                </span>
                <span
                  className="macos-text-title-2"
                  style={{ fontWeight: 600 }}
                >
                  {cart.cantidadBandejas || 0}
                </span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <Layers size={16} style={{ color: 'var(--macos-purple)' }} />
              <div className={styles.infoCol}>
                <span
                  className="macos-text-callout"
                  style={{ color: 'var(--macos-text-secondary)' }}
                >
                  Huevos
                </span>
                <span
                  className="macos-text-title-2"
                  style={{ fontWeight: 600 }}
                >
                  {cart.cantidadHuevos || 0}
                </span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <Layers size={16} style={{ color: 'var(--macos-green)' }} />
              <div className={styles.infoCol}>
                <span
                  className="macos-text-callout"
                  style={{ color: 'var(--macos-text-secondary)' }}
                >
                  Calibre
                </span>
                <span
                  className="macos-text-title-2"
                  style={{ fontWeight: 600 }}
                >
                  {calibre || 'N/A'}
                </span>
              </div>
            </div>
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
            {onDelete && (
              <Button
                variant="secondary"
                size="small"
                leftIcon={<Trash2 style={{ width: 14, height: 14 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                disabled={isDeleting}
              >
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        title="Confirmar Eliminación"
        size="small"
      >
        <div style={{ paddingBottom: 'var(--macos-space-5)' }}>
          <p
            className="macos-text-body"
            style={{ marginBottom: 'var(--macos-space-3)' }}
          >
            ¿Estás seguro de que deseas eliminar el carro{' '}
            <strong>{cart.codigo}</strong>?
          </p>
          <p
            className="macos-text-footnote"
            style={{ color: 'var(--macos-text-secondary)' }}
          >
            Esta acción no se puede deshacer.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--macos-space-3)',
              marginTop: 'var(--macos-space-5)',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CartCard;

