import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Pallet, PalletAuditResult } from '@/types';
import {
  formatCalibreName,
  getCalibreFromCodigo,
} from '@/utils/getParamsFromCodigo';
import { getBoxByCode, auditPallet } from '@/api/endpoints';
import { extractDataFromResponse } from '@/utils/extractDataFromResponse';
import BoxDetailModal from './BoxDetailModal';
import PalletAuditModal from './PalletAuditModal';
import { formatDate } from '@/utils/formatDate';
import { Modal, Button, Card } from './design-system';
import {
  CheckCircle,
  Calendar,
  Package,
  Layers,
  MapPin,
  Plus,
  MoveRight,
  PackageX,
  Hash,
  Printer,
} from 'lucide-react';
import { clsx } from 'clsx';

interface PalletDetailModalProps {
  pallet: Pallet | null;
  isOpen: boolean;
  onClose: () => void;
  onClosePallet?: (codigo: string) => void;
  onAddBox?: (codigo: string) => void;
  onMovePallet?: (codigo: string, location: string) => void;
}

const PalletDetailModal = ({
  pallet,
  isOpen,
  onClose,
  onClosePallet,
  onAddBox,
  onMovePallet,
}: PalletDetailModalProps) => {
  const navigate = useNavigate();
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [showBoxDetailModal, setShowBoxDetailModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);

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
    try {
      const response = await getBoxByCode(codigo);
      const boxData = extractDataFromResponse(response);
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

  // Función para iniciar auditoría antes de cerrar pallet
  const handleClosePalletWithAudit = async () => {
    if (!pallet) return;

    setIsAuditing(true);
    setShowAuditModal(true);

    try {
      const response = await auditPallet(pallet.codigo);
      const auditData = extractDataFromResponse(response);

      if (auditData && auditData.length > 0) {
        setAuditResult(auditData[0]);
      } else {
        // Manejar caso donde no hay datos de auditoría
        setAuditResult(null);
      }
    } catch (error) {
      console.error('Error durante la auditoría:', error);
      setAuditResult(null);
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

  return (
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
              {pallet.cantidadCajas}
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
                icon={<Hash className="w-5 h-5" />}
                label="Estado"
                value={pallet.estado === 'open' ? 'Abierto' : 'Cerrado'}
              />
            </div>
          </div>
        </Card>

        {/* Boxes */}
        <Card variant="flat">
          <h3 className="text-sm font-medium text-macos-text mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Cajas
            <span className="ml-2 px-2 py-0.5 rounded-macos-sm bg-gray-200 text-xs text-macos-text-secondary">
              {pallet.cajas.length}
            </span>
          </h3>
          {pallet.cajas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-macos-text-tertiary">
              <PackageX className="w-8 h-8 mb-3 opacity-60" />
              No hay cajas registradas en este pallet
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-72 overflow-y-auto">
              {pallet.cajas.map((caja, index) => (
                <button
                  key={index}
                  className="px-3 py-2 bg-white border border-macos-border rounded-macos-sm text-xs font-mono hover:border-macos-accent hover:shadow-sm transition"
                  onClick={() => handleBoxClick(caja)}
                >
                  {caja}
                </button>
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
                variant="secondary"
                size="medium"
                leftIcon={<Plus size={16} />}
                onClick={() => onAddBox?.(pallet.codigo)}
              >
                Añadir Caja
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

        {/* Box Detail Modal */}
        <BoxDetailModal
          box={selectedBox}
          isOpen={showBoxDetailModal}
          onClose={() => setShowBoxDetailModal(false)}
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
  );
};

export default PalletDetailModal;
