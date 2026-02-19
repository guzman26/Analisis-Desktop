import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, WindowContainer } from '@/components/design-system';
import { useDispatchDetailQuery } from '@/modules/dispatch';
import '@/styles/DispatchPrintView.css';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });

const DispatchPrintView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { dispatch, loading, error } = useDispatchDetailQuery(id);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/dispatch/list');
  };

  if (loading) {
    return (
      <div className="dispatch-print-container">
        <p>Cargando guia de despacho...</p>
      </div>
    );
  }

  if (error || !dispatch) {
    return (
      <div className="dispatch-print-container">
        <h2>Error</h2>
        <p>{error || 'No se pudo cargar el despacho'}</p>
        <Button onClick={handleBack} variant="secondary">
          Volver a despachos
        </Button>
      </div>
    );
  }

  return (
    <WindowContainer title="Imprimir despacho">
      <div className="dispatch-print-actions no-print">
        <Button onClick={handleBack} variant="secondary">
          Volver a despachos
        </Button>
        <Button onClick={handlePrint} variant="primary">
          Imprimir guia
        </Button>
      </div>

      <div className="dispatch-print-document">
        <header className="dispatch-print-header">
          <div>
            <h1>Guia de despacho interna</h1>
            <p>Folio: {dispatch.folio}</p>
          </div>
          <div>
            <p>Estado: {dispatch.estado}</p>
            <p>Fecha impresion: {formatDate(new Date().toISOString())}</p>
          </div>
        </header>

        <section className="dispatch-print-section">
          <h2>Datos de despacho</h2>
          <div className="dispatch-print-grid">
            <p>
              <strong>Fecha:</strong> {formatDate(dispatch.fecha)}
            </p>
            <p>
              <strong>Hora llegada:</strong> {formatTime(dispatch.horaLlegada)}
            </p>
            <p>
              <strong>Destino:</strong> {dispatch.destino}
            </p>
            <p>
              <strong>Patente:</strong> {dispatch.patenteCamion}
            </p>
            <p>
              <strong>Chofer:</strong> {dispatch.nombreChofer}
            </p>
            <p>
              <strong>Despachador:</strong> {dispatch.despachador}
            </p>
            <p>
              <strong>Cargador:</strong> {dispatch.cargador}
            </p>
            <p>
              <strong>Numero sello:</strong> {dispatch.numeroSello}
            </p>
          </div>
        </section>

        <section className="dispatch-print-section">
          <h2>Pallets ({dispatch.pallets.length})</h2>
          <ul className="dispatch-print-pallets">
            {dispatch.pallets.map((palletCode) => (
              <li key={palletCode}>{palletCode}</li>
            ))}
          </ul>
        </section>
      </div>
    </WindowContainer>
  );
};

export default DispatchPrintView;
