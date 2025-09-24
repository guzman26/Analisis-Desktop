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

  const [turno, setTurno] = React.useState('');
  const [calibre, setCalibre] = React.useState('');
  const [formato, setFormato] = React.useState('');
  const [empresa, setEmpresa] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [maxBoxes, setMaxBoxes] = React.useState<number>(60);

  const canSubmit = Boolean(turno && calibre && formato && empresa);

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const baseCode = generatePalletCode(
        new Date(),
        turno,
        calibre,
        formato,
        empresa
      );
      if (baseCode.length !== 11) throw new Error('Código base inválido');
      await createPallet({ baseCode, ubicacion: 'PACKING', maxBoxes } as any);
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
          {/* Turno */}
          <div>
            <label className="text-sm text-macos-text-secondary block mb-1">
              Turno
            </label>
            <select
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2"
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
            >
              <option value="">Seleccionar turno</option>
              {TURNOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Calibre */}
          <div>
            <label className="text-sm text-macos-text-secondary block mb-1">
              Calibre
            </label>
            <select
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2"
              value={calibre}
              onChange={(e) => setCalibre(e.target.value)}
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
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2"
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
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
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
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
              Capacidad de cajas (opcional)
            </label>
            <input
              type="number"
              min={1}
              max={200}
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2"
              value={maxBoxes}
              onChange={(e) => setMaxBoxes(Number(e.target.value) || 60)}
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
