import { useEffect, useState } from 'react';
import { usePalletServerState } from '@/modules/inventory';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import PalletLooseEggsModal from '@/components/PalletLooseEggsModal';
import { Button, Input, LoadingOverlay } from '@/components/design-system';
import { Search, Plus, Filter, Lock, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PalletCard from '@/components/PalletCard';
import { useNotifications } from '@/components/Notification/Notification';
import {
  EmptyStateV2,
  MetricCardV2,
  PageHeaderV2,
  SectionCardV2,
} from '@/components/app-v2';

const OpenPallets = () => {
  const {
    openPallets: activePalletsPaginated,
    fetchActivePallets,
    closePallet,
    movePallet,
    deletePallet,
    closeAllOpenPallets,
    loading,
  } = usePalletServerState();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  // Create refresh function
  const refresh = () => {
    void fetchActivePallets();
  };
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLooseEggsModalOpen, setIsLooseEggsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPallets, setFilteredPallets] = useState(
    activePalletsPaginated
  );
  const [isClosingAll, setIsClosingAll] = useState(false);
  // Estado para selección múltiple
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPalletCodes, setSelectedPalletCodes] = useState<Set<string>>(
    new Set()
  );
  const [isClosingSelected, setIsClosingSelected] = useState(false);

  // No mount fetch needed — usePalletServerState auto-fetches open pallets for packing routes

  // Keep local state in sync when the paginated pallets change
  useEffect(() => {
    const sorted = [...activePalletsPaginated].sort((a, b) => {
      const dateA = new Date(a.fechaCreacion).getTime();
      const dateB = new Date(b.fechaCreacion).getTime();
      return dateB - dateA; // Newest first (descending)
    });
    setFilteredPallets(sorted);
  }, [activePalletsPaginated]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = activePalletsPaginated.filter((pallet) =>
      pallet.codigo.toLowerCase().includes(value.toLowerCase())
    );
    // Sort filtered pallets by fechaCreacion (newest first)
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.fechaCreacion).getTime();
      const dateB = new Date(b.fechaCreacion).getTime();
      return dateB - dateA; // Newest first (descending)
    });
    setFilteredPallets(sorted);
  };

  const handleCloseAllPallets = async () => {
    const confirmed = window.confirm(
      `¿Estás seguro que deseas cerrar TODOS los pallets abiertos en PACKING?\n\n` +
        `Total de pallets a cerrar: ${filteredPallets.length}\n\n` +
        `Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setIsClosingAll(true);
    try {
      const result = await closeAllOpenPallets('PACKING');

      showSuccess(
        `Se cerraron exitosamente ${result.closedPallets} pallets en ${result.executionTime}s`
      );

      // Refresh the list
      refresh();
    } catch (error: any) {
      showError(error.message || 'Error al cerrar los pallets');
    } finally {
      setIsClosingAll(false);
    }
  };

  // Handlers para selección múltiple
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      // Limpiar selección al salir del modo
      setSelectedPalletCodes(new Set());
    }
  };

  const handleSelectionChange = (codigo: string, selected: boolean) => {
    setSelectedPalletCodes((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(codigo);
      } else {
        newSet.delete(codigo);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPalletCodes.size === filteredPallets.length) {
      // Deseleccionar todos
      setSelectedPalletCodes(new Set());
    } else {
      // Seleccionar todos
      setSelectedPalletCodes(new Set(filteredPallets.map((p) => p.codigo)));
    }
  };

  const handleCloseSelectedPallets = async () => {
    if (selectedPalletCodes.size === 0) return;

    const confirmed = window.confirm(
      `¿Estás seguro que deseas cerrar los ${selectedPalletCodes.size} pallets seleccionados?\n\n` +
        `Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setIsClosingSelected(true);
    let closedCount = 0;
    let errorCount = 0;

    try {
      // Cerrar pallets uno por uno
      for (const codigo of selectedPalletCodes) {
        try {
          await closePallet(codigo);
          closedCount++;
        } catch (error) {
          console.error(`Error al cerrar pallet ${codigo}:`, error);
          errorCount++;
        }
      }

      if (closedCount > 0) {
        showSuccess(`Se cerraron exitosamente ${closedCount} pallet(s)`);
      }
      if (errorCount > 0) {
        showError(`No se pudieron cerrar ${errorCount} pallet(s)`);
      }

      // Limpiar selección y refrescar
      setSelectedPalletCodes(new Set());
      setIsSelectionMode(false);
      refresh();
    } catch (error: any) {
      showError(error.message || 'Error al cerrar los pallets seleccionados');
    } finally {
      setIsClosingSelected(false);
    }
  };

  return (
    <div className="v2-page animate-fade-in">
      <LoadingOverlay show={loading} text="Cargando pallets…" />
      <PageHeaderV2
        title="Pallets Abiertos"
        description="Gestiona los pallets actualmente abiertos en el sistema."
        actions={
          <>
            <Button
              leftIcon={
                isSelectionMode ? (
                  <Square style={{ width: '16px', height: '16px' }} />
                ) : (
                  <CheckSquare style={{ width: '16px', height: '16px' }} />
                )
              }
              variant={isSelectionMode ? 'primary' : 'secondary'}
              size="medium"
              onClick={handleToggleSelectionMode}
              disabled={filteredPallets.length === 0}
            >
              {isSelectionMode ? 'Cancelar Selección' : 'Seleccionar'}
            </Button>

            {isSelectionMode && (
              <>
                <Button
                  leftIcon={
                    <CheckSquare style={{ width: '16px', height: '16px' }} />
                  }
                  variant="secondary"
                  size="medium"
                  onClick={handleSelectAll}
                  disabled={filteredPallets.length === 0}
                >
                  {selectedPalletCodes.size === filteredPallets.length
                    ? 'Deseleccionar Todos'
                    : 'Seleccionar Todos'}
                </Button>
                <Button
                  leftIcon={<Lock style={{ width: '16px', height: '16px' }} />}
                  variant="danger"
                  size="medium"
                  onClick={handleCloseSelectedPallets}
                  disabled={isClosingSelected || selectedPalletCodes.size === 0}
                >
                  {isClosingSelected
                    ? 'Cerrando...'
                    : `Cerrar Seleccionados (${selectedPalletCodes.size})`}
                </Button>
              </>
            )}

            {!isSelectionMode && (
              <>
                <Button
                  leftIcon={<Lock style={{ width: '16px', height: '16px' }} />}
                  variant="danger"
                  size="medium"
                  onClick={handleCloseAllPallets}
                  disabled={isClosingAll || filteredPallets.length === 0}
                >
                  {isClosingAll ? 'Cerrando...' : 'Cerrar Todos'}
                </Button>
                <Button
                  leftIcon={
                    <Filter style={{ width: '16px', height: '16px' }} />
                  }
                  variant="secondary"
                  size="medium"
                >
                  Filtrar
                </Button>
                <Button
                  leftIcon={<Plus style={{ width: '16px', height: '16px' }} />}
                  variant="primary"
                  size="medium"
                  onClick={() => navigate('/packing/createPallet')}
                >
                  Crear Pallet
                </Button>
                <Button
                  leftIcon={<Plus style={{ width: '16px', height: '16px' }} />}
                  variant="secondary"
                  size="medium"
                  onClick={() => setIsLooseEggsModalOpen(true)}
                >
                  Nuevo Pallet (Huevo suelto)
                </Button>
              </>
            )}
          </>
        }
      />

      <SectionCardV2 className="py-3">
        <Input
          placeholder="Buscar por nombre o ID..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          leftIcon={<Search style={{ width: '16px', height: '16px' }} />}
          className="max-w-md"
        />
      </SectionCardV2>

      <div className="v2-grid-stats">
        <MetricCardV2 label="Total pallets" value={filteredPallets.length} />
        <MetricCardV2
          label="Total cajas"
          value={filteredPallets.reduce(
            (sum, pallet) => sum + (pallet.cantidadCajas ?? 0),
            0
          )}
        />
        <MetricCardV2
          label="Promedio por pallet"
          value={
            filteredPallets.length > 0
              ? Math.round(
                  filteredPallets.reduce(
                    (sum, pallet) => sum + (pallet.cantidadCajas ?? 0),
                    0
                  ) / filteredPallets.length
                )
              : 0
          }
        />
      </div>

      <SectionCardV2 title="Lista de pallets">
        {filteredPallets.length === 0 ? (
          <EmptyStateV2
            title="No se encontraron pallets abiertos"
            description="Crea un pallet nuevo o ajusta los filtros para continuar."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredPallets.map((pallet) => (
              <PalletCard
                key={pallet.codigo}
                pallet={pallet}
                setSelectedPallet={setSelectedPallet}
                setIsModalOpen={setIsModalOpen}
                closePallet={async (codigo) => {
                  try {
                    await closePallet(codigo);
                    refresh();
                  } catch (error) {
                    console.error('Error al cerrar pallet:', error);
                  }
                }}
                fetchActivePallets={refresh}
                onDelete={async (codigo) => {
                  try {
                    await deletePallet(codigo);
                    refresh();
                  } catch (error) {
                    console.error('Error al eliminar pallet:', error);
                  }
                }}
                showSelection={isSelectionMode}
                isSelected={selectedPalletCodes.has(pallet.codigo)}
                onSelectionChange={handleSelectionChange}
              />
            ))}
          </div>
        )}
      </SectionCardV2>

      <PalletDetailModal
        pallet={selectedPallet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPallet(null);
        }}
        onClosePallet={async (codigo) => {
          try {
            await closePallet(codigo);
            setIsModalOpen(false);
            setSelectedPallet(null);
            refresh();
          } catch (error) {
            console.error('Error al cerrar pallet:', error);
          }
        }}
        onMovePallet={async (codigo, location) => {
          try {
            await movePallet(
              codigo,
              location as 'TRANSITO' | 'BODEGA' | 'VENTA'
            );
            // Cerrar el modal después del movimiento exitoso
            setIsModalOpen(false);
            setSelectedPallet(null);
            // Refrescar la lista de pallets
            refresh();
            // TODO: Mostrar mensaje de éxito
            console.log(`Pallet ${codigo} movido exitosamente a ${location}`);
          } catch (error) {
            console.error('Error al mover pallet:', error);
            // TODO: Mostrar mensaje de error
          }
        }}
      />

      <PalletLooseEggsModal
        isOpen={isLooseEggsModalOpen}
        onClose={() => setIsLooseEggsModalOpen(false)}
        defaultLocation={'PACKING'}
      />
    </div>
  );
};

export default OpenPallets;
