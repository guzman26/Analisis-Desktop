import React from 'react';
import { Modal, Button } from '@/components/design-system';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Confirmar eliminación',
  description = 'Esta acción no se puede deshacer. ¿Desea continuar?',
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onClose,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="macos-stack" style={{ gap: 12 }}>
        <p className="text-macos-text-secondary">{description}</p>
        <div
          className="macos-hstack"
          style={{ justifyContent: 'flex-end', gap: 8 }}
        >
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
            className="!bg-macos-danger !text-white hover:!bg-macos-danger/90"
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
