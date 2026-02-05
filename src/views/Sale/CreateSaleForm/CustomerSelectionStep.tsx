import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Customer } from '@/types';
import { useCustomerContext } from '@/contexts/CustomerContext';
import { Input, Button, Card } from '@/components/design-system';
import { Modal } from '@/components/design-system';
import CustomerPreferencesPanel from '@/components/CustomerPreferencesPanel';
import { FormInput } from '@/components/ui/form-helpers';
import { Form } from '@/components/ui/form';
import { Search } from 'lucide-react';

const newCustomerSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  email: z.string().min(1, 'Email es requerido').email('Email inválido'),
  phone: z.string().min(1, 'Teléfono es requerido'),
  address: z.string().optional(),
  taxId: z.string().optional(),
  contactPerson: z.string().optional(),
});

type NewCustomerFormValues = z.infer<typeof newCustomerSchema>;

const defaultNewCustomerValues: NewCustomerFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  taxId: '',
  contactPerson: '',
};

interface CustomerSelectionStepProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
}

export const CustomerSelectionStep: React.FC<CustomerSelectionStepProps> = ({
  selectedCustomer,
  onSelect,
}) => {
  const [state, customerAPI] = useCustomerContext();
  const { customers, status, error } = state;

  const isLoading = status === 'loading';
  const customerList: Customer[] = Array.isArray(customers) ? customers : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const addCustomerForm = useForm<NewCustomerFormValues>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: defaultNewCustomerValues,
  });

  useEffect(() => {
    if (customerList.length === 0) {
      customerAPI.fetchCustomers();
    }
  }, [customerList.length, customerAPI]);

  const filteredCustomers = customerList.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  const handleCustomerSelect = (customerId: string) => {
    const customer = customerList.find((c) => c.customerId === customerId);
    if (customer) {
      onSelect(customer);
    }
  };

  const handleAddCustomerSubmit = addCustomerForm.handleSubmit(
    async (data) => {
      setIsCreatingCustomer(true);
      try {
        const newCustomer = await customerAPI.createCustomer({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address ?? '',
          taxId: data.taxId ?? '',
          contactPerson: data.contactPerson ?? '',
        });
        onSelect(newCustomer);
        setShowAddCustomerModal(false);
        addCustomerForm.reset(defaultNewCustomerValues);
      } catch (err) {
        console.error('Error creating customer:', err);
      } finally {
        setIsCreatingCustomer(false);
      }
    }
  );

  const handleCloseAddCustomerModal = () => {
    setShowAddCustomerModal(false);
    addCustomerForm.reset(defaultNewCustomerValues);
  };

  if (isLoading && customerList.length === 0) {
    return (
      <div className="customer-selection-step">
        <h2>Seleccionar Cliente</h2>
        <div className="loading">Cargando clientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-selection-step">
        <h2>Seleccionar Cliente</h2>
        <div className="error">
          Error: {error?.message || 'Error desconocido'}
        </div>
        <button onClick={() => customerAPI.fetchCustomers()}>Reintentar</button>
      </div>
    );
  }

  return (
    <Card className="customer-selection-step p-6" variant="elevated">
      <h2 className="text-xl font-medium mb-4">Seleccionar Cliente</h2>

      <div className="search-section mb-4">
        <label
          htmlFor="customer-search"
          className="block text-sm font-medium mb-2"
        >
          Buscar Cliente:
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </span>
          <Input
            type="search"
            id="customer-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="pl-10 w-full"
          />
        </div>
      </div>

      <div className="customer-list-section mb-6">
        <label
          htmlFor="customer-select"
          className="block text-sm font-medium mb-2"
        >
          Seleccionar Cliente:
        </label>
        <Card className="max-h-60 overflow-y-auto">
          <div className="py-2">
            {filteredCustomers.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                No se encontraron clientes
              </p>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.customerId}
                  onClick={() => handleCustomerSelect(customer.customerId)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedCustomer?.customerId === customer.customerId ? 'bg-blue-50' : ''}`}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{customer.email}</span>
                    {customer.phone && <span>• {customer.phone}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {selectedCustomer && (
        <Card className="selected-customer-details mb-6" variant="flat">
          <div className="p-4">
            <h3 className="font-medium text-lg mb-3">Cliente Seleccionado</h3>
            <div className="customer-details space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selectedCustomer.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                )}
                {selectedCustomer.taxId && (
                  <div>
                    <p className="text-sm text-gray-500">RUT</p>
                    <p className="font-medium">{selectedCustomer.taxId}</p>
                  </div>
                )}
              </div>

              {selectedCustomer.address && (
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="font-medium">{selectedCustomer.address}</p>
                </div>
              )}
              {selectedCustomer.contactPerson && (
                <div>
                  <p className="text-sm text-gray-500">Persona de Contacto</p>
                  <p className="font-medium">
                    {selectedCustomer.contactPerson}
                  </p>
                </div>
              )}
            </div>
          </div>

          <CustomerPreferencesPanel customerId={selectedCustomer.customerId} />
        </Card>
      )}

      <div className="add-customer-section flex justify-end">
        <Button
          type="button"
          onClick={() => setShowAddCustomerModal(true)}
          variant="primary"
        >
          + Agregar Nuevo Cliente
        </Button>
      </div>

      {showAddCustomerModal && (
        <Modal
          isOpen={showAddCustomerModal}
          onClose={handleCloseAddCustomerModal}
        >
          <Card variant="elevated" className="p-0">
            <div className="modal-header flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium">Agregar Nuevo Cliente</h3>
              <Button
                type="button"
                onClick={handleCloseAddCustomerModal}
                variant="ghost"
                className="p-1 h-8 w-8"
              >
                ×
              </Button>
            </div>

            <Form {...addCustomerForm}>
              <form
                onSubmit={handleAddCustomerSubmit}
                className="customer-form p-4 space-y-4"
              >
                <FormInput
                  control={addCustomerForm.control}
                  name="name"
                  label="Nombre *"
                  placeholder="Nombre del cliente"
                  className="form-group"
                />
                <FormInput
                  control={addCustomerForm.control}
                  name="email"
                  label="Email *"
                  type="email"
                  placeholder="email@ejemplo.com"
                  className="form-group"
                />
                <FormInput
                  control={addCustomerForm.control}
                  name="phone"
                  label="Teléfono *"
                  type="tel"
                  placeholder="Teléfono"
                  className="form-group"
                />
                <FormInput
                  control={addCustomerForm.control}
                  name="address"
                  label="Dirección"
                  placeholder="Dirección"
                  className="form-group"
                />
                <FormInput
                  control={addCustomerForm.control}
                  name="taxId"
                  label="RUT"
                  placeholder="RUT"
                  className="form-group"
                />
                <FormInput
                  control={addCustomerForm.control}
                  name="contactPerson"
                  label="Persona de Contacto"
                  placeholder="Persona de contacto"
                  className="form-group"
                />

                <div className="form-actions flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                  <Button
                    type="button"
                    onClick={handleCloseAddCustomerModal}
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreatingCustomer}
                    variant="primary"
                  >
                    {isCreatingCustomer ? 'Creando...' : 'Crear Cliente'}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </Modal>
      )}
    </Card>
  );
};

export default CustomerSelectionStep;
