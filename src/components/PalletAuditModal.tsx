import { Modal, Button, Card } from './design-system';
import { PalletAuditResult, AuditIssue } from '@/types';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  TrendingUp,
  Package,
  BarChart3,
} from 'lucide-react';
import { clsx } from 'clsx';

interface PalletAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditResult: PalletAuditResult | null;
  onConfirmClose: () => void;
  isLoading?: boolean;
  palletCode?: string;
}

const PalletAuditModal = ({
  isOpen,
  onClose,
  auditResult,
  onConfirmClose,
  isLoading = false,
  palletCode = '',
}: PalletAuditModalProps) => {
  if (!isOpen) return null;

  // Función para obtener el color según el grade
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'EXCELLENT':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'GOOD':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Función para obtener el icono según la severidad
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle size={16} className="text-red-500" />;
      case 'WARNING':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  // Función para obtener mensaje en español del tipo de problema
  const getIssueMessage = (issue: AuditIssue) => {
    const translations: Record<string, string> = {
      COUNT_MISMATCH: 'Discrepancia en el conteo de cajas',
      OVERFILLED: 'Pallet sobrecargado',
      UNDERUTILIZED: 'Pallet subutilizado',
      DUPLICATE_BOXES: 'Cajas duplicadas encontradas',
      SEQUENCE_GAPS: 'Huecos en la secuencia de cajas',
      DUPLICATE_SEQUENCES: 'Secuencias duplicadas',
      INVALID_BOX_CODES: 'Códigos de caja inválidos',
      SEQUENCE_CHECK_ERROR: 'Error al verificar secuencia',
      INVALID_PALLET_CODE: 'Código de pallet inválido',
      PALLET_NOT_FOUND: 'Pallet no encontrado',
      AUDIT_ERROR: 'Error durante la auditoría',
    };
    return translations[issue.type] || issue.message;
  };

  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="large"
        title="Auditoría de Pallet"
      >
        <div className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Auditando Pallet</h3>
            <p className="text-gray-600">
              Verificando integridad del pallet {palletCode}...
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  if (!auditResult) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="large"
        title="Error en Auditoría"
      >
        <div className="p-6">
          <div className="text-center">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error en Auditoría</h3>
            <p className="text-gray-600 mb-4">
              No se pudo completar la auditoría del pallet.
            </p>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      title="Auditoría de Pallet"
    >
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Auditoría de Pallet</h2>
            <div
              className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium border',
                getGradeColor(auditResult.grade)
              )}
            >
              {auditResult.grade}
            </div>
          </div>
          <p className="text-gray-600">
            Código: <span className="font-mono">{palletCode}</span>
          </p>
        </div>

        {/* Score */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 size={24} className="text-blue-500" />
              <div>
                <h3 className="font-semibold">Puntuación de Auditoría</h3>
                <p className="text-gray-600">
                  Evaluación general de la integridad
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{auditResult.score}/100</div>
              <div
                className={clsx(
                  'text-sm font-medium',
                  auditResult.score >= 80
                    ? 'text-green-600'
                    : auditResult.score >= 60
                      ? 'text-yellow-600'
                      : 'text-red-600'
                )}
              >
                {auditResult.passed ? 'APROBADO' : 'CON PROBLEMAS'}
              </div>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Resumen de Verificación
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div
                className={clsx(
                  'flex items-center justify-center mx-auto mb-2 w-8 h-8 rounded-full',
                  auditResult.summary.capacityPassed
                    ? 'bg-green-100'
                    : 'bg-red-100'
                )}
              >
                {auditResult.summary.capacityPassed ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <XCircle size={16} className="text-red-600" />
                )}
              </div>
              <div className="text-sm font-medium">Capacidad</div>
              <div className="text-xs text-gray-600">
                {auditResult.summary.capacityPassed
                  ? 'Correcta'
                  : 'Con problemas'}
              </div>
            </div>
            <div className="text-center">
              <div
                className={clsx(
                  'flex items-center justify-center mx-auto mb-2 w-8 h-8 rounded-full',
                  auditResult.summary.uniquenessPassed
                    ? 'bg-green-100'
                    : 'bg-red-100'
                )}
              >
                {auditResult.summary.uniquenessPassed ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <XCircle size={16} className="text-red-600" />
                )}
              </div>
              <div className="text-sm font-medium">Unicidad</div>
              <div className="text-xs text-gray-600">
                {auditResult.summary.uniquenessPassed
                  ? 'Sin duplicados'
                  : 'Con duplicados'}
              </div>
            </div>
            <div className="text-center">
              <div
                className={clsx(
                  'flex items-center justify-center mx-auto mb-2 w-8 h-8 rounded-full',
                  auditResult.summary.sequencePassed
                    ? 'bg-green-100'
                    : 'bg-red-100'
                )}
              >
                {auditResult.summary.sequencePassed ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <XCircle size={16} className="text-red-600" />
                )}
              </div>
              <div className="text-sm font-medium">Secuencia</div>
              <div className="text-xs text-gray-600">
                {auditResult.summary.sequencePassed ? 'Continua' : 'Con huecos'}
              </div>
            </div>
          </div>
        </Card>

        {/* Issues */}
        {auditResult.issues.length > 0 && (
          <Card className="mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Problemas Encontrados ({auditResult.issues.length})
            </h3>
            <div className="space-y-3">
              {auditResult.issues.map((issue, index) => (
                <div
                  key={index}
                  className={clsx(
                    'p-3 rounded-lg border border-l-4',
                    issue.severity === 'CRITICAL'
                      ? 'bg-red-50 border-red-200 border-l-red-500'
                      : 'bg-yellow-50 border-yellow-200 border-l-yellow-500'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="font-medium">
                        {getIssueMessage(issue)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {issue.message}
                      </div>
                      {issue.details &&
                        Object.keys(issue.details).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1 font-mono">
                            {JSON.stringify(issue.details, null, 2).substring(
                              0,
                              200
                            )}
                            ...
                          </div>
                        )}
                    </div>
                    <span
                      className={clsx(
                        'px-2 py-1 rounded text-xs font-medium',
                        issue.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      )}
                    >
                      {issue.severity === 'CRITICAL'
                        ? 'CRÍTICO'
                        : 'ADVERTENCIA'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* No issues */}
        {auditResult.issues.length === 0 && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle size={24} />
              <div>
                <h3 className="font-semibold">Auditoría Exitosa</h3>
                <p className="text-sm">
                  No se encontraron problemas en el pallet.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={auditResult.passed ? 'primary' : 'danger'}
            onClick={onConfirmClose}
            leftIcon={<Package size={16} />}
          >
            {auditResult.passed
              ? 'Proceder a Cerrar'
              : 'Cerrar de Todas Formas'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PalletAuditModal;
