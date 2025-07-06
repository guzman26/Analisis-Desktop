import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { useCustomerContext } from '@/contexts/CustomerContext';
import { Input, Button, Card } from '@/components/design-system';
import { Modal } from '@/components/design-system';
import { Search } from 'lucide-react';

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
  // Ensure we always work with an array
  const customerList: any[] = Array.isArray(customers) ? customers : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    contactPerson: '',
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  useEffect(() => {
    if (customerList.length === 0) {
      customerAPI.fetchCustomers();
    }
  }, [customerList.length, customerAPI]);

  const filteredCustomers = customerList.filter(
    (customer: any) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  const handleCustomerSelect = (customerId: string) => {
    const customer = customerList.find((c: any) => c.customerId === customerId);
    if (customer) {
      onSelect(customer);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCustomer(true);

    try {
      const newCustomer = await customerAPI.createCustomer(newCustomerData);
      onSelect(newCustomer);
      setShowAddCustomerModal(false);
      setNewCustomerData({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        contactPerson: '',
      });
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewCustomerData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        <button onClick={customerAPI.fetchCustomers}>Reintentar</button>
      </div>
    );
  }

  return (
    <Card className="customer-selection-step p-6" variant="elevated">
      <h2 className="text-xl font-medium mb-4">Seleccionar Cliente</h2>

      <div className="search-section mb-4">
        <label htmlFor="customer-search" className="block text-sm font-medium mb-2">Buscar Cliente:</label>
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
        <label htmlFor="customer-select" className="block text-sm font-medium mb-2">Seleccionar Cliente:</label>
        <Card className="max-h-60 overflow-y-auto">
          <div className="py-2">
            {filteredCustomers.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No se encontraron clientes</p>
            ) : (
              filteredCustomers.map((customer: any) => (
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
                  <p className="font-medium">{selectedCustomer.contactPerson}</p>
                </div>
              )}
            </div>
          </div>
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
        <Modal isOpen={showAddCustomerModal} onClose={() => setShowAddCustomerModal(false)}>
          <Card variant="elevated" className="p-0">
            <div className="modal-header flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium">Agregar Nuevo Cliente</h3>
              <Button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                variant="ghost"
                className="p-1 h-8 w-8"
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleAddCustomer} className="customer-form p-4 space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="block text-sm font-medium mb-1">Nombre *</label>
                <Input
                  type="text"
                  id="name"
                  value={newCustomerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  id="email"
                  value={newCustomerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="block text-sm font-medium mb-1">Teléfono *</label>
                <Input
                  type="tel"
                  id="phone"
                  value={newCustomerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address" className="block text-sm font-medium mb-1">Dirección</label>
                <Input
                  type="text"
                  id="address"
                  value={newCustomerData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="form-group">
                <label htmlFor="taxId" className="block text-sm font-medium mb-1">RUT</label>
                <Input
                  type="text"
                  id="taxId"
                  value={newCustomerData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPerson" className="block text-sm font-medium mb-1">Persona de Contacto</label>
                <Input
                  type="text"
                  id="contactPerson"
                  value={newCustomerData.contactPerson}
                  onChange={(e) =>
                    handleInputChange('contactPerson', e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div className="form-actions flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                <Button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
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
          </Card>
        </Modal>
      )}
    </Card>
  );
};

export default CustomerSelectionStep;
