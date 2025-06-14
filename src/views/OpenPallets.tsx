import { useContext, useEffect, useState } from 'react';
import { PalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import '../styles/OpenPallets.css';

const OpenPallets = () => {
  const { activePallets, fetchActivePallets } = useContext(PalletContext);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchActivePallets();
  }, [fetchActivePallets]);

  return (
    <div className="open-pallets">
      {/* Header */}
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Pallets Abiertos</h1>
        <div className="open-pallets-count">{activePallets.length} pallets</div>
      </div>

      {/* Empty State */}
      {activePallets.length === 0 ? (
        <div className="open-pallets-empty">
          <p>No hay pallets abiertos</p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {activePallets.map((pallet) => (
            <div key={pallet.codigo} className="pallet-card">
              {/* Card Header */}
              <div className="pallet-card-header">
                <span className="pallet-code">{pallet.codigo}</span>
                <span
                  className={`location-badge ${pallet.ubicacion.toLowerCase()}`}
                >
                  {pallet.ubicacion}
                </span>
              </div>

              {/* Card Info */}
              <div className="pallet-info">
                <div className="pallet-info-item">
                  <span className="pallet-info-label">Cajas:</span>
                  <span className="pallet-info-value">
                    {pallet.cantidadCajas}
                  </span>
                </div>

                <div className="pallet-info-item">
                  <span className="pallet-info-label">Calibre:</span>
                  <span className="pallet-info-value small">
                    {pallet.calibre}
                  </span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pallet-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedPallet(pallet);
                    setIsModalOpen(true);
                  }}
                >
                  Ver Detalles
                </button>
                <button
                  className="btn-primary"
                  onClick={() => console.log('Cerrar pallet:', pallet.codigo)}
                >
                  Cerrar Pallet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PalletDetailModal
        pallet={selectedPallet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPallet(null);
        }}
        onClosePallet={(codigo) => {
          console.log('Cerrar pallet:', codigo);
          setIsModalOpen(false);
        }}
        onAddBox={(codigo) => {
          console.log('Añadir caja a:', codigo);
        }}
        onMovePallet={(codigo, location) => {
          console.log('Mover pallet', codigo, 'a', location);
        }}
      />
    </div>
  );
};

export default OpenPallets;
