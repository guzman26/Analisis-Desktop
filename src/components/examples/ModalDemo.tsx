import React, { useState } from 'react';
import { Modal, Button } from '@/components/design-system';

const ModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleMinimize = () => {
    console.log('Modal minimized');
    // In a real app, you might minimize to dock or hide the modal
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-semibold mb-6">macOS Modal Examples</h2>

      <div className="space-x-4">
        <Button onClick={() => setIsModalOpen(true)}>Basic Modal</Button>

        <Button onClick={() => setIsConfirmOpen(true)} variant="secondary">
          Confirmation Modal
        </Button>

        <Button onClick={() => setIsFormOpen(true)} variant="ghost">
          Form Modal
        </Button>
      </div>

      {/* Basic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        
        title="Información del Sistema"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Este es un ejemplo de modal con estilo macOS auténtico. Incluye:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Barra de título con controles de tráfico</li>
            <li>Efecto de desenfoque en el fondo</li>
            <li>Animaciones suaves</li>
            <li>Tipografía SF Pro</li>
          </ul>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Aceptar</Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar Acción"
        size="small"
        
      >
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar este elemento?
          </p>
          <p className="text-sm text-gray-500">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => setIsConfirmOpen(false)}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        
        title="Nuevo Usuario"
        size="large"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Seleccionar rol...</option>
              <option>Admin</option>
              <option>Usuario</option>
              <option>Invitado</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsFormOpen(false)}>Crear Usuario</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ModalDemo;
