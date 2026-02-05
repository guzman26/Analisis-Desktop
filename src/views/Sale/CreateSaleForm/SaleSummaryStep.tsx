import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Customer, CalibreSelection } from '@/types';
import { Card, Button } from '@/components/design-system';
import { CALIBRE_MAP } from '@/utils/getParamsFromCodigo';
import { getEggCountForBox, formatEggCount } from '@/utils/eggCalculations';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

type SaleType = 'Venta' | 'Reposición' | 'Donación' | 'Inutilizado' | 'Ración';

const notesSchema = z.object({
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type NotesFormValues = z.infer<typeof notesSchema>;

interface SaleSummaryStepProps {
  customer: Customer;
  saleType: SaleType;
  calibres: CalibreSelection[];
  onConfirm: (notes?: string) => void;
  isSubmitting: boolean;
}

const SaleSummaryStep: React.FC<SaleSummaryStepProps> = ({
  customer,
  saleType,
  calibres,
  onConfirm,
  isSubmitting,
}) => {
  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: { notes: '' },
  });

  const notesValue = form.watch('notes') ?? '';
  const notesLength = notesValue.length;

  // Calcular total de cajas
  const totalBoxes = useMemo(() => {
    return calibres.reduce((sum, cal) => sum + cal.boxCount, 0);
  }, [calibres]);

  // Calcular total de huevos estimados (asumiendo formato 1 por defecto)
  const totalEggs = useMemo(() => {
    const eggsPerBox = getEggCountForBox('1');
    return totalBoxes * eggsPerBox;
  }, [totalBoxes]);

  const handleConfirm = form.handleSubmit((data) => {
    onConfirm(data.notes);
  });

  return (
    <Card className="sale-summary-step p-6" variant="elevated">
      <div className="summary-section space-y-6">
        <h2 className="text-xl font-medium mb-2">Resumen de {saleType}</h2>

        {/* Quick Summary Card */}
        <Card className="quick-summary-card p-4" variant="flat">
          <div className="flex justify-between items-center">
            <div className="summary-main">
              <h3 className="text-lg font-medium text-blue-600">{saleType}</h3>
              <p className="text-xl font-semibold">{customer.name}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <span className="block text-2xl font-bold">{calibres.length}</span>
                <span className="block text-sm text-gray-500">
                  Calibre{calibres.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold">{totalBoxes}</span>
                <span className="block text-sm text-gray-500">
                  Caja{totalBoxes !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold">
                  {formatEggCount(totalEggs)}
                </span>
                <span className="block text-sm text-gray-500">
                  Huevo{totalEggs !== 1 ? 's' : ''} (estimado)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Customer Details */}
        <Card className="p-4" variant="flat">
          <div className="mb-3">
            <h3 className="text-lg font-medium">Cliente Seleccionado</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Nombre:</span>
              <span className="font-medium">{customer.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Email:</span>
              <span className="font-medium">{customer.email || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Teléfono:</span>
              <span className="font-medium">{customer.phone || 'N/A'}</span>
            </div>
            {customer.taxId && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">RUT:</span>
                <span className="font-medium">{customer.taxId}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Calibres Summary */}
        <Card className="p-4" variant="flat">
          <div className="mb-4">
            <h3 className="text-lg font-medium">
              Calibres y Cantidades Seleccionadas
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              La asignación de cajas específicas se realizará más adelante
            </p>
          </div>

          <div className="space-y-3">
            {calibres.map((cal) => {
              const calibreName =
                CALIBRE_MAP[cal.calibre as keyof typeof CALIBRE_MAP] ||
                cal.calibre;
              const eggsForCalibre = cal.boxCount * getEggCountForBox('1');

              return (
                <Card
                  key={cal.calibre}
                  className="mb-2 border border-gray-200"
                  variant="flat"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-lg">{calibreName}</h4>
                          <span className="text-xs py-1 px-2 bg-blue-50 text-blue-700 rounded">
                            Código: {cal.calibre}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                              Cantidad de cajas:
                            </span>
                            <span className="text-lg font-semibold text-blue-600">
                              {cal.boxCount}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                              Huevos estimados:
                            </span>
                            <span className="text-lg font-semibold text-gray-700">
                              {formatEggCount(eggsForCalibre)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Notes Section */}
        <Form {...form}>
          <Card className="p-4" variant="flat">
            <h3 className="text-lg font-medium mb-3">Notas Adicionales</h3>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Agregar notas sobre la operación (opcional)..."
                      className="w-full resize-none"
                      rows={3}
                      maxLength={500}
                    />
                  </FormControl>
                  <div className="mt-1 flex items-center justify-between">
                    <FormMessage />
                    <span className="text-xs text-right text-gray-500 ml-auto">
                      {notesLength}/500 caracteres
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </Card>

          {/* Confirmation */}
          <Card className="p-4 bg-blue-50" variant="flat">
            <div className="mb-4">
              <p className="text-center text-lg">
                ¿Confirma que desea procesar esta {saleType.toLowerCase()} de{' '}
                <strong>{totalBoxes} caja{totalBoxes !== 1 ? 's' : ''}</strong>{' '}
                ({calibres.length} calibre{calibres.length !== 1 ? 's' : ''}) para
                el cliente <strong>{customer.name}</strong>?
              </p>
              <p className="text-center text-sm text-gray-600 mt-2">
                La asignación de cajas específicas se realizará en un proceso
                posterior
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleConfirm}
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : `Confirmar ${saleType}`}
              </Button>
            </div>
          </Card>
        </Form>
      </div>
    </Card>
  );
};

export default SaleSummaryStep;
