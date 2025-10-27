import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/design-system';
import { usePalletContext } from '@/contexts/PalletContext';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';
import generatePalletCode from '@/utils/generatePalletCode';

// Opciones UI
const TURNOS = [
  { label: 'Turno 1 (Mañana)', value: '1' },
  { label: 'Turno 2 (Tarde)', value: '2' },
  { label: 'Turno 3 (Noche)', value: '3' },
];

// Códigos de calibre válidos conocidos
const CALIBRE_CODES = [
  '01',
  '02',
  '04',
  '07',
  '09',
  '15',
  '12',
  '03',
  '05',
  '06',
  '13',
  '11',
  '16',
  '14',
  '08',
];

// Formatos (mostrar nombres similares a las capturas)
const FORMATOS = [
  { label: 'Formato 1 (180 unidades)', value: '1' },
  { label: 'Formato 2 (100 JUMBO)', value: '2' },
  { label: 'Formato 3 (Docena)', value: '3' },
];

// Empresas
const EMPRESAS = [
  { label: 'Lomas Altas', value: '1' },
  { label: 'Santa Marta', value: '2' },
  { label: 'Coliumo', value: '3' },
  { label: 'El Monte', value: '4' },
  { label: 'Libre', value: '5' },
];

// Nota: el backend espera el código base (11 dígitos). El sufijo de 3 dígitos lo agrega el servidor.

const CreatePallet: React.FC = () => {
  const { createPallet } = usePalletContext();
  const navigate = useNavigate();

  const [turnos, setTurnos] = React.useState<string[]>([]);
  const [calibre, setCalibre] = React.useState('');
  const [formato, setFormato] = React.useState('');
  const [empresa, setEmpresa] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [maxBoxes, setMaxBoxes] = React.useState<number>(60);

  const canSubmit = Boolean(turnos.length > 0 && calibre && formato && empresa);

  const handleTurnoToggle = (turnoValue: string) => {
    setTurnos((prev) => {
      if (prev.includes(turnoValue)) {
        return prev.filter((t) => t !== turnoValue);
      }
      if (prev.length >= 3) return prev;
      return [...prev, turnoValue];
    });
  };

  const handleTurnosSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    handleTurnoToggle(value);
    // Keep placeholder selected to mimic single-select UI
    e.currentTarget.selectedIndex = 0;
  };

  const handleCreate = async () => {
    if (!canSubmit) return;

    // Validar que maxBoxes no exceda 60
    if (maxBoxes > 60) {
      setError('La capacidad máxima de cajas es 60');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Usar el primer turno seleccionado para el código base
      const baseCode = generatePalletCode(
        new Date(),
        turnos[0],
        calibre,
        formato,
        empresa
      );
      if (baseCode.length !== 11) throw new Error('Código base inválido');
      await createPallet({
        baseCode,
        ubicacion: 'PACKING',
        maxBoxes,
        horarios: turnos,
      } as any);
      navigate('/packing/openPallets');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear pallet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="macos-animate-fade-in">
      <Card variant="flat">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1
              className="macos-text-large-title"
              style={{ color: 'var(--macos-text-primary)' }}
            >
              Crear Pallet
            </h1>
            <span
              className="px-2 py-0.5 rounded-macos-sm bg-macos-green-transparentize-6 macos-text-footnote"
              style={{ color: 'var(--macos-green)' }}
            >
              Nuevo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Turnos (Múltiples) */}
          <div>
            <label className="text-sm text-macos-text-secondary block mb-1">
              Turnos (máximo 3)
            </label>
            <select
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2 bg-white text-macos-text-primary focus:outline-none focus:ring-2 focus:ring-macos-blue transition-all"
              style={{
                minHeight: '40px',
                cursor: 'pointer',
                backgroundColor: turnos.length > 0 ? 'white' : '#f5f5f5',
              }}
              onChange={handleTurnosSelect}
              value=""
            >
              <option value="">Seleccionar turnos</option>
              {TURNOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-macos-text-secondary mt-1">
              {turnos.length === 0
                ? 'Ningún turno seleccionado'
                : `${turnos.length} turno${turnos.length !== 1 ? 's' : ''} seleccionado${turnos.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Calibre */}
          <div>
            <label className="text-sm text-macos-text-secondary block mb-1">
              Calibre
            </label>
            <select
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2 bg-white text-macos-text-primary focus:outline-none focus:ring-2 focus:ring-macos-blue transition-all"
              value={calibre}
              onChange={(e) => setCalibre(e.target.value)}
              style={{
                minHeight: '40px',
                cursor: 'pointer',
                backgroundColor: calibre ? 'white' : '#f5f5f5',
              }}
            >
              <option value="">Seleccionar calibre</option>
              {CALIBRE_CODES.map((code) => (
                <option key={code} value={code}>
                  {formatCalibreName(code)}
                </option>
              ))}
            </select>
          </div>

          {/* Formato */}
          <div>
            <label className="text-sm text-macos-text-secondary block mb-1">
              Formato
            </label>
            <select
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2 bg-white text-macos-text-primary focus:outline-none focus:ring-2 focus:ring-macos-blue transition-all"
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
              style={{
                minHeight: '40px',
                cursor: 'pointer',
                backgroundColor: formato ? 'white' : '#f5f5f5',
              }}
            >
              <option value="">Seleccionar un formato</option>
              {FORMATOS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Empresa */}
          <div>
            <label className="text-sm text-macos-text-secondary block mb-1">
              Empresa
            </label>
            <select
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2 bg-white text-macos-text-primary focus:outline-none focus:ring-2 focus:ring-macos-blue transition-all"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              style={{
                minHeight: '40px',
                cursor: 'pointer',
                backgroundColor: empresa ? 'white' : '#f5f5f5',
              }}
            >
              <option value="">Seleccionar una empresa</option>
              {EMPRESAS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          {/* Capacidad de cajas */}
          <div>
            <label className="text-sm text-macos-text-secondary block mb-1">
              Capacidad de cajas (máximo 60)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2 bg-white text-macos-text-primary focus:outline-none focus:ring-2 focus:ring-macos-blue transition-all"
              style={{ minHeight: '40px' }}
              value={maxBoxes}
              onChange={(e) => {
                const value = Number(e.target.value);
                // Limitar el valor entre 1 y 60
                if (value > 60) {
                  setMaxBoxes(60);
                } else if (value < 1) {
                  setMaxBoxes(1);
                } else {
                  setMaxBoxes(value || 60);
                }
              }}
            />
          </div>
        </div>

        {error && <div className="mt-4 text-macos-danger">{error}</div>}

        <div className="flex justify-end mt-6">
          <Button
            variant="primary"
            disabled={!canSubmit || submitting}
            onClick={handleCreate}
          >
            {submitting ? 'Creando…' : 'Crear Pallet'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreatePallet;
