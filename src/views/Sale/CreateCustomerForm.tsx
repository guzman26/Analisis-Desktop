import React, { useState } from 'react';
import { Customer, CustomerFormData } from '@/types';
import { Input, Button, Card } from '@/components/design-system';
import { useCreateCustomerMutation } from '@/modules/customers';
import { toUserMessage } from '@/modules/core';
import { PageHeaderV2 } from '@/components/app-v2';

interface CreateCustomerFormProps {
  onSuccess?: (customer: Customer) => void;
  onCancel?: () => void;
}

const CreateCustomerForm = ({
  onSuccess,
  onCancel,
}: CreateCustomerFormProps) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    contactPerson: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCustomerMutation = useCreateCustomerMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores cuando el usuario comience a escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es requerido';
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
      const customer = await createCustomerMutation.mutateAsync(formData);

      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        contactPerson: '',
      });

      if (onSuccess) {
        onSuccess(customer);
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Limpiar formulario
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      contactPerson: '',
    });
    setFormErrors({});

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="v2-page space-y-4">
      <PageHeaderV2
        title="Crear Nuevo Cliente"
        description="Complete los datos del cliente para crear un nuevo registro."
      />

      <Card className="customer-form-container p-6" variant="elevated">
        {createCustomerMutation.error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-700 rounded">
            {toUserMessage(
              createCustomerMutation.error,
              'Error al crear cliente'
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="customer-form space-y-6">
          <Card className="form-section p-4" variant="flat">
            <h3 className="font-medium mb-4">Información Básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Nombre *
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'border-red-300' : ''}
                  placeholder="Nombre completo del cliente"
                  required
                />
                {formErrors.name && (
                  <span className="text-sm text-red-600 mt-1">
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email *
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'border-red-300' : ''}
                  placeholder="correo@ejemplo.com"
                  required
                />
                {formErrors.email && (
                  <span className="text-sm text-red-600 mt-1">
                    {formErrors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1"
                >
                  Teléfono *
                </label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={formErrors.phone ? 'border-red-300' : ''}
                  placeholder="+1234567890"
                  required
                />
                {formErrors.phone && (
                  <span className="text-sm text-red-600 mt-1">
                    {formErrors.phone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="contactPerson"
                  className="block text-sm font-medium mb-1"
                >
                  Persona de Contacto
                </label>
                <Input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Nombre del contacto principal"
                />
              </div>
            </div>
          </Card>

          <Card className="form-section p-4" variant="flat">
            <h3 className="font-medium mb-4">Información Adicional</h3>

            <div className="mb-4">
              <div className="form-group w-full">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium mb-1"
                >
                  Dirección
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Dirección completa del cliente"
                  rows={3}
                  className="w-full resize-none rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label
                  htmlFor="taxId"
                  className="block text-sm font-medium mb-1"
                >
                  ID Fiscal
                </label>
                <Input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="Número de identificación fiscal"
                  className="w-full md:w-1/2"
                />
              </div>
            </div>
          </Card>

          <div className="form-actions flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={handleCancel}
              variant="secondary"
              disabled={isSubmitting || createCustomerMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || createCustomerMutation.isPending}
            >
              {isSubmitting || createCustomerMutation.isPending
                ? 'Creando...'
                : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateCustomerForm;
