import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateDispatchRequest, DispatchDestination, Dispatch } from '@/types';
import { Input, Button, Card, WindowContainer, LoadingOverlay } from '../../components/design-system';
import { useNotifications } from '../../components/Notification';
import { createDispatch, getDispatchById, getClosedPallets } from '@/api/endpoints';
import { Pallet } from '@/types';
import { getPalletByCode } from '@/api/endpoints';

const CreateDispatchForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState<CreateDispatchRequest>({
    fecha: new Date().toISOString().split('T')[0],
    horaLlegada: new Date().toISOString().split('T')[1].slice(0, 5),
    destino: 'Bodega Lomas Altas Capilla',
    patenteCamion: '',
    nombreChofer: '',
    despachador: '',
    cargador: '',
    numeroSello: '',
    pallets: [],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [palletSearchQuery, setPalletSearchQuery] = useState('');
  const [availablePallets, setAvailablePallets] = useState<Pallet[]>([]);
  const [loadingPallets, setLoadingPallets] = useState(false);
  const [selectedPallets, setSelectedPallets] = useState<Pallet[]>([]);

  // Load dispatch data if editing
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setLoading(true);
      getDispatchById(id)
        .then((dispatch: Dispatch) => {
          // Parse fecha (ISO string) to date input format
          const fechaDate = new Date(dispatch.fecha);
          const fechaFormatted = fechaDate.toISOString().split('T')[0];
          
          // Parse horaLlegada (ISO string) to time input format
          const horaLlegadaDate = new Date(dispatch.horaLlegada);
          const horaLlegadaFormatted = horaLlegadaDate.toTimeString().slice(0, 5);
          
          setFormData({
            fecha: fechaFormatted,
            horaLlegada: horaLlegadaFormatted,
            destino: dispatch.destino,
            patenteCamion: dispatch.patenteCamion,
            nombreChofer: dispatch.nombreChofer,
            despachador: dispatch.despachador,
            cargador: dispatch.cargador,
            numeroSello: dispatch.numeroSello,
            pallets: dispatch.pallets,
          });
          // Load pallet details for selected pallets
          loadPalletDetails(dispatch.pallets);
        })
        .catch((err) => {
          console.error('Error loading dispatch:', err);
          showError('Error al cargar el despacho');
          navigate('/dispatch/list');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Load available pallets (closed pallets in PACKING)
  useEffect(() => {
    loadAvailablePallets();
  }, []);

  const loadAvailablePallets = async () => {
    setLoadingPallets(true);
    try {
      const response = await getClosedPallets({
        ubicacion: 'PACKING',
        limit: 100,
      });
      setAvailablePallets(response.items || []);
    } catch (err) {
      console.error('Error loading pallets:', err);
    } finally {
      setLoadingPallets(false);
    }
  };

  const loadPalletDetails = async (palletCodes: string[]) => {
    setLoadingPallets(true);
    try {
      const pallets: Pallet[] = [];
      for (const code of palletCodes) {
        try {
          const pallet = await getPalletByCode(code);
          if (pallet) {
            pallets.push(pallet);
          }
        } catch (err) {
          console.error(`Error loading pallet ${code}:`, err);
        }
      }
      setSelectedPallets(pallets);
    } finally {
      setLoadingPallets(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAddPallet = async () => {
    if (!palletSearchQuery.trim()) {
      showError('Ingrese un código de pallet');
      return;
    }

    // Check if already selected
    if (selectedPallets.some((p) => p.codigo === palletSearchQuery.trim())) {
      showError('Este pallet ya está agregado');
      return;
    }

    try {
      const pallet = await getPalletByCode(palletSearchQuery.trim());
      if (!pallet) {
        showError('Pallet no encontrado');
        return;
      }

      setSelectedPallets((prev) => [...prev, pallet]);
      setFormData((prev) => ({
        ...prev,
        pallets: [...prev.pallets, pallet.codigo],
      }));
      setPalletSearchQuery('');
    } catch (err) {
      console.error('Error loading pallet:', err);
      showError('Error al cargar el pallet');
    }
  };

  const handleRemovePallet = (palletCode: string) => {
    setSelectedPallets((prev) => prev.filter((p) => p.codigo !== palletCode));
    setFormData((prev) => ({
      ...prev,
      pallets: prev.pallets.filter((code) => code !== palletCode),
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fecha.trim()) {
      errors.fecha = 'La fecha es requerida';
    }

    if (!formData.horaLlegada.trim()) {
      errors.horaLlegada = 'La hora de llegada es requerida';
    }

    if (!formData.destino) {
      errors.destino = 'El destino es requerido';
    }

    if (!formData.patenteCamion.trim()) {
      errors.patenteCamion = 'La patente del camión es requerida';
    }

    if (!formData.nombreChofer.trim()) {
      errors.nombreChofer = 'El nombre del chofer es requerido';
    }

    if (!formData.despachador.trim()) {
      errors.despachador = 'El despachador es requerido';
    }

    if (!formData.cargador.trim()) {
      errors.cargador = 'El cargador es requerido';
    }

    if (!formData.numeroSello.trim()) {
      errors.numeroSello = 'El número de sello es requerido';
    }

    if (formData.pallets.length === 0) {
      errors.pallets = 'Debe agregar al menos un pallet';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format fecha and horaLlegada properly
      const dispatchData: CreateDispatchRequest = {
        ...formData,
        fecha: new Date(formData.fecha).toISOString(),
        horaLlegada: new Date(`${formData.fecha}T${formData.horaLlegada}`).toISOString(),
        userId: 'user', // TODO: Get actual user ID
      };

      await createDispatch(dispatchData);

      showSuccess(
        isEditMode
          ? 'Despacho actualizado exitosamente'
          : 'Despacho creado exitosamente'
      );
      navigate('/dispatch/list');
    } catch (err) {
      console.error('Error creating dispatch:', err);
      showError(
        err instanceof Error
          ? `Error al crear despacho: ${err.message}`
          : 'Error desconocido al crear despacho'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dispatch/list');
  };

  const filteredAvailablePallets = availablePallets.filter((p) =>
    p.codigo.toLowerCase().includes(palletSearchQuery.toLowerCase())
  );

  if (loading && isEditMode) {
    return (
      <WindowContainer title={isEditMode ? 'Editar Despacho' : 'Crear Despacho'}>
        <LoadingOverlay show={true} text="Cargando despacho…" />
      </WindowContainer>
    );
  }

  return (
    <WindowContainer title={isEditMode ? 'Editar Despacho' : 'Crear Despacho'}>
      <Card className="dispatch-form-container" variant="elevated">
        <div className="dispatch-form-header" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {isEditMode ? 'Editar Despacho' : 'Crear Nuevo Despacho'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Complete los datos del despacho para {isEditMode ? 'actualizarlo' : 'crearlo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Información Básica */}
          <Card className="form-section" variant="flat" style={{ padding: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Información Básica</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="fecha" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Fecha *
                </label>
                <Input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.fecha && (
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.fecha}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="horaLlegada" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Hora Llegada *
                </label>
                <Input
                  type="time"
                  id="horaLlegada"
                  name="horaLlegada"
                  value={formData.horaLlegada}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.horaLlegada && (
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.horaLlegada}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="destino" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Destino *
                </label>
                <select
                  id="destino"
                  name="destino"
                  value={formData.destino}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                  }}
                >
                  <option value="Bodega Lomas Altas Capilla">Bodega Lomas Altas Capilla</option>
                  <option value="Otro">Otro</option>
                </select>
                {formErrors.destino && (
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.destino}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Información de Transporte */}
          <Card className="form-section" variant="flat" style={{ padding: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Información de Transporte</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label htmlFor="patenteCamion" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Patente Camión *
                </label>
                <Input
                  type="text"
                  id="patenteCamion"
                  name="patenteCamion"
                  value={formData.patenteCamion}
                  onChange={handleInputChange}
                  placeholder="Ej: ABC123"
                  required
                />
                {formErrors.patenteCamion && (
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.patenteCamion}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="nombreChofer" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Nombre Chofer *
                </label>
                <Input
                  type="text"
                  id="nombreChofer"
                  name="nombreChofer"
                  value={formData.nombreChofer}
                  onChange={handleInputChange}
                  placeholder="Nombre completo del chofer"
                  required
                />
                {formErrors.nombreChofer && (
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.nombreChofer}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="numeroSello" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Número de Sello *
                </label>
                <Input
                  type="text"
                  id="numeroSello"
                  name="numeroSello"
                  value={formData.numeroSello}
                  onChange={handleInputChange}
                  placeholder="Número de sello"
                  required
                />
                {formErrors.numeroSello && (
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.numeroSello}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Información de Personal */}
          <Card className="form-section" variant="flat" style={{ padding: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Personal</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label htmlFor="despachador" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Despachador *
                </label>
                <Input
                  type="text"
                  id="despachador"
                  name="despachador"
                  value={formData.despachador}
                  onChange={handleInputChange}
                  placeholder="Nombre del despachador"
                  required
                />
                {formErrors.despachador && (
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.despachador}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="cargador" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Cargador *
                </label>
                <Input
                  type="text"
                  id="cargador"
                  name="cargador"
                  value={formData.cargador}
                  onChange={handleInputChange}
                  placeholder="Nombre del cargador"
                  required
                />
                {formErrors.cargador && (
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.cargador}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Pallets */}
          <Card className="form-section" variant="flat" style={{ padding: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Pallets</h3>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Input
                  type="text"
                  placeholder="Buscar pallet por código"
                  value={palletSearchQuery}
                  onChange={(e) => setPalletSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPallet();
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  type="button"
                  onClick={handleAddPallet}
                  variant="secondary"
                  disabled={loadingPallets}
                >
                  Agregar
                </Button>
              </div>

              {formErrors.pallets && (
                <span style={{ fontSize: '0.85rem', color: '#dc2626', display: 'block', marginTop: '0.25rem' }}>
                  {formErrors.pallets}
                </span>
              )}

              {/* Selected Pallets */}
              {selectedPallets.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                    Pallets seleccionados ({selectedPallets.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedPallets.map((pallet) => (
                      <div
                        key={pallet.codigo}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: '#f3f4f6',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                        }}
                      >
                        <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {pallet.codigo}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                          ({pallet.cantidadCajas || 0} cajas)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePallet(pallet.codigo)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#dc2626',
                            fontSize: '1.2rem',
                            padding: '0 0.25rem',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <Button
              type="button"
              onClick={handleCancel}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? 'Actualizando...'
                  : 'Creando...'
                : isEditMode
                ? 'Actualizar Despacho'
                : 'Crear Despacho'}
            </Button>
          </div>
        </form>
      </Card>
    </WindowContainer>
  );
};

export default CreateDispatchForm;

