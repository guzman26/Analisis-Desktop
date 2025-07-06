import { useEffect, useState } from 'react';
import { useFilteredPallets, usePalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import PalletCard from '@/components/PalletCard';
import { Card, Button, Input } from '@/components/design-system';
import { Search, Plus, Filter, MoreVertical } from 'lucide-react';
import '../../styles/designSystem.css';
import { closePallet, movePallet } from '@/api/endpoints';

const OpenPallets = () => {
  const [, palletAPI] = usePalletContext();
  const {
    pallets: activePalletsPaginated,

    loading,
    error,
  } = useFilteredPallets();

  // Create refresh function
  const refresh = () => {
    palletAPI.fetchPallets(1, 'active');
  };
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPallets, setFilteredPallets] = useState(activePalletsPaginated);

  useEffect(() => {
    refresh();
  }, []);

  const handleRefresh = () => {
    refresh();
  };

  const handleCloseAction = async (codigo: string) => {
    await closePallet(codigo);
    refresh(); // Refresh paginated data instead of fetchActivePallets
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = activePalletsPaginated.filter(pallet =>
      pallet.codigo.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPallets(filtered);
  };

  return (
    <div className="macos-animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 'var(--macos-space-7)' }}>
        <div className="macos-hstack" style={{ justifyContent: 'space-between', marginBottom: 'var(--macos-space-3)' }}>
          <h1 className="macos-text-large-title" style={{ color: 'var(--macos-text-primary)' }}>
            Pallets Abiertos
          </h1>
          <div className="macos-hstack">
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
            >
              Nuevo Pallet
            </Button>
          </div>
        </div>
        <p className="macos-text-body" style={{ color: 'var(--macos-text-secondary)' }}>
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
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--macos-space-5)',
        marginBottom: 'var(--macos-space-7)'
      }}>
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p className="macos-text-footnote" style={{ 
              color: 'var(--macos-text-secondary)',
              marginBottom: 'var(--macos-space-1)'
            }}>
              Total Pallets
            </p>
            <p className="macos-text-title-1" style={{ 
              color: 'var(--macos-blue)',
              fontWeight: 700
            }}>
              {filteredPallets.length}
            </p>
          </div>
        </Card>
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p className="macos-text-footnote" style={{ 
              color: 'var(--macos-text-secondary)',
              marginBottom: 'var(--macos-space-1)'
            }}>
              Total Cajas
            </p>
                         <p className="macos-text-title-1" style={{ 
               color: 'var(--macos-green)',
               fontWeight: 700
             }}>
               {filteredPallets.reduce((sum, pallet) => sum + pallet.cantidadCajas, 0)}
             </p>
          </div>
        </Card>
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p className="macos-text-footnote" style={{ 
              color: 'var(--macos-text-secondary)',
              marginBottom: 'var(--macos-space-1)'
            }}>
              Promedio por Pallet
            </p>
                         <p className="macos-text-title-1" style={{ 
               color: 'var(--macos-orange)',
               fontWeight: 700
             }}>
               {filteredPallets.length > 0 ? Math.round(filteredPallets.reduce((sum, pallet) => sum + pallet.cantidadCajas, 0) / filteredPallets.length) : 0}
             </p>
          </div>
        </Card>
      </div>

      {/* Pallets List */}
      <Card>
        <h2 className="macos-text-title-2" style={{ 
          marginBottom: 'var(--macos-space-5)',
          color: 'var(--macos-text-primary)'
        }}>
          Lista de Pallets
        </h2>
        
        {filteredPallets.length === 0 ? (
          <div style={{ 
            textAlign: 'center',
            padding: 'var(--macos-space-8)',
            color: 'var(--macos-text-secondary)'
          }}>
            <p className="macos-text-body">No se encontraron pallets abiertos</p>
          </div>
        ) : (
          <div className="macos-stack">
            {filteredPallets.map((pallet) => (
              <Card 
                key={pallet.codigo} 
                variant="flat"
                isPressable
                isHoverable
                style={{ padding: 'var(--macos-space-5)' }}
              >
                <div className="macos-hstack" style={{ justifyContent: 'space-between' }}>
                  <div className="macos-stack">
                    <div>
                                             <h3 className="macos-text-headline" style={{ 
                         color: 'var(--macos-text-primary)',
                         marginBottom: 'var(--macos-space-1)'
                       }}>
                         {pallet.codigo}
                       </h3>
                      <p className="macos-text-caption-1" style={{ color: 'var(--macos-text-secondary)' }}>
                        ID: {pallet.codigo}
                      </p>
                    </div>
                    <div className="macos-hstack">
                                             <span className="macos-text-footnote" style={{ 
                         color: 'var(--macos-text-secondary)',
                         backgroundColor: 'var(--macos-gray-5)',
                         padding: 'var(--macos-space-1) var(--macos-space-2)',
                         borderRadius: 'var(--macos-radius-small)'
                       }}>
                         {pallet.cantidadCajas} cajas
                       </span>
                      <span className="macos-text-footnote" style={{ 
                        color: 'var(--macos-green)',
                        backgroundColor: 'rgba(52, 199, 89, 0.1)',
                        padding: 'var(--macos-space-1) var(--macos-space-2)',
                        borderRadius: 'var(--macos-radius-small)'
                      }}>
                        Abierto
                      </span>
                    </div>
                  </div>
                  <div className="macos-hstack">
                    <div style={{ textAlign: 'right' }}>
                      <p className="macos-text-footnote" style={{ 
                        color: 'var(--macos-text-secondary)',
                        marginBottom: 'var(--macos-space-1)'
                      }}>
                        Última actualización
                      </p>
                                             <p className="macos-text-caption-1" style={{ color: 'var(--macos-text-primary)' }}>
                         {pallet.fechaCreacion}
                       </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      leftIcon={<MoreVertical style={{ width: '16px', height: '16px' }} />}
                      aria-label="Opciones"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Load More Button - Removed for now as filtered pallets doesn't support pagination */}

      {/* Loading Indicator */}
      {loading && (
        <div className="open-pallets-loading">
          <p>Cargando pallets...</p>
        </div>
      )}

      <PalletDetailModal
        pallet={selectedPallet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPallet(null);
        }}
        onClosePallet={handleCloseAction}
        onAddBox={(codigo) => {
          console.log('Añadir caja a:', codigo);
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
    </div>
  );
};

export default OpenPallets;
