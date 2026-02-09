import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCustomerContext } from '@/contexts/CustomerContext';
import { useNotifications } from '@/components/Notification/Notification';
import { Customer, CustomerStatus } from '@/types';
import {
  DataTable,
  DataTableColumn,
  SortDirection,
  Card,
  Button,
  LoadingOverlay,
  EditableCell,
  Input,
} from '@/components/design-system';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Trash2, ShoppingCart, FileText, Download } from 'lucide-react';

const CustomersTable: React.FC = () => {
  const navigate = useNavigate();
  const [state, customerAPI] = useCustomerContext();
  const { customers, status, error } = state;
  const { showSuccess, showError } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'ALL'>(
    'ALL'
  );
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (customers.length === 0 && status === 'idle') {
      customerAPI.fetchCustomers();
    }
  }, [customers.length, status, customerAPI]);

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

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'El teléfono es requerido';
    }
    return null;
  };

  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return 'El nombre es requerido';
    }
    return null;
  };

  const handleFieldUpdate = async (
    customerId: string,
    field: keyof Customer,
    newValue: string
  ) => {
    try {
      await customerAPI.updateCustomer(customerId, { [field]: newValue });
    } catch (updateError) {
      const errorMessage =
        updateError instanceof Error
          ? updateError.message
          : 'Error al actualizar cliente';
      throw new Error(errorMessage);
    }
  };

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
      await customerAPI.fetchCustomers();
    } catch (deleteError) {
      const errorMessage =
        deleteError instanceof Error
          ? deleteError.message
          : 'Error al eliminar cliente';
      showError(errorMessage);
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(
        (customer) => customer.status === statusFilter
      );
    }

    return filtered;
  }, [customers, searchTerm, statusFilter]);

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
    link.setAttribute(
      'download',
      `clientes_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Clientes exportados exitosamente');
  };

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
          onUpdate={(newValue) =>
            handleFieldUpdate(customer.customerId, 'name', newValue)
          }
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
          onUpdate={(newValue) =>
            handleFieldUpdate(customer.customerId, 'email', newValue)
          }
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
          onUpdate={(newValue) =>
            handleFieldUpdate(customer.customerId, 'phone', newValue)
          }
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
          onUpdate={(newValue) =>
            handleFieldUpdate(customer.customerId, 'address', newValue)
          }
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
          onUpdate={(newValue) =>
            handleFieldUpdate(customer.customerId, 'taxId', newValue)
          }
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
            handleFieldUpdate(
              customer.customerId,
              'status',
              newValue as CustomerStatus
            )
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
      width: '12%',
      align: 'right',
      renderCell: (customer) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="small"
            className="h-8 w-8 p-0"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              navigate(`/sales/new?customerId=${customer.customerId}`);
            }}
            title="Crear venta para este cliente"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="small"
            className="h-8 w-8 p-0"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              showSuccess(`Ver historial de ${customer.name}`);
            }}
            title="Ver historial de compras"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="small"
            className="h-8 w-8 p-0"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              handleDelete(customer.customerId, customer.name);
            }}
            disabled={deletingCustomerId === customer.customerId}
            title="Eliminar cliente"
          >
            <Trash2 className="h-4 w-4" />
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
    <div className="v2-page space-y-6 p-2">
      <LoadingOverlay
        show={status === 'loading' && customers.length === 0}
        text="Cargando clientes..."
      />

      <Card variant="flat" className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Gestión de Clientes</h1>
            <p className="text-sm text-muted-foreground">
              Edite los campos directamente en la tabla. Los cambios se guardan
              automáticamente.
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              leftIcon={<Download className="h-4 w-4" />}
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

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            containerClassName="w-full md:max-w-md"
          />

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as CustomerStatus | 'ALL')
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="INACTIVE">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card variant="default" padding="medium" className="space-y-4">
        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <p className="mb-3 text-sm text-destructive">
              Error al cargar clientes: {error.message}
            </p>
            <Button
              variant="secondary"
              onClick={() => customerAPI.fetchCustomers()}
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredAndSortedCustomers.length} de{' '}
              {customers.length} cliente(s)
            </p>
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
