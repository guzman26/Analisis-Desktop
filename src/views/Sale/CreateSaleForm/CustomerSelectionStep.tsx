import React, { useState, useEffect, useContext } from 'react';
import { Customer } from '@/types';
import { CustomerContext } from '@/contexts/CustomerContext';

interface CustomerSelectionStepProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
}

export const CustomerSelectionStep: React.FC<CustomerSelectionStepProps> = ({
  selectedCustomer,
  onSelect,
}) => {
  const { customers, fetchCustomers, createCustomerFunction, loading, error } =
    useContext(CustomerContext);

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
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.customerId === customerId);
    if (customer) {
      onSelect(customer);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCustomer(true);

    try {
      const newCustomer = await createCustomerFunction(newCustomerData);
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

  if (loading && customers.length === 0) {
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
        <div className="error">Error: {error}</div>
        <button onClick={fetchCustomers}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="customer-selection-step">
      <h2>Seleccionar Cliente</h2>

      <div className="search-section">
        <label htmlFor="customer-search">Buscar Cliente:</label>
        <input
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
          onChange={(e) => handleCustomerSelect(e.target.value)}
          className="customer-select"
        >
          <option value="">-- Seleccionar un cliente --</option>
          {filteredCustomers.map((customer) => (
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
        <button
          type="button"
          onClick={() => setShowAddCustomerModal(true)}
          className="add-customer-btn"
        >
          + Agregar Nuevo Cliente
        </button>
      </div>

      {showAddCustomerModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Agregar Nuevo Cliente</h3>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="customer-form">
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  value={newCustomerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={newCustomerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono *</label>
                <input
                  type="tel"
                  id="phone"
                  value={newCustomerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input
                  type="text"
                  id="address"
                  value={newCustomerData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="taxId">RUT</label>
                <input
                  type="text"
                  id="taxId"
                  value={newCustomerData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPerson">Persona de Contacto</label>
                <input
                  type="text"
                  id="contactPerson"
                  value={newCustomerData.contactPerson}
                  onChange={(e) =>
                    handleInputChange('contactPerson', e.target.value)
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCustomer}
                  className="submit-btn"
                >
                  {isCreatingCustomer ? 'Creando...' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelectionStep;
