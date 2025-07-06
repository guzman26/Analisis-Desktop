import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { useCustomerContext } from '@/contexts/CustomerContext';
import { Input, Button } from '@/components/design-system';
import { Modal } from '@/components/design-system';

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
    <div className="customer-selection-step">
      <h2>Seleccionar Cliente</h2>

      <div className="search-section">
        <label htmlFor="customer-search">Buscar Cliente:</label>
        <Input
          type="search"
          id="customer-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="search-input"
        />
      </div>

      <div className="customer-list-section">
        <label htmlFor="customer-select">Seleccionar Cliente:</label>
        <select
          id="customer-select"
          value={selectedCustomer?.customerId || ''}
          onChange={(e: any) => handleCustomerSelect(e.target.value)}
          className="customer-select"
        >
          <option value="">-- Seleccionar un cliente --</option>
          {filteredCustomers.map((customer: any) => (
            <option key={customer.customerId} value={customer.customerId}>
              {customer.name} - {customer.email} - {customer.phone}
            </option>
          ))}
        </select>
      </div>

      {selectedCustomer && (
        <div>
          <h3>Cliente Seleccionado:</h3>
          <div className="customer-details">
            <p>
              <strong>Nombre:</strong> {selectedCustomer.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedCustomer.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {selectedCustomer.phone}
            </p>
            {selectedCustomer.address && (
              <p>
                <strong>Dirección:</strong> {selectedCustomer.address}
              </p>
            )}
            {selectedCustomer.taxId && (
              <p>
                <strong>RUT:</strong> {selectedCustomer.taxId}
              </p>
            )}
            {selectedCustomer.contactPerson && (
              <p>
                <strong>Persona de Contacto:</strong>{' '}
                {selectedCustomer.contactPerson}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="add-customer-section">
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
          <div className="modal">
            <div className="modal-header">
              <h3>Agregar Nuevo Cliente</h3>
              <Button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                variant="secondary"
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleAddCustomer} className="customer-form">
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <Input
                  type="text"
                  id="name"
                  value={newCustomerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <Input
                  type="email"
                  id="email"
                  value={newCustomerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono *</label>
                <Input
                  type="tel"
                  id="phone"
                  value={newCustomerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <Input
                  type="text"
                  id="address"
                  value={newCustomerData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="taxId">RUT</label>
                <Input
                  type="text"
                  id="taxId"
                  value={newCustomerData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPerson">Persona de Contacto</label>
                <Input
                  type="text"
                  id="contactPerson"
                  value={newCustomerData.contactPerson}
                  onChange={(e) =>
                    handleInputChange('contactPerson', e.target.value)
                  }
                />
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="cancel-btn"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingCustomer}
                  className="submit-btn"
                >
                  {isCreatingCustomer ? 'Creando...' : 'Crear Cliente'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerSelectionStep;
