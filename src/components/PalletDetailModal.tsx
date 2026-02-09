import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/app-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pallet } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';

import BoxDetailModal from './BoxDetailModal';
import PalletAuditModal from './PalletAuditModal';
import SelectTargetPalletModal from './SelectTargetPalletModal';
import PalletActionsTab from './pallet-detail/PalletActionsTab';
import PalletBoxesTab from './pallet-detail/PalletBoxesTab';
import PalletDetailHeader from './pallet-detail/PalletDetailHeader';
import PalletFooterActions from './pallet-detail/PalletFooterActions';
import PalletOverviewTab from './pallet-detail/PalletOverviewTab';
import { usePalletDetailController } from './pallet-detail/usePalletDetailController';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'boxes' | 'actions'>(
    'overview'
  );

  const {
    boxCodes,
    realBoxCount,
    boxesSummary,
    moveLocations,

    selectionMode,
    selectedBoxCodes,
    isMovingBoxes,
    moveFeedback,
    showSelectTargetModal,

    showBoxDetailModal,
    selectedBox,

    showAuditModal,
    auditResult,
    isAuditing,

    setShowSelectTargetModal,
    setShowBoxDetailModal,

    handleBoxClick,
    toggleBoxSelection,
    toggleSelectionMode,
    toggleSelectAll,
    handleConfirmTargetPallet,
    startAuditBeforeClose,
    confirmCloseAfterAudit,
    cancelAudit,
  } = usePalletDetailController({
    pallet,
    isOpen,
    onClosePallet,
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen, pallet?.codigo]);

  if (!isOpen || !pallet) return null;

  const formattedDate = pallet.fechaCreacion
    ? formatDate(pallet.fechaCreacion)
    : 'N/A';
  const calibre = getCalibreFromCodigo(pallet.codigo);

  const handleToggleSelectionMode = () => {
    if (!selectionMode) {
      setActiveTab('boxes');
    }
    toggleSelectionMode();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          layer={60}
          className="flex h-[90vh] w-[95vw] max-w-5xl flex-col overflow-hidden bg-background p-0"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Detalles de Pallet {pallet.codigo}</DialogTitle>
          </DialogHeader>

          <PalletDetailHeader pallet={pallet} boxesSummary={boxesSummary} />

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'overview' | 'boxes' | 'actions')
            }
            className="flex min-h-0 flex-1 flex-col px-6 pt-4"
          >
            <TabsList className="w-full justify-start sm:w-auto">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="boxes">Cajas ({realBoxCount})</TabsTrigger>
              <TabsTrigger value="actions">Acciones</TabsTrigger>
            </TabsList>

            <div className="min-h-0 flex-1 overflow-hidden pb-4">
              <TabsContent
                value="overview"
                className="mt-3 h-full min-h-0 data-[state=inactive]:hidden"
              >
                <ScrollArea className="h-full pr-3">
                  <PalletOverviewTab
                    pallet={pallet}
                    formattedDate={formattedDate}
                    calibre={calibre}
                    realBoxCount={realBoxCount}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="boxes"
                className="mt-3 h-full min-h-0 data-[state=inactive]:hidden"
              >
                <ScrollArea className="h-full pr-3">
                  <PalletBoxesTab
                    boxCodes={boxCodes}
                    selectionMode={selectionMode}
                    selectedBoxCodes={selectedBoxCodes}
                    isMovingBoxes={isMovingBoxes}
                    moveFeedback={moveFeedback}
                    onBoxClick={handleBoxClick}
                    onToggleBoxSelection={toggleBoxSelection}
                    onToggleSelectAll={toggleSelectAll}
                    onOpenTargetModal={() => setShowSelectTargetModal(true)}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="actions"
                className="mt-3 h-full min-h-0 data-[state=inactive]:hidden"
              >
                <ScrollArea className="h-full pr-3">
                  <PalletActionsTab
                    pallet={pallet}
                    moveLocations={moveLocations}
                    onMovePallet={onMovePallet}
                  />
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>

          <PalletFooterActions
            pallet={pallet}
            selectionMode={selectionMode}
            moveLocations={moveLocations}
            onPrintLabel={() => navigate(`/pallet/label/${pallet.codigo}`)}
            onToggleSelectionMode={handleToggleSelectionMode}
            onStartAudit={startAuditBeforeClose}
            onMovePallet={onMovePallet}
          />
        </DialogContent>
      </Dialog>

      <BoxDetailModal
        isOpen={showBoxDetailModal}
        onClose={() => setShowBoxDetailModal(false)}
        box={selectedBox}
      />

      <PalletAuditModal
        isOpen={showAuditModal}
        onClose={cancelAudit}
        auditResult={auditResult}
        onConfirmClose={confirmCloseAfterAudit}
        isLoading={isAuditing}
        palletCode={pallet.codigo}
      />

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
