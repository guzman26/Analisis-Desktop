import React, { useState } from 'react';
import {
  deleteAllBoxes,
  deletePackingBoxesAsync,
  deleteAllBoxesAsync,
  deletePackingPalletsAsync,
} from '@/api/endpoints';
import { Button, Card, Modal } from '@/components/design-system';
import {
  AlertTriangle,
  Trash2,
  Shield,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import styles from './DangerZone.module.css';

interface DangerAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<{ success: boolean; message: string }>;
  confirmationMessage: string;
  dangerLevel: 'high' | 'critical';
}

const DangerZone: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<DangerAction | null>(
    null
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleDeleteAllBoxes = async () => {
    try {
      await deleteAllBoxes();
      return {
        success: true,
        message: 'Todas las cajas han sido eliminadas exitosamente.',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al eliminar las cajas: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
    }
  };

  const dangerActions: DangerAction[] = [
    {
      id: 'deleteAllBoxes',
      title: 'Eliminar Todas las Cajas',
      description:
        'Elimina permanentemente todas las cajas del sistema. Esta acción no se puede deshacer.',
      icon: <Trash2 className="w-6 h-6" />,
      action: handleDeleteAllBoxes,
      confirmationMessage:
        '¿Estás seguro de que quieres eliminar TODAS las cajas del sistema? Esta acción es irreversible y eliminará permanentemente todos los datos de cajas.',
      dangerLevel: 'critical',
    },
    {
      id: 'deletePackingBoxesAsync',
      title: 'Eliminar cajas de PACKING (asíncrono)',
      description:
        'Inicia un proceso asíncrono que borra todas las cajas actualmente en PACKING. Puede tardar algunos minutos.',
      icon: <Trash2 className="w-6 h-6" />,
      action: async () => {
        try {
          await deletePackingBoxesAsync();
          return {
            success: true,
            message:
              'Se inició la eliminación asíncrona de las cajas en PACKING. Revisa los logs para el progreso.',
          };
        } catch (error) {
          return {
            success: false,
            message: `Error al iniciar la eliminación: ${
              error instanceof Error ? error.message : 'Error desconocido'
            }`,
          };
        }
      },
      confirmationMessage:
        '¿Confirmas iniciar la eliminación ASÍNCRONA de todas las cajas en PACKING? Esta acción no se puede deshacer.',
      dangerLevel: 'high',
    },
    {
      id: 'deletePackingPalletsAsync',
      title: 'Eliminar pallets de PACKING (asíncrono)',
      description:
        'Inicia un proceso asíncrono que borra todos los pallets en PACKING. Afecta pallets abiertos/cerrados según backend.',
      icon: <Trash2 className="w-6 h-6" />,
      action: async () => {
        try {
          await deletePackingPalletsAsync();
          return {
            success: true,
            message:
              'Se inició la eliminación asíncrona de pallets en PACKING.',
          };
        } catch (error) {
          return {
            success: false,
            message: `Error al iniciar la eliminación: ${
              error instanceof Error ? error.message : 'Error desconocido'
            }`,
          };
        }
      },
      confirmationMessage:
        '¿Confirmas iniciar la eliminación ASÍNCRONA de todos los pallets en PACKING? Esta acción no se puede deshacer.',
      dangerLevel: 'high',
    },
    {
      id: 'deleteAllBoxesAsync',
      title: 'Eliminar TODAS las cajas (asíncrono)',
      description:
        'Inicia un proceso asíncrono que borra todas las cajas del sistema (todas las ubicaciones).',
      icon: <Trash2 className="w-6 h-6" />,
      action: async () => {
        try {
          await deleteAllBoxesAsync();
          return {
            success: true,
            message:
              'Se inició la eliminación asíncrona de todas las cajas. Verifica los logs para el progreso.',
          };
        } catch (error) {
          return {
            success: false,
            message: `Error al iniciar la eliminación: ${
              error instanceof Error ? error.message : 'Error desconocido'
            }`,
          };
        }
      },
      confirmationMessage:
        '¿Confirmas iniciar la eliminación ASÍNCRONA de TODAS las cajas del sistema? Esta acción no se puede deshacer.',
      dangerLevel: 'critical',
    },
  ];

  const openConfirmationModal = (action: DangerAction) => {
    setSelectedAction(action);
    setIsModalOpen(true);
    setExecutionResult(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAction(null);
    setExecutionResult(null);
  };

  const executeAction = async () => {
    if (!selectedAction) return;

    setIsExecuting(true);
    try {
      const result = await selectedAction.action();
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        message: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className={styles.headerText}>
            <h1>Zona de Peligro</h1>
            <p>
              Operaciones administrativas críticas que pueden afectar
              permanentemente el sistema
            </p>
          </div>
        </div>

        <div className={styles.warningBanner}>
          <div className={styles.warningBannerContent}>
            <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3>⚠️ Advertencia</h3>
              <p>
                Las acciones en esta sección son irreversibles y pueden resultar
                en la pérdida permanente de datos. Asegúrate de tener una copia
                de seguridad antes de proceder.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Actions Grid */}
      <div className={styles.actionsGrid}>
        {dangerActions.map((action) => (
          <Card key={action.id} variant="flat" className={styles.actionCard}>
            <div className={styles.actionCardContent}>
              <div className={styles.actionInfo}>
                <div
                  className={clsx(
                    styles.actionIcon,
                    action.dangerLevel === 'critical'
                      ? styles.critical
                      : styles.high
                  )}
                >
                  {action.icon}
                </div>
                <div className={styles.actionDetails}>
                  <div className={styles.actionHeader}>
                    <h3 className={styles.actionTitle}>{action.title}</h3>
                    {action.dangerLevel === 'critical' && (
                      <span className={styles.dangerBadge}>CRÍTICO</span>
                    )}
                  </div>
                  <p className={styles.actionDescription}>
                    {action.description}
                  </p>
                  <div className={styles.actionWarning}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Esta acción no se puede deshacer</span>
                  </div>
                </div>
              </div>
              <div className={styles.actionButton}>
                <Button
                  variant="danger"
                  size="medium"
                  leftIcon={<Trash2 size={16} />}
                  onClick={() => openConfirmationModal(action)}
                >
                  Ejecutar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Confirmar Acción Peligrosa"
        size="medium"
        showTrafficLights={true}
      >
        <div className={styles.modalContent}>
          {selectedAction && (
            <>
              {/* Action Details */}
              <div className={styles.confirmationSection}>
                <div className={styles.confirmationContent}>
                  <div className={styles.confirmationIcon}>
                    {selectedAction.icon}
                  </div>
                  <div className={styles.confirmationText}>
                    <h3>{selectedAction.title}</h3>
                    <p>{selectedAction.confirmationMessage}</p>
                  </div>
                </div>
              </div>

              {/* Execution Result */}
              {executionResult && (
                <div
                  className={clsx(
                    styles.resultSection,
                    executionResult.success ? styles.success : styles.error
                  )}
                >
                  <div className={styles.resultContent}>
                    {executionResult.success ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <h4>
                      {executionResult.success
                        ? 'Operación Exitosa'
                        : 'Error en la Operación'}
                    </h4>
                  </div>
                  <p>{executionResult.message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.modalActions}>
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  disabled={isExecuting}
                >
                  Cancelar
                </Button>
                {!executionResult && (
                  <Button
                    variant="danger"
                    onClick={executeAction}
                    disabled={isExecuting}
                    isLoading={isExecuting}
                  >
                    {isExecuting ? 'Ejecutando...' : 'Confirmar y Ejecutar'}
                  </Button>
                )}
                {executionResult && (
                  <Button variant="primary" onClick={closeModal}>
                    Cerrar
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DangerZone;
