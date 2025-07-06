import React, { useState } from 'react';
import { useCustomerContext } from '@/contexts/CustomerContext';
import { CustomerFormData } from '@/types';
import { Input, Button, Card } from '@/components/design-system';
import { createCustomer } from '@/api/endpoints';

interface CreateCustomerFormProps {
  onSuccess?: (customer: any) => void;
  onCancel?: () => void;
}

const CreateCustomerForm = ({
  onSuccess,
  onCancel,
}: CreateCustomerFormProps) => {
  const [customerState] = useCustomerContext();
  const { status: loading, error } = customerState;

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
      const customer = await createCustomer(formData);

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
    <Card className="customer-form-container p-6" variant="elevated">
      <div className="customer-form-header mb-6">
        <h2 className="text-xl font-medium mb-2">Crear Nuevo Cliente</h2>
        <p className="text-sm text-gray-500">Complete los datos del cliente para crear un nuevo registro</p>
      </div>

      {error && <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-700 rounded">{error.message}</div>}

      <form onSubmit={handleSubmit} className="customer-form space-y-6">
        <Card className="form-section p-4" variant="flat">
          <h3 className="font-medium mb-4">Información Básica</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium mb-1">Nombre *</label>
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
                <span className="text-sm text-red-600 mt-1">{formErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
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
                <span className="text-sm text-red-600 mt-1">{formErrors.email}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="phone" className="block text-sm font-medium mb-1">Teléfono *</label>
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
                <span className="text-sm text-red-600 mt-1">{formErrors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contactPerson" className="block text-sm font-medium mb-1">Persona de Contacto</label>
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
              <label htmlFor="address" className="block text-sm font-medium mb-1">Dirección</label>
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
              <label htmlFor="taxId" className="block text-sm font-medium mb-1">ID Fiscal</label>
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
            disabled={isSubmitting || loading === 'loading'}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || loading === 'loading'}
          >
            {isSubmitting || loading === 'loading' ? 'Creando...' : 'Crear Cliente'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateCustomerForm;
