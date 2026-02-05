import { useState } from 'react';
import { Pallet, PalletAuditResult } from '@/types';
import { Button } from '@/components/design-system';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
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

  const statusBadgeStyles: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-blue-100 text-blue-700',
    pending: 'bg-orange-100 text-orange-700',
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
        onClick={handleDetails}
        className={isSelected ? 'ring-2 ring-primary' : ''}
      >
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {showSelection && (
                <div onClick={handleSelectionClick}>
                  <Checkbox checked={isSelected} />
                </div>
              )}
              <span className="font-mono text-sm font-semibold">
                {pallet.codigo}
              </span>
              <Badge
                className={
                  statusBadgeStyles[pallet.estado?.toLowerCase()] || 'bg-muted'
                }
              >
                {translateStatus(pallet.estado)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarIcon size={12} />
              {formattedDate}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin size={12} />
            {pallet.ubicacion || 'Sin ubicación'}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package size={16} className="text-primary" />
                Cajas
              </div>
              <div className="text-lg font-semibold">
                {typeof pallet.maxBoxes === 'number' &&
                !Number.isNaN(pallet.maxBoxes)
                  ? `${realBoxCount}/${pallet.maxBoxes}`
                  : realBoxCount}
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers size={16} className="text-purple-500" />
                Calibre
              </div>
              <div className="text-lg font-semibold">{calibre || 'N/A'}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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
        </CardContent>
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

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !open && !isDeleting && setShowDeleteConfirm(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el pallet{' '}
              <strong>{pallet.codigo}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PalletCard;
