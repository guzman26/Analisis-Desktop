import { useEffect, useState } from 'react';
import { usePalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import PalletLooseEggsModal from '@/components/PalletLooseEggsModal';
import {
  Card,
  Button,
  Input,
  LoadingOverlay,
} from '@/components/design-system';
import { Search, Plus, Filter, Lock, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/designSystem.css';
import {
  closePallet,
  movePallet,
  deletePallet,
  closeAllOpenPallets,
} from '@/api/endpoints';
import PalletCard from '@/components/PalletCard';
import { useNotifications } from '@/components/Notification/Notification';

const OpenPallets = () => {
  const {
    openPallets: activePalletsPaginated,
    fetchActivePallets,
    loading,
  } = usePalletContext();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  // Create refresh function
  const refresh = () => {
    fetchActivePallets();
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
  const [selectedPalletCodes, setSelectedPalletCodes] = useState<Set<string>>(new Set());
  const [isClosingSelected, setIsClosingSelected] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

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
    setSelectedPalletCodes(prev => {
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
      setSelectedPalletCodes(new Set(filteredPallets.map(p => p.codigo)));
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
    <div className="macos-animate-fade-in">
      <LoadingOverlay show={loading} text="Cargando pallets…" />
      {/* Header */}
      <div style={{ marginBottom: 'var(--macos-space-7)' }}>
        <div
          className="macos-hstack"
          style={{
            justifyContent: 'space-between',
            marginBottom: 'var(--macos-space-3)',
          }}
        >
          <h1
            className="macos-text-large-title"
            style={{ color: 'var(--macos-text-primary)' }}
          >
            Pallets Abiertos
          </h1>
          <div className="macos-hstack">
            {/* Botones de selección múltiple */}
            <Button
              leftIcon={isSelectionMode ? <Square style={{ width: '16px', height: '16px' }} /> : <CheckSquare style={{ width: '16px', height: '16px' }} />}
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
                  leftIcon={<CheckSquare style={{ width: '16px', height: '16px' }} />}
                  variant="secondary"
                  size="medium"
                  onClick={handleSelectAll}
                  disabled={filteredPallets.length === 0}
                >
                  {selectedPalletCodes.size === filteredPallets.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                </Button>
                <Button
                  leftIcon={<Lock style={{ width: '16px', height: '16px' }} />}
                  variant="danger"
                  size="medium"
                  onClick={handleCloseSelectedPallets}
                  disabled={isClosingSelected || selectedPalletCodes.size === 0}
                >
                  {isClosingSelected ? 'Cerrando...' : `Cerrar Seleccionados (${selectedPalletCodes.size})`}
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
                  leftIcon={<Filter style={{ width: '16px', height: '16px' }} />}
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
                  style={{ marginLeft: 'var(--macos-space-2)' }}
                >
                  Nuevo Pallet (Huevo suelto)
                </Button>
              </>
            )}
          </div>
        </div>
        <p
          className="macos-text-body"
          style={{ color: 'var(--macos-text-secondary)' }}
        >
          Gestiona los pallets actualmente abiertos en el sistema
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 'var(--macos-space-6)' }}>
        <Input
          placeholder="Buscar por nombre o ID..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          leftIcon={<Search style={{ width: '16px', height: '16px' }} />}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--macos-space-5)',
          marginBottom: 'var(--macos-space-7)',
        }}
      >
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
              }}
            >
              Total Pallets
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-blue)',
                fontWeight: 700,
              }}
            >
              {filteredPallets.length}
            </p>
          </div>
        </Card>
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
              }}
            >
              Total Cajas
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-green)',
                fontWeight: 700,
              }}
            >
              {filteredPallets.reduce(
                (sum, pallet) => sum + (pallet.cantidadCajas ?? 0),
                0
              )}
            </p>
          </div>
        </Card>
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
              }}
            >
              Promedio por Pallet
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-orange)',
                fontWeight: 700,
              }}
            >
              {filteredPallets.length > 0
                ? Math.round(
                    filteredPallets.reduce(
                      (sum, pallet) => sum + (pallet.cantidadCajas ?? 0),
                      0
                    ) / filteredPallets.length
                  )
                : 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Pallets List */}
      <Card>
        <h2
          className="macos-text-title-2"
          style={{
            marginBottom: 'var(--macos-space-5)',
            color: 'var(--macos-text-primary)',
          }}
        >
          Lista de Pallets
        </h2>

        {filteredPallets.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--macos-space-8)',
              color: 'var(--macos-text-secondary)',
            }}
          >
            <p className="macos-text-body">
              No se encontraron pallets abiertos
            </p>
          </div>
        ) : (
          <div className="macos-stack">
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
      </Card>

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
