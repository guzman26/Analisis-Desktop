import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/design-system';
import { usePalletContext } from '@/contexts/PalletContext';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';

// Opciones (ajustables según negocio)
const TURNOS = [
  { label: 'Turno 1', value: '1' },
  { label: 'Turno 2', value: '2' },
  { label: 'Turno 3', value: '3' },
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

// Formatos conocidos (1 dígito). Ajustar etiquetas si aplica
const FORMATOS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
];

// Empresas (empacadora) 1 dígito. Ajustar según catálogos reales
const EMPRESAS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
];

function getIsoWeek(date: Date): number {
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = tmp.getUTCDay() || 7; // 1..7 (Mon..Sun)
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
}

function buildBaseCode(params: {
  turno: string; // 1 dígito
  calibre: string; // 2 dígitos
  formato: string; // 1 dígito
  empresa: string; // 1 dígito
}): string {
  const now = new Date();
  const diaJS = now.getDay();
  const dia = (diaJS === 0 ? 7 : diaJS).toString(); // 1..7, Lunes=1
  const semana = getIsoWeek(now).toString().padStart(2, '0');
  const ano = (now.getFullYear() % 100).toString().padStart(2, '0');
  const operario = '00';
  const empacadora = params.empresa; // 1 dígito
  const turno = params.turno; // 1 dígito
  const calibre = params.calibre; // 2 dígitos
  const formato = params.formato; // 1 dígito
  // Estructura base (12 dígitos): D SS AA OO E T CC F
  return `${dia}${semana}${ano}${operario}${empacadora}${turno}${calibre}${formato}`;
}

const CreatePallet: React.FC = () => {
  const { createPallet } = usePalletContext();
  const navigate = useNavigate();

  const [turno, setTurno] = React.useState('');
  const [calibre, setCalibre] = React.useState('');
  const [formato, setFormato] = React.useState('');
  const [empresa, setEmpresa] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canSubmit = Boolean(turno && calibre && formato && empresa);

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const baseCode = buildBaseCode({ turno, calibre, formato, empresa });
      if (baseCode.length !== 12) {
        throw new Error('BaseCode inválido');
      }
      await createPallet({ baseCode, ubicacion: 'PACKING' } as any);
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
              <option value="">Seleccionar formato</option>
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
              <option value="">Seleccionar empresa</option>
              {EMPRESAS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
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
