import React, { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button } from '@/components/design-system';
import { Check, X } from 'lucide-react';
import { ALL_CALIBRE_CODES, CALIBRE_MAP } from '@/utils/getParamsFromCodigo';
import { CalibreSelection } from '@/types';
import { Form, FormNumberInput } from '@/components/ui/form-helpers';

// Zod schema for box selection validation
const boxSelectionSchema = z.object({
  calibres: z
    .array(
      z.object({
        calibre: z.string(),
        boxCount: z
          .number()
          .int('Debe ser un número entero')
          .min(1, 'Debe seleccionar al menos 1 caja')
          .max(1000, 'Máximo 1000 cajas por calibre'),
      })
    )
    .min(1, 'Debe seleccionar al menos un calibre'),
});

type BoxSelectionFormData = z.infer<typeof boxSelectionSchema>;

interface BoxSelectionStepProps {
  selectedCalibres: CalibreSelection[];
  onNext: (calibres: CalibreSelection[]) => void;
  onBack: () => void;
}

const BoxSelectionStep: React.FC<BoxSelectionStepProps> = ({
  selectedCalibres,
  onNext,
  onBack,
}) => {
  // Initialize form with React Hook Form
  const form = useForm<BoxSelectionFormData>({
    resolver: zodResolver(boxSelectionSchema),
    defaultValues: {
      calibres:
        selectedCalibres.length > 0
          ? selectedCalibres.filter((cal) => cal.boxCount > 0)
          : [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'calibres',
  });

  // Convert array to Map for easy lookup
  const calibreMap = useMemo(() => {
    const map = new Map<string, { index: number; boxCount: number }>();
    fields.forEach((field, index) => {
      map.set(field.calibre, { index, boxCount: field.boxCount });
    });
    return map;
  }, [fields]);

  // Handle calibre selection toggle
  const handleCalibreToggle = (calibre: string) => {
    const existing = calibreMap.get(calibre);

    if (existing !== undefined) {
      // Remove calibre if already selected
      remove(existing.index);
    } else {
      // Add calibre with initial quantity of 1
      append({ calibre, boxCount: 1 });
    }
  };

  // Handle form submission
  const onSubmit = (data: BoxSelectionFormData) => {
    // Filter out any calibres with quantity 0 or less (shouldn't happen due to validation)
    const validCalibres = data.calibres.filter((cal) => cal.boxCount > 0);
    onNext(validCalibres);
  };

  // Calculate total boxes
  const totalBoxes = useMemo(() => {
    return fields.reduce((sum, field) => sum + (field.boxCount || 0), 0);
  }, [fields]);

  // Group calibres by type (Blanco, Color, Otros)
  const groupedCalibres = useMemo(() => {
    const blancos: string[] = [];
    const color: string[] = [];
    const otros: string[] = [];

    ALL_CALIBRE_CODES.forEach((code) => {
      const name = CALIBRE_MAP[code];
      if (name.includes('BCO')) {
        blancos.push(code);
      } else if (name.includes('COLOR')) {
        color.push(code);
      } else {
        otros.push(code);
      }
    });

    return { blancos, color, otros };
  }, []);

  const isCalibreSelected = (calibre: string) => {
    return calibreMap.has(calibre);
  };

  const getCalibreFieldIndex = (calibre: string) => {
    return calibreMap.get(calibre)?.index;
  };

  const renderCalibreGroup = (
    title: string,
    calibres: string[],
    borderColor: string,
    ringColor: string,
    bgColor: string
  ) => {
    if (calibres.length === 0) return null;

    return (
      <div className="calibre-group">
        <div className={`mb-4 pb-2 border-b-2 ${borderColor}`}>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {calibres.map((calibre) => {
            const selected = isCalibreSelected(calibre);
            const fieldIndex = getCalibreFieldIndex(calibre);
            const calibreName =
              CALIBRE_MAP[calibre as keyof typeof CALIBRE_MAP] || calibre;

            return (
              <Card
                key={calibre}
                className={`p-4 ${selected ? `ring-2 ${ringColor} ${bgColor}` : ''}`}
                variant={selected ? 'elevated' : 'flat'}
              >
                <div className="flex flex-col gap-3">
                  <Button
                    variant={selected ? 'primary' : 'secondary'}
                    onClick={() => handleCalibreToggle(calibre)}
                    className="w-full"
                    size="small"
                    type="button"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {selected && <Check size={16} />}
                      <span className="font-medium">{calibreName}</span>
                    </div>
                  </Button>

                  {selected && fieldIndex !== undefined && (
                    <FormNumberInput
                      control={form.control}
                      name={`calibres.${fieldIndex}.boxCount`}
                      label="Cantidad de cajas:"
                      placeholder="0"
                      min={1}
                      max={1000}
                      className="w-full"
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="box-selection-step p-6" variant="elevated">
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-2">
              Seleccionar Calibres y Cantidades
            </h2>
            <p className="text-sm text-gray-500">
              Primero selecciona los calibres que necesitas, luego ingresa la
              cantidad de cajas para cada uno
            </p>
          </div>

          {/* Selection summary */}
          {totalBoxes > 0 && (
            <div className="mb-6 bg-blue-50 rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-blue-700 font-medium">
                  Total: {totalBoxes} caja{totalBoxes !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-blue-200"
                  >
                    <span className="text-sm font-medium">
                      {CALIBRE_MAP[field.calibre as keyof typeof CALIBRE_MAP] ||
                        field.calibre}
                      : {field.boxCount} cajas
                    </span>
                    <button
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form validation errors */}
          {form.formState.errors.calibres?.root && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {form.formState.errors.calibres.root.message}
            </div>
          )}

          {/* Calibre selection by type */}
          <div className="space-y-6">
            {renderCalibreGroup(
              'Huevos Blancos',
              groupedCalibres.blancos,
              'border-blue-200',
              'ring-blue-500',
              'bg-blue-50'
            )}

            {renderCalibreGroup(
              'Huevos de Color',
              groupedCalibres.color,
              'border-orange-200',
              'ring-orange-500',
              'bg-orange-50'
            )}

            {renderCalibreGroup(
              'Otros',
              groupedCalibres.otros,
              'border-gray-300',
              'ring-gray-500',
              'bg-gray-50'
            )}
          </div>

          {/* Empty state */}
          {fields.length === 0 && (
            <Card className="p-8 text-center mt-6" variant="flat">
              <p className="text-gray-500">
                Selecciona al menos un calibre para continuar
              </p>
            </Card>
          )}
        </Card>

        {/* Form controls */}
        <div className="flex justify-between mt-6">
          <Button type="button" onClick={onBack} variant="secondary">
            Atrás
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={fields.length === 0 || !form.formState.isValid}
            isLoading={form.formState.isSubmitting}
          >
            Siguiente
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BoxSelectionStep;
