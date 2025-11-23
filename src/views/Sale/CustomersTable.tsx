import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerContext } from '@/contexts/CustomerContext';
import { useNotifications } from '@/components/Notification/Notification';
import { Customer, CustomerStatus } from '@/types';
import DataTable, { DataTableColumn, SortDirection } from '@/components/design-system/DataTable';
import Card from '@/components/design-system/Card';
import Button from '@/components/design-system/Button';
import EditableCell from '@/components/CustomersTable/EditableCell';
import { Search, Trash2, ShoppingCart, FileText, Download } from 'lucide-react';
import './CustomersTable.css';

const CustomersTable: React.FC = () => {
  const navigate = useNavigate();
  const [state, customerAPI] = useCustomerContext();
  const { customers, status, error } = state;
  const { showSuccess, showError } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'ALL'>('ALL');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  // Cargar clientes al montar
  useEffect(() => {
    if (customers.length === 0 && status === 'idle') {
      customerAPI.fetchCustomers();
    }
  }, [customers.length, status, customerAPI]);

  // Validación de email
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'El email es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'El email no es válido';
    }
    return null;
  };

  // Validación de teléfono
  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'El teléfono es requerido';
    }
    return null;
  };

  // Validación de nombre
  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return 'El nombre es requerido';
    }
    return null;
  };

  // Manejar actualización de campo
  const handleFieldUpdate = async (
    customerId: string,
    field: keyof Customer,
    newValue: string
  ) => {
    try {
      await customerAPI.updateCustomer(customerId, { [field]: newValue });
      // El contexto ya actualiza la lista automáticamente
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al actualizar cliente';
      throw new Error(errorMessage);
    }
  };

  // Manejar eliminación de cliente
  const handleDelete = async (customerId: string, customerName: string) => {
    if (
      !window.confirm(
        `¿Está seguro de que desea eliminar al cliente "${customerName}"?`
      )
    ) {
      return;
    }

    setDeletingCustomerId(customerId);
    try {
      await customerAPI.deleteCustomer(customerId);
      showSuccess(`Cliente "${customerName}" eliminado exitosamente`);
      // Refrescar lista
      await customerAPI.fetchCustomers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al eliminar cliente';
      showError(errorMessage);
    } finally {
      setDeletingCustomerId(null);
    }
  };

  // Filtrar y ordenar clientes
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers;

    // Aplicar búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.phone?.includes(searchTerm)
      );
    }

    // Aplicar filtro de estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((customer) => customer.status === statusFilter);
    }

    return filtered;
  }, [customers, searchTerm, statusFilter]);

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Nombre',
      'Email',
      'Teléfono',
      'Dirección',
      'RUT/NIT',
      'Persona de Contacto',
      'Estado',
      'Total Compras',
      'Última Compra',
    ];

    const rows = filteredAndSortedCustomers.map((customer) => [
      customer.customerId,
      customer.name,
      customer.email,
      customer.phone,
      customer.address || '',
      customer.taxId || '',
      customer.contactPerson || '',
      customer.status,
      customer.totalPurchases || '0',
      customer.lastPurchaseDate || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Clientes exportados exitosamente');
  };

  // Definir columnas
  const columns: DataTableColumn<Customer>[] = [
    {
      id: 'name',
      header: 'Nombre',
      accessor: 'name',
      sortable: true,
      width: '20%',
      renderCell: (customer) => (
        <EditableCell
          value={customer.name}
          onUpdate={(newValue) => handleFieldUpdate(customer.customerId, 'name', newValue)}
          validate={validateName}
          placeholder="Nombre del cliente"
        />
      ),
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      sortable: true,
      width: '18%',
      renderCell: (customer) => (
        <EditableCell
          value={customer.email}
          onUpdate={(newValue) => handleFieldUpdate(customer.customerId, 'email', newValue)}
          type="email"
          validate={validateEmail}
          placeholder="email@ejemplo.com"
        />
      ),
    },
    {
      id: 'phone',
      header: 'Teléfono',
      accessor: 'phone',
      sortable: true,
      width: '12%',
      renderCell: (customer) => (
        <EditableCell
          value={customer.phone}
          onUpdate={(newValue) => handleFieldUpdate(customer.customerId, 'phone', newValue)}
          type="tel"
          validate={validatePhone}
          placeholder="+56 9 1234 5678"
        />
      ),
    },
    {
      id: 'address',
      header: 'Dirección',
      accessor: 'address',
      sortable: false,
      width: '15%',
      renderCell: (customer) => (
        <EditableCell
          value={customer.address || ''}
          onUpdate={(newValue) => handleFieldUpdate(customer.customerId, 'address', newValue)}
          placeholder="Dirección"
        />
      ),
    },
    {
      id: 'taxId',
      header: 'RUT/NIT',
      accessor: 'taxId',
      sortable: false,
      width: '10%',
      renderCell: (customer) => (
        <EditableCell
          value={customer.taxId || ''}
          onUpdate={(newValue) => handleFieldUpdate(customer.customerId, 'taxId', newValue)}
          placeholder="RUT/NIT"
        />
      ),
    },
    {
      id: 'contactPerson',
      header: 'Contacto',
      accessor: 'contactPerson',
      sortable: false,
      width: '12%',
      renderCell: (customer) => (
        <EditableCell
          value={customer.contactPerson || ''}
          onUpdate={(newValue) =>
            handleFieldUpdate(customer.customerId, 'contactPerson', newValue)
          }
          placeholder="Persona de contacto"
        />
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      accessor: 'status',
      sortable: true,
      width: '10%',
      renderCell: (customer) => (
        <EditableCell
          value={customer.status}
          onUpdate={(newValue) =>
            handleFieldUpdate(customer.customerId, 'status', newValue as CustomerStatus)
          }
          type="select"
          options={[
            { value: 'ACTIVE', label: 'Activo' },
            { value: 'INACTIVE', label: 'Inactivo' },
          ]}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      sortable: false,
      width: '15%',
      renderCell: (customer) => (
        <div className="customers-table-actions">
          <Button
            variant="ghost"
            size="small"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              navigate(`/sales/new?customerId=${customer.customerId}`);
            }}
            title="Crear venta para este cliente"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              // TODO: Navegar a historial de compras
              showSuccess(`Ver historial de ${customer.name}`);
            }}
            title="Ver historial de compras"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              handleDelete(customer.customerId, customer.name);
            }}
            disabled={deletingCustomerId === customer.customerId}
            title="Eliminar cliente"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleSortChange = (columnId: string, direction: SortDirection) => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  return (
    <div className="customers-table-page">
      <div className="customers-table-header">
        <div>
          <h1>Gestión de Clientes</h1>
          <p className="customers-table-subtitle">
            Edite los campos directamente en la tabla. Los cambios se guardan automáticamente.
          </p>
        </div>
        <div className="customers-table-header-actions">
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/sales/createCustomer')}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <Card variant="default" padding="medium">
        <div className="customers-table-filters">
          <div className="customers-table-search">
            <Search className="w-4 h-4 customers-table-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="customers-table-search-input"
            />
          </div>
          <div className="customers-table-status-filter">
            <label htmlFor="status-filter">Estado:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'ALL')}
              className="customers-table-status-select"
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
          </div>
        </div>

        {status === 'loading' && customers.length === 0 ? (
          <div className="customers-table-loading">
            <p>Cargando clientes...</p>
          </div>
        ) : error ? (
          <div className="customers-table-error">
            <p>Error al cargar clientes: {error.message}</p>
            <Button variant="secondary" onClick={() => customerAPI.fetchCustomers()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <div className="customers-table-info">
              <span>
                Mostrando {filteredAndSortedCustomers.length} de {customers.length} cliente(s)
              </span>
            </div>
            <DataTable<Customer>
              columns={columns}
              data={filteredAndSortedCustomers}
              getRowId={(customer) => customer.customerId}
              initialSort={{
                columnId: sortColumn,
                direction: sortDirection,
              }}
              onSortChange={handleSortChange}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default CustomersTable;

