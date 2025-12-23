import { useState } from 'react';
import { Pallet, PalletAuditResult } from '@/types';
import { Card, Button, Modal } from '@/components/design-system';
import { translateStatus } from '@/utils/translations';
import {
  Eye,
  CheckCircle,
  Package,
  Layers,
  CalendarIcon,
  MapPin,
  Trash2,
} from 'lucide-react';
import { auditPallet } from '@/api/endpoints';
import PalletAuditModal from './PalletAuditModal';
import '../styles/designSystem.css';
import styles from './PalletCard.module.css';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';
import { formatDate } from '@/utils/formatDate';
import { getPalletBoxCount } from '@/utils/palletHelpers';

interface PalletCardProps {
  pallet: Pallet;
  setSelectedPallet: (pallet: Pallet) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  closePallet: (codigo: string) => void;
  fetchActivePallets: () => void;
  onDelete?: (codigo: string) => Promise<void>;
  // Props para selección múltiple
  showSelection?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (codigo: string, selected: boolean) => void;
}

const PalletCard = ({
  pallet,
  setSelectedPallet,
  setIsModalOpen,
  closePallet,
  fetchActivePallets,
  onDelete,
  showSelection = false,
  isSelected = false,
  onSelectionChange,
}: PalletCardProps) => {
  const realBoxCount = getPalletBoxCount(pallet);
  // Estados para auditoría
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditResult, setAuditResult] = useState<PalletAuditResult | null>(
    null
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDetails = () => {
    setSelectedPallet(pallet);
    setIsModalOpen(true);
  };
  const calibre = getCalibreFromCodigo(pallet.codigo);

  // Función para transformar respuesta de API al formato esperado
  const transformAuditResponse = (apiResponse: any): PalletAuditResult => {
    const accuracy = apiResponse.accuracy * 100;
    const passed = apiResponse.isAccurate;
    const missingCount = apiResponse.missing?.count || 0;
    const extraCount = apiResponse.extra?.count || 0;
    
    // Calcular grade basado en accuracy
    let grade: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
    if (accuracy >= 95) grade = 'EXCELLENT';
    else if (accuracy >= 80) grade = 'GOOD';
    else if (accuracy >= 60) grade = 'WARNING';
    else grade = 'CRITICAL';

    // Crear issues basado en lo que falta/sobra
    const issues: any[] = [];
    if (missingCount > 0) {
      issues.push({
        type: 'MISSING_BOXES',
        severity: missingCount > 5 ? 'CRITICAL' : 'WARNING',
        message: `Faltan ${missingCount} caja${missingCount !== 1 ? 's' : ''} en el pallet`,
        details: { count: missingCount, boxes: apiResponse.missing.boxes },
      });
    }
    if (extraCount > 0) {
      issues.push({
        type: 'EXTRA_BOXES',
        severity: 'WARNING',
        message: `Hay ${extraCount} caja${extraCount !== 1 ? 's' : ''} extra en el pallet`,
        details: { count: extraCount, boxes: apiResponse.extra.boxes },
      });
    }

    return {
      passed,
      grade,
      score: Math.round(accuracy),
      summary: {
        capacityPassed: missingCount === 0 && extraCount === 0,
        uniquenessPassed: extraCount === 0,
        sequencePassed: true, // La API actual no valida secuencia
        totalIssues: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'CRITICAL').length,
        warningIssues: issues.filter(i => i.severity === 'WARNING').length,
      },
      issues,
    };
  };

  // Función para iniciar auditoría antes de cerrar pallet
  const handleCloseWithAudit = async () => {
    setIsAuditing(true);
    setShowAuditModal(true);

    try {
      const auditData = await auditPallet(pallet.codigo);
      // Transformar respuesta de API al formato esperado
      const transformedResult = transformAuditResponse(auditData);
      setAuditResult(transformedResult);
    } catch (error) {
      console.error('Error durante la auditoría:', error);
      // Crear un resultado de error para mostrar en el modal
      setAuditResult({
        passed: false,
        grade: 'CRITICAL' as const,
        score: 0,
        summary: {
          capacityPassed: false,
          uniquenessPassed: false,
          sequencePassed: false,
          totalIssues: 1,
          criticalIssues: 1,
          warningIssues: 0,
        },
        issues: [
          {
            type: 'AUDIT_ERROR' as const,
            severity: 'CRITICAL' as const,
            message:
              error instanceof Error
                ? error.message
                : 'Error del servidor durante la auditoría',
            details: {
              errorType: 'API_ERROR',
              palletCode: pallet.codigo,
            },
          },
        ],
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // Función para confirmar el cierre después de la auditoría
  const handleConfirmClose = () => {
    setShowAuditModal(false);
    setAuditResult(null);
    closePallet(pallet.codigo);
    fetchActivePallets();
  };

  // Función para cancelar el cierre
  const handleCancelAudit = () => {
    setShowAuditModal(false);
    setAuditResult(null);
    setIsAuditing(false);
  };

  // Función para eliminar el pallet
  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(pallet.codigo);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error al eliminar pallet:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine status color for improved visual hierarchy
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'var(--macos-green)';
      case 'closed':
        return 'var(--macos-blue)';
      case 'pending':
        return 'var(--macos-orange)';
      default:
        return 'var(--macos-gray)';
    }
  };

  // Format date if available (DD/MM/YYYY)
  const formattedDate = pallet.fechaCreacion
    ? formatDate(pallet.fechaCreacion)
    : 'N/A';

  // Handler para el checkbox de selección
  const handleSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange?.(pallet.codigo, !isSelected);
  };

  return (
    <>
      <Card
        variant="flat"
        isHoverable
        isPressable
        onClick={handleDetails}
        padding="medium"
        className={styles.palletCard}
        style={isSelected ? { outline: '2px solid var(--macos-blue)', outlineOffset: '-2px' } : undefined}
      >
        {/* Checkbox de selección */}
        {showSelection && (
          <div
            onClick={handleSelectionClick}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 10,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: 'var(--macos-blue)',
              }}
            />
          </div>
        )}

        {/* Status Indicator */}
        <div
          className={styles.statusIndicator}
          style={{
            backgroundColor: getStatusColor(pallet.estado),
            left: showSelection ? '36px' : '0',
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
                  {pallet.codigo}
                </span>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor:
                      pallet.estado.toLowerCase() === 'open'
                        ? 'var(--macos-green-transparentize-6)'
                        : 'var(--macos-blue-transparentize-6)',
                    color:
                      pallet.estado.toLowerCase() === 'open'
                        ? 'var(--macos-green)'
                        : 'var(--macos-blue)',
                  }}
                >
                  {translateStatus(pallet.estado)}
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
                  {pallet.ubicacion || 'Sin ubicación'}
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
                  Cajas
                </span>
                <span
                  className="macos-text-title-2"
                  style={{ fontWeight: 600 }}
                >
                  {typeof pallet.maxBoxes === 'number' &&
                  !Number.isNaN(pallet.maxBoxes)
                    ? `${realBoxCount}/${pallet.maxBoxes}`
                    : realBoxCount}
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
            {pallet.estado === 'open' && (
              <Button
                variant="primary"
                size="small"
                leftIcon={<CheckCircle style={{ width: 14, height: 14 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseWithAudit();
                }}
              >
                Cerrar
              </Button>
            )}
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

      {/* Audit Modal */}
      <PalletAuditModal
        isOpen={showAuditModal}
        onClose={handleCancelAudit}
        auditResult={auditResult}
        onConfirmClose={handleConfirmClose}
        isLoading={isAuditing}
        palletCode={pallet.codigo}
      />

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
            ¿Estás seguro de que deseas eliminar el pallet{' '}
            <strong>{pallet.codigo}</strong>?
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

export default PalletCard;
