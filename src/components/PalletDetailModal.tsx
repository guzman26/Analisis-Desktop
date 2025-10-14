import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Pallet, PalletAuditResult } from '@/types';
import {
  formatCalibreName,
  getCalibreFromCodigo,
  getTurnoNombre,
  getEmpresaNombre,
  getOperarioFromCodigo,
  getContadorFromCodigo,
} from '@/utils/getParamsFromCodigo';
import {
  getBoxByCode,
  auditPallet,
  moveBoxBetweenPallets,
} from '@/api/endpoints';
import { extractDataFromResponse } from '@/utils/extractDataFromResponse';
import { getPalletBoxes } from '@/utils/palletHelpers';
import BoxDetailModal from './BoxDetailModal';
import PalletAuditModal from './PalletAuditModal';
import { formatDate } from '@/utils/formatDate';
import { Modal, Button, Card } from './design-system';
import SelectTargetPalletModal from './SelectTargetPalletModal';
import {
  CheckCircle,
  Calendar,
  Package,
  Layers,
  MapPin,
  MoveRight,
  PackageX,
  Hash,
  Printer,
  Building2,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';

interface PalletDetailModalProps {
  pallet: Pallet | null;
  isOpen: boolean;
  onClose: () => void;
  onClosePallet?: (codigo: string) => void;
  onMovePallet?: (codigo: string, location: string) => void;
}

const PalletDetailModal = ({
  pallet,
  isOpen,
  onClose,
  onClosePallet,
  onMovePallet,
}: PalletDetailModalProps) => {
  const navigate = useNavigate();
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [showBoxDetailModal, setShowBoxDetailModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBoxCodes, setSelectedBoxCodes] = useState<Set<string>>(
    new Set()
  );
  const [isMovingBoxes, setIsMovingBoxes] = useState(false);
  const [moveFeedback, setMoveFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showSelectTargetModal, setShowSelectTargetModal] = useState(false);

  // Estados para auditoría
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditResult, setAuditResult] = useState<PalletAuditResult | null>(
    null
  );
  const [isAuditing, setIsAuditing] = useState(false);

  const calibre = getCalibreFromCodigo(pallet?.codigo || '');

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pallet) return null;

  const moveLocations = ['TRANSITO', 'BODEGA', 'VENTA'].filter(
    (loc) => loc !== pallet.ubicacion
  );

  const handleBoxClick = async (codigo: string) => {
    if (selectionMode) {
      setSelectedBoxCodes((prev) => {
        const next = new Set(prev);
        if (next.has(codigo)) next.delete(codigo);
        else next.add(codigo);
        return next;
      });
      return;
    }
    try {
      const response = await getBoxByCode(codigo);
      const boxData = await extractDataFromResponse(response);
      if (boxData && boxData.length > 0) {
        setSelectedBox(boxData[0]);
        setShowBoxDetailModal(true);
      } else {
        console.warn('No box data found for codigo:', codigo);
      }
    } catch (error) {
      console.error('Error fetching box details:', error);
    }
  };

  const toggleSelectAll = () => {
    if (!pallet) return;
    const boxes = getPalletBoxes(pallet);
    if (selectedBoxCodes.size === boxes.length) {
      setSelectedBoxCodes(new Set());
    } else {
      setSelectedBoxCodes(new Set(boxes));
    }
  };

  const handleConfirmTargetPallet = async (targetPalletCode: string) => {
    if (!pallet) return;
    if (!targetPalletCode || selectedBoxCodes.size === 0) return;

    setShowSelectTargetModal(false);
    setIsMovingBoxes(true);
    setMoveFeedback(null);

    try {
      const codes = Array.from(selectedBoxCodes);
      const results = await Promise.allSettled(
        codes.map((code) => moveBoxBetweenPallets(code, targetPalletCode))
      );
      const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
      const rejected = results.length - fulfilled;

      // Optimistic local update: remover cajas movidas de la lista visible
      if (fulfilled > 0) {
        const boxes = getPalletBoxes(pallet);
        const filteredBoxes = boxes.filter(
          (c: string) => !selectedBoxCodes.has(c)
        );
        if (pallet.boxes) {
          (pallet as any).boxes = filteredBoxes;
        }
        if (pallet.cajas) {
          (pallet as any).cajas = filteredBoxes;
        }
        setSelectedBoxCodes(new Set());
        setSelectionMode(false);
      }

      if (rejected === 0) {
        setMoveFeedback({
          type: 'success',
          message: `✓ Se movieron ${fulfilled} caja(s) correctamente al pallet ${targetPalletCode}.`,
        });
      } else if (fulfilled > 0) {
        setMoveFeedback({
          type: 'error',
          message: `Se movieron ${fulfilled} caja(s), pero ${rejected} fallaron. Intente nuevamente con las restantes.`,
        });
      } else {
        setMoveFeedback({
          type: 'error',
          message:
            'No se pudo mover ninguna caja. Verifique que el pallet destino esté disponible e intente nuevamente.',
        });
      }
    } catch (error) {
      setMoveFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Error al mover cajas',
      });
    } finally {
      setIsMovingBoxes(false);
    }
  };

  // Función para iniciar auditoría antes de cerrar pallet
  const handleClosePalletWithAudit = async () => {
    if (!pallet) return;

    setIsAuditing(true);
    setShowAuditModal(true);

    try {
      const auditData = await auditPallet(pallet.codigo);
      setAuditResult(auditData);
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
    if (!pallet) return;

    setShowAuditModal(false);
    setAuditResult(null);
    onClosePallet?.(pallet.codigo);
  };

  // Función para cancelar el cierre
  const handleCancelAudit = () => {
    setShowAuditModal(false);
    setAuditResult(null);
    setIsAuditing(false);
  };

  // Format date for display
  const formattedDate = pallet.fechaCreacion
    ? formatDate(pallet.fechaCreacion)
    : 'N/A';

  // === Visual helpers ===
  const locationColors = {
    packing: 'bg-blue-100 text-blue-700 border-blue-200',
    bodega: 'bg-green-100 text-green-700 border-green-200',
    venta: 'bg-purple-100 text-purple-700 border-purple-200',
    transito: 'bg-orange-100 text-orange-700 border-orange-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  } as const;

  const statusColors = {
    open: 'bg-green-100 text-green-700 border-green-200',
    closed: 'bg-blue-100 text-blue-700 border-blue-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  } as const;

  // Reusable row (mirrors BoxDetailModal)
  const InfoRow = ({
    icon,
    label,
    value,
    className,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={clsx(
        'flex items-start gap-3 p-3 rounded-macos-sm hover:bg-gray-50 transition-colors',
        className
      )}
    >
      <div className="text-macos-text-secondary mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-macos-text-secondary">{label}</p>
        <p className="text-base font-medium text-macos-text">{value}</p>
      </div>
    </div>
  );

  const locationColor =
    locationColors[
      pallet.ubicacion.toLowerCase() as keyof typeof locationColors
    ] || locationColors.default;

  const statusColor =
    statusColors[pallet.estado as keyof typeof statusColors] ||
    statusColors.default;

  // Mostrar resumen de cajas como cantidad/capacidad (ej: 2/60)
  const boxesSummary =
    typeof pallet.maxBoxes === 'number' && !Number.isNaN(pallet.maxBoxes)
      ? `${pallet.cantidadCajas}/${pallet.maxBoxes}`
      : String(pallet.cantidadCajas);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Detalles de Pallet ${pallet.codigo}`}
        size="large"
        showTrafficLights={true}
      >
        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <span
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-macos-sm border inline-flex items-center gap-2',
                  locationColor
                )}
              >
                <MapPin className="w-4 h-4" />
                {pallet.ubicacion}
              </span>
              <span
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-macos-sm border',
                  statusColor
                )}
              >
                {pallet.estado === 'open' ? 'Abierto' : 'Cerrado'}
              </span>
            </div>
            <span className="text-sm text-macos-text-secondary">
              Cajas:{' '}
              <span className="font-medium text-macos-accent">
                {boxesSummary}
              </span>
            </span>
          </div>

          {/* Main Information */}
          <Card variant="flat" padding="none">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-macos-border">
              <div className="space-y-1">
                <InfoRow
                  icon={<Package className="w-5 h-5" />}
                  label="Calibre"
                  value={formatCalibreName(calibre)}
                />
                <InfoRow
                  icon={<Hash className="w-5 h-5" />}
                  label="Código Base"
                  value={pallet.baseCode || 'N/A'}
                />
                <InfoRow
                  icon={<Calendar className="w-5 h-5" />}
                  label="Fecha de Creación"
                  value={formattedDate}
                />
              </div>
              <div className="space-y-1">
                <InfoRow
                  icon={<Layers className="w-5 h-5" />}
                  label="Total de Cajas"
                  value={pallet.cantidadCajas}
                />
                <InfoRow
                  icon={<Package className="w-5 h-5" />}
                  label="Capacidad (maxBoxes)"
                  value={pallet.maxBoxes ?? 'N/A'}
                />
                <InfoRow
                  icon={<Hash className="w-5 h-5" />}
                  label="Estado"
                  value={pallet.estado === 'open' ? 'Abierto' : 'Cerrado'}
                />
                <InfoRow
                  icon={<Building2 className="w-5 h-5" />}
                  label="Empresa"
                  value={
                    pallet.baseCode
                      ? getEmpresaNombre(pallet.baseCode)
                      : 'N/A'
                  }
                />
                <InfoRow
                  icon={<Clock className="w-5 h-5" />}
                  label="Turno"
                  value={
                    pallet.baseCode ? getTurnoNombre(pallet.baseCode) : 'N/A'
                  }
                />
              </div>
            </div>
          </Card>

          {/* Boxes */}
          <Card variant="flat">
            <h3 className="text-sm font-medium text-macos-text mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Historial reciente
              <span className="ml-2 px-2 py-0.5 rounded-macos-sm bg-gray-200 text-xs text-macos-text-secondary">
                {getPalletBoxes(pallet).length}
              </span>
            </h3>
            {getPalletBoxes(pallet).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-macos-text-tertiary">
                <PackageX className="w-8 h-8 mb-3 opacity-60" />
                No hay cajas registradas en este pallet
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                {getPalletBoxes(pallet).map((caja, index) => (
                  <div
                    key={index}
                    className="group relative bg-white border border-macos-border rounded-macos-sm hover:border-macos-accent hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                    onClick={() => handleBoxClick(caja)}
                  >
                    {selectionMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedBoxCodes.has(caja)}
                          onChange={() => handleBoxClick(caja)}
                          className="w-4 h-4 accent-macos-accent"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                    {/* Status indicator */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-macos-accent to-macos-accent/70" />

                    {/* Content */}
                    <div className="p-3">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-macos-accent" />
                          <span className="text-xs text-macos-text-secondary font-medium">
                            Caja #{index + 1}
                          </span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-macos-success" />
                      </div>

                      {/* Code */}
                      <div className="mb-3">
                        <p className="text-xs text-macos-text-secondary mb-1">
                          Código
                        </p>
                        <p className="text-sm font-mono font-medium text-macos-text break-all">
                          {caja}
                        </p>
                      </div>

                      {/* Parsed badges: Operario, Calibre, Contador */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-macos-sm bg-gray-100 text-xs text-macos-text-secondary border border-macos-border">
                          Op: {getOperarioFromCodigo(caja)}
                        </span>
                        <span className="px-2 py-0.5 rounded-macos-sm bg-gray-100 text-xs text-macos-text-secondary border border-macos-border">
                          Cal: {formatCalibreName(getCalibreFromCodigo(caja))}
                        </span>
                        <span className="px-2 py-0.5 rounded-macos-sm bg-gray-100 text-xs text-macos-text-secondary border border-macos-border">
                          N°{getContadorFromCodigo(caja)}
                        </span>
                      </div>

                      {/* Calibre info (extracted from code) */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-macos-text-secondary mb-1">
                            Calibre
                          </p>
                          <p className="text-sm font-medium text-macos-text">
                            {formatCalibreName(getCalibreFromCodigo(caja))}
                          </p>
                        </div>
                        <div className="text-macos-text-secondary group-hover:text-macos-accent transition-colors">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-macos-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-macos-border">
            <Button
              variant="secondary"
              size="medium"
              leftIcon={<Printer size={16} />}
              onClick={() => navigate(`/pallet/label/${pallet.codigo}`)}
            >
              Generar Etiqueta
            </Button>
            {pallet.estado === 'open' && (
              <>
                <Button
                  variant={selectionMode ? 'primary' : 'secondary'}
                  size="medium"
                  leftIcon={<MoveRight size={16} />}
                  onClick={() => {
                    setSelectionMode((prev) => !prev);
                    setMoveFeedback(null);
                    setSelectedBoxCodes(new Set());
                  }}
                >
                  {selectionMode ? 'Cancelar mover' : 'Mover Cajas'}
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  leftIcon={<CheckCircle size={16} />}
                  onClick={handleClosePalletWithAudit}
                >
                  Cerrar Pallet
                </Button>
              </>
            )}
            {pallet.estado === 'closed' && (
              <div className="relative">
                <Button
                  variant="secondary"
                  size="medium"
                  leftIcon={<MoveRight size={16} />}
                  onClick={() => setShowMoveOptions(!showMoveOptions)}
                >
                  Mover Pallet {showMoveOptions ? '▲' : '▼'}
                </Button>
                {showMoveOptions && (
                  <div className="absolute left-0 mt-1 w-full rounded-macos-sm bg-white shadow-lg z-10">
                    {moveLocations.map((location) => (
                      <button
                        key={location}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                        onClick={() => {
                          onMovePallet?.(pallet.codigo, location);
                          setShowMoveOptions(false);
                        }}
                      >
                        <MapPin size={14} />
                        Mover a {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Move Boxes Toolbar */}
          {selectionMode && (
            <Card variant="flat">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 text-sm rounded-macos-sm border border-macos-border hover:border-macos-accent transition-colors"
                      onClick={toggleSelectAll}
                    >
                      {selectedBoxCodes.size === getPalletBoxes(pallet).length
                        ? 'Deseleccionar todo'
                        : 'Seleccionar todo'}
                    </button>
                    <span className="text-sm text-macos-text-secondary">
                      {selectedBoxCodes.size} seleccionada(s)
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="medium"
                  leftIcon={<MoveRight size={16} />}
                  disabled={isMovingBoxes || selectedBoxCodes.size === 0}
                  onClick={() => setShowSelectTargetModal(true)}
                >
                  {isMovingBoxes ? 'Moviendo...' : 'Mover seleccionadas'}
                </Button>

                {moveFeedback && (
                  <div
                    className={`p-3 rounded-macos-sm border ${
                      moveFeedback.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {moveFeedback.message}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Box Detail Modal */}
          <BoxDetailModal
            isOpen={showBoxDetailModal}
            onClose={() => setShowBoxDetailModal(false)}
            box={selectedBox}
          />

          {/* Audit Modal */}
          <PalletAuditModal
            isOpen={showAuditModal}
            onClose={handleCancelAudit}
            auditResult={auditResult}
            onConfirmClose={handleConfirmClose}
            isLoading={isAuditing}
            palletCode={pallet.codigo}
          />
        </div>
      </Modal>
      <SelectTargetPalletModal
        isOpen={showSelectTargetModal}
        onClose={() => setShowSelectTargetModal(false)}
        excludePalletCode={pallet.codigo}
        onConfirm={handleConfirmTargetPallet}
      />
    </>
  );
};

export default PalletDetailModal;
