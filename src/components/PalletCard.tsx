import { Pallet } from '@/types';
import '@/styles/OpenPallets.css';
import { translateStatus } from '@/utils/translations';

const PalletCard = ({
  pallet,
  setSelectedPallet,
  setIsModalOpen,
  closePallet,
  fetchActivePallets,
}: {
  pallet: Pallet;
  setSelectedPallet: (pallet: Pallet) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  closePallet: (codigo: string) => void;
  fetchActivePallets: () => void;
}) => {
  return (
    <div key={pallet.codigo} className="pallet-card">
      {/* Card Header */}
      <div className="pallet-card-header">
        <span className="pallet-code">{pallet.codigo}</span>
        <span className={`status-badge ${pallet.estado.toLowerCase()}`}>
          {translateStatus(pallet.estado)}
        </span>
        <span className={`location-badge ${pallet.ubicacion.toLowerCase()}`}>
          {pallet.ubicacion}
        </span>
      </div>

      {/* Card Info */}
      <div className="pallet-info">
        <div className="pallet-info-item">
          <span className="pallet-info-label">Cajas:</span>
          <span className="pallet-info-value">{pallet.cantidadCajas}</span>
        </div>

        <div className="pallet-info-item">
          <span className="pallet-info-label">Calibre:</span>
          <span className="pallet-info-value small">{pallet.calibre}</span>
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
        {pallet.estado === 'open' && (
          <button
            className="btn-primary"
            onClick={() => {
              closePallet(pallet.codigo);
              fetchActivePallets();
            }}
          >
            Cerrar Pallet
          </button>
        )}
      </div>
    </div>
  );
};

export default PalletCard;
