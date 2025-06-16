import { Box} from '@/types';
import '@/styles/BoxCard.css';
import { formatDate } from '@/utils/formatDate';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';

const BoxCard = ({
  box,
  setSelectedBox,
  setIsModalOpen,
}: {
  box: Box;
  setSelectedBox: (box: Box) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}) => {
  return (
    <div key={box.codigo} className="box-card">
      {/* Card Header */}
      <div className="box-card-header">
        <span className="box-code">{box.codigo}</span>
        
        <span className={`location-badge ${box.ubicacion.toLowerCase()}`}>
          {box.ubicacion}
        </span>
      </div>

      {/* Card Info */}
      <div className="box-info">
        <div className="box-info-item">
          <span className="box-info-label">Fecha:</span>
          <span className="box-info-value">{formatDate(box.fecha_registro)}</span>
        </div>

        <div className="box-info-item">
          <span className="box-info-label">Calibre:</span>
          <span className="box-info-value small">{formatCalibreName(box.calibre.toString())}</span>
        </div>  
      </div>

      {/* Card Actions */}
      <div className="pallet-actions">
        <button
          className="btn-secondary"
          onClick={() => {
            setSelectedBox(box);
            setIsModalOpen(true);
          }}
        >
          Ver Detalles
        </button>
        {box.estado === 'open' && (
          <button
            className="btn-primary"
            
          >
            Cerrar Pallet
          </button>
        )}
      </div>
    </div>
  );
};

export default BoxCard;
