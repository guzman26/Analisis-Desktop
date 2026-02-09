import { useEffect, useMemo, useState } from 'react';

import { boxesApi, palletsApi } from '@/modules/inventory';
import { Box, Pallet, PalletAuditResult } from '@/types';
import { getPalletBoxCount, getPalletBoxes } from '@/utils/palletHelpers';
import {
  mapAuditErrorToPalletAuditResult,
  mapAuditResponseToPalletAuditResult,
} from '@/utils/palletAuditMapper';

interface MoveFeedback {
  type: 'success' | 'error';
  message: string;
}

interface UsePalletDetailControllerProps {
  pallet: Pallet | null;
  isOpen: boolean;
  onClosePallet?: (codigo: string) => void;
}

export function usePalletDetailController({
  pallet,
  isOpen,
  onClosePallet,
}: UsePalletDetailControllerProps) {
  const [boxCodes, setBoxCodes] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBoxCodes, setSelectedBoxCodes] = useState<Set<string>>(
    new Set()
  );
  const [isMovingBoxes, setIsMovingBoxes] = useState(false);
  const [moveFeedback, setMoveFeedback] = useState<MoveFeedback | null>(null);
  const [showSelectTargetModal, setShowSelectTargetModal] = useState(false);

  const [showBoxDetailModal, setShowBoxDetailModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditResult, setAuditResult] = useState<PalletAuditResult | null>(
    null
  );
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    if (!isOpen || !pallet) {
      setBoxCodes([]);
      setSelectionMode(false);
      setSelectedBoxCodes(new Set());
      setMoveFeedback(null);
      setShowSelectTargetModal(false);
      setShowBoxDetailModal(false);
      setSelectedBox(null);
      setShowAuditModal(false);
      setAuditResult(null);
      setIsAuditing(false);
      setIsMovingBoxes(false);
      return;
    }

    setBoxCodes(getPalletBoxes(pallet));
    setSelectionMode(false);
    setSelectedBoxCodes(new Set());
    setMoveFeedback(null);
    setShowSelectTargetModal(false);
  }, [isOpen, pallet?.codigo]);

  const realBoxCount = useMemo(() => {
    if (!pallet) return 0;
    if (boxCodes.length > 0) return boxCodes.length;
    return getPalletBoxCount(pallet);
  }, [boxCodes, pallet]);

  const boxesSummary = useMemo(() => {
    if (!pallet) return '0';
    if (typeof pallet.maxBoxes === 'number' && !Number.isNaN(pallet.maxBoxes)) {
      return `${realBoxCount}/${pallet.maxBoxes}`;
    }
    return String(realBoxCount);
  }, [pallet, realBoxCount]);

  const moveLocations = useMemo(() => {
    if (!pallet) return [];
    return ['TRANSITO', 'BODEGA', 'VENTA'].filter(
      (location) => location !== pallet.ubicacion
    );
  }, [pallet]);

  const toggleBoxSelection = (codigo: string) => {
    setSelectedBoxCodes((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) {
        next.delete(codigo);
      } else {
        next.add(codigo);
      }
      return next;
    });
  };

  const handleBoxClick = async (codigo: string) => {
    if (selectionMode) {
      toggleBoxSelection(codigo);
      return;
    }

    try {
      const boxData = await boxesApi.getByCode(codigo);
      if (!boxData) return;
      setSelectedBox(boxData);
      setShowBoxDetailModal(true);
    } catch (error) {
      console.error('Error fetching box details:', error);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedBoxCodes(new Set());
      }
      return next;
    });
    setMoveFeedback(null);
  };

  const toggleSelectAll = () => {
    if (selectedBoxCodes.size === boxCodes.length) {
      setSelectedBoxCodes(new Set());
      return;
    }

    setSelectedBoxCodes(new Set(boxCodes));
  };

  const handleConfirmTargetPallet = async (targetPalletCode: string) => {
    if (!targetPalletCode || selectedBoxCodes.size === 0) return;

    setShowSelectTargetModal(false);
    setIsMovingBoxes(true);
    setMoveFeedback(null);

    const selectedCodes = Array.from(selectedBoxCodes);

    try {
      if (selectedCodes.length > 1) {
        await palletsApi.moveMultipleBoxesBetweenPallets(
          selectedCodes,
          targetPalletCode
        );
      } else {
        await palletsApi.moveBoxBetweenPallets(selectedCodes[0], targetPalletCode);
      }

      setBoxCodes((prev) => prev.filter((code) => !selectedCodes.includes(code)));
      setSelectedBoxCodes(new Set());
      setSelectionMode(false);
      setMoveFeedback({
        type: 'success',
        message:
          selectedCodes.length > 1
            ? `✓ Se movieron ${selectedCodes.length} caja(s) correctamente al pallet ${targetPalletCode}.`
            : `✓ Se movio 1 caja correctamente al pallet ${targetPalletCode}.`,
      });
    } catch (error: unknown) {
      let errorMessage = 'Error al mover cajas';

      if (
        typeof error === 'object' &&
        error !== null &&
        'error' in error &&
        typeof (error as { error?: { message?: unknown } }).error?.message ===
          'string'
      ) {
        errorMessage = (error as { error: { message: string } }).error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        errorMessage = (error as { message: string }).message;
      }

      console.error('Error al mover cajas entre pallets:', error);
      setMoveFeedback({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsMovingBoxes(false);
    }
  };

  const startAuditBeforeClose = async () => {
    if (!pallet) return;

    setShowAuditModal(true);
    setIsAuditing(true);
    setAuditResult(null);

    try {
      const rawAudit = await palletsApi.audit(pallet.codigo);
      setAuditResult(mapAuditResponseToPalletAuditResult(rawAudit));
    } catch (error) {
      console.error('Error durante la auditoria:', error);
      setAuditResult(mapAuditErrorToPalletAuditResult(error, pallet.codigo));
    } finally {
      setIsAuditing(false);
    }
  };

  const confirmCloseAfterAudit = () => {
    if (!pallet) return;
    setShowAuditModal(false);
    setAuditResult(null);
    onClosePallet?.(pallet.codigo);
  };

  const cancelAudit = () => {
    setShowAuditModal(false);
    setAuditResult(null);
    setIsAuditing(false);
  };

  return {
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
  };
}
