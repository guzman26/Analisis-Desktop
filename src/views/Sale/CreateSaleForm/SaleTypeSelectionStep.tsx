import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/design-system';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SALE_TYPES = [
  'Venta',
  'Reposición',
  'Donación',
  'Inutilizado',
  'Ración',
] as const;
export type SaleType = (typeof SALE_TYPES)[number];

const saleTypeSchema = z.object({
  saleType: z.enum(SALE_TYPES).optional(),
});

type SaleTypeFormValues = z.infer<typeof saleTypeSchema>;

const saleTypeOptions: {
  value: SaleType;
  label: string;
  description: string;
}[] = [
  { value: 'Venta', label: 'Venta', description: 'Venta comercial regular de productos' },
  { value: 'Reposición', label: 'Reposición', description: 'Reposición de productos defectuosos o faltantes' },
  { value: 'Donación', label: 'Donación', description: 'Donación benéfica de productos' },
  { value: 'Inutilizado', label: 'Inutilizado', description: 'Productos que no pueden ser vendidos' },
  { value: 'Ración', label: 'Ración', description: 'Distribución interna de raciones' },
];

interface SaleTypeSelectionStepProps {
  selectedType: SaleType | null;
  onSelect: (type: SaleType) => void;
}

const SaleTypeSelectionStep: React.FC<SaleTypeSelectionStepProps> = ({
  selectedType,
  onSelect,
}) => {
  const form = useForm<SaleTypeFormValues>({
    resolver: zodResolver(saleTypeSchema),
    defaultValues: { saleType: selectedType ?? undefined },
  });

  useEffect(() => {
    form.reset({ saleType: selectedType ?? undefined });
  }, [selectedType, form]);

  return (
    <Card className="sale-type-selection-step p-6" variant="elevated">
      <div className="step-header mb-6">
        <h2 className="text-xl font-medium mb-2">Tipo de Operación</h2>
        <p className="text-sm text-gray-500">
          Selecciona el tipo de operación que deseas realizar
        </p>
      </div>

      <Form {...form}>
        <FormField
          control={form.control}
          name="saleType"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  value={field.value ?? ''}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value) onSelect(value as SaleType);
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {saleTypeOptions.map((type) => (
                    <Card
                      key={type.value}
                      className={cn(
                        'cursor-pointer transition-all duration-200 p-4',
                        field.value === type.value && 'ring-2 ring-blue-500'
                      )}
                      variant={field.value === type.value ? 'elevated' : 'flat'}
                      isPressable
                      isHoverable
                      onClick={() => {
                        field.onChange(type.value);
                        onSelect(type.value);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          value={type.value}
                          id={type.value}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={type.value}
                            className="flex items-center justify-between mb-2 cursor-pointer"
                          >
                            <span className="text-lg font-medium">{type.label}</span>
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              {field.value === type.value ? (
                                <Check size={18} className="text-blue-500" />
                              ) : (
                                <Circle size={18} className="text-gray-300" />
                              )}
                            </div>
                          </Label>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </Card>
  );
};

export default SaleTypeSelectionStep;
