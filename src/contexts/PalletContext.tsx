import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  Pallet,
  Location,
  CreateLooseEggPalletRequest,
  PaginatedResponse,
} from '@/types';
import {
  getPallets,
  createPallet,
  updatePalletStatus,
  deletePallet,
  getClosedPallets,
  getActivePallets,
  movePallet,
  createLooseEggPallet as createLooseEggPalletApi,
} from '@/api/endpoints';

// Simple state interface
interface PalletState {
  openPallets: Pallet[];
  closedPalletsInPacking: Pallet[];
  closedPalletsInTransit: Pallet[];
  closedPalletsInBodega: Pallet[];
  selectedPallet: Pallet | null;
  loading: boolean;
  error: string | null;
}

// Simple context interface
interface PalletContextType {
  openPallets: Pallet[];
  closedPalletsInPacking: Pallet[];
  closedPalletsInTransit: Pallet[];
  closedPalletsInBodega: Pallet[];
  selectedPallet: Pallet | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchPallets: (status?: string, location?: Location) => Promise<void>;
  fetchActivePallets: () => Promise<void>;
  fetchClosedPalletsInPacking: (opts?: {
    fechaDesde?: string;
    fechaHasta?: string;
    limit?: number;
  }) => Promise<void>;
  fetchClosedPalletsInTransit: () => Promise<void>;
  fetchClosedPalletsInBodega: () => Promise<void>;

  selectPallet: (pallet: Pallet) => void;
  clearSelectedPallet: () => void;
  createPallet: (
    data: Partial<Pallet> & { maxBoxes?: number }
  ) => Promise<Pallet>;
  updatePallet: (id: string, data: Partial<Pallet>) => Promise<Pallet>;
  deletePallet: (id: string) => Promise<void>;
  closePallet: (codigo: string) => Promise<void>;
  movePallet: (codigo: string, location: Location) => Promise<void>;
  createLooseEggPallet: (data: CreateLooseEggPalletRequest) => Promise<Pallet>;
}

// Create context
const PalletContext = createContext<PalletContextType | undefined>(undefined);

// Initial state
const initialState: PalletState = {
  openPallets: [],
  closedPalletsInPacking: [],
  closedPalletsInTransit: [],
  closedPalletsInBodega: [],
  selectedPallet: null,
  loading: false,
  error: null,
};

// Provider component
export const PalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<PalletState>(initialState);

  // Fetch pallets with optional filtering
  const fetchPallets = useCallback(
    async (status?: string, location?: Location) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        let response: PaginatedResponse<Pallet>;

        const defaultLocation: Location = 'PACKING';
        const targetLocation: Location = location || defaultLocation;

        if (status === 'active') {
          response = await getActivePallets({
            ubicacion: targetLocation,
          });
        } else if (status === 'completed') {
          response = await getClosedPallets({
            ubicacion: targetLocation,
          });
        } else {
          response = await getPallets();
        }

        const pallets = response.data?.items || [];

        setState((prev) => ({
          ...prev,
          openPallets: status === 'active' ? pallets : prev.openPallets,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error desconocido',
          loading: false,
        }));
      }
    },
    []
  );

  // Fetch active pallets
  const fetchActivePallets = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const packingLocation: Location = 'PACKING';
      const response: PaginatedResponse<Pallet> = await getActivePallets({
        ubicacion: packingLocation,
        limit: 50,
      });

      const pallets = response.data?.items || [];

      setState((prev) => ({
        ...prev,
        openPallets: pallets,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Error al cargar pallets activos',
        loading: false,
      }));
    }
  }, []);

  // Fetch closed pallets in packing
  const fetchClosedPalletsInPacking = useCallback(
    async (opts?: {
      fechaDesde?: string;
      fechaHasta?: string;
      limit?: number;
    }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        let response: PaginatedResponse<Pallet>;

        // Si hay filtros de fecha, usamos el endpoint general con estado
        if (opts?.fechaDesde || opts?.fechaHasta) {
          response = await getPallets({
            estado: 'closed',
            ubicacion: 'PACKING',
            fechaDesde: opts?.fechaDesde,
            fechaHasta: opts?.fechaHasta,
            limit: opts?.limit ?? 50,
          } as any);
        } else {
          response = await getClosedPallets({
            ubicacion: 'PACKING' as const,
            limit: opts?.limit ?? 50,
          });
        }

        const pallets = response.data?.items || [];

        setState((prev) => ({
          ...prev,
          closedPalletsInPacking: pallets,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Error al cargar pallets cerrados en packing',
          loading: false,
        }));
      }
    },
    []
  );

  // Fetch closed pallets in transit
  const fetchClosedPalletsInTransit = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: PaginatedResponse<Pallet> = await getClosedPallets({
        ubicacion: 'TRANSITO' as Location,
        limit: 50,
      });

      const pallets = response.data?.items || [];

      setState((prev) => ({
        ...prev,
        closedPalletsInTransit: pallets,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Error al cargar pallets cerrados en tránsito',
        loading: false,
      }));
    }
  }, []);

  // Fetch closed pallets in bodega
  const fetchClosedPalletsInBodega = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: PaginatedResponse<Pallet> = await getClosedPallets({
        ubicacion: 'BODEGA' as Location,
        limit: 50,
      });

      const pallets = response.data?.items || [];

      setState((prev) => ({
        ...prev,
        closedPalletsInBodega: pallets,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Error al cargar pallets cerrados en bodega',
        loading: false,
      }));
    }
  }, []);

  // Select a pallet
  const selectPallet = useCallback((pallet: Pallet) => {
    setState((prev) => ({ ...prev, selectedPallet: pallet }));
  }, []);

  // Clear selected pallet
  const clearSelectedPallet = useCallback(() => {
    setState((prev) => ({ ...prev, selectedPallet: null }));
  }, []);

  // Create pallet
  const createPalletAction = useCallback(
    async (data: Partial<Pallet> & { maxBoxes?: number }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const newPallet = await createPallet(
          data.baseCode || '',
          typeof data.maxBoxes === 'number' && data.maxBoxes > 0
            ? data.maxBoxes
            : 48
        );
        setState((prev) => ({
          ...prev,
          openPallets: [...prev.openPallets, newPallet],
          loading: false,
        }));
        return newPallet;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Error al crear pallet',
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  // Create loose-egg pallet
  const createLooseEggPalletAction = useCallback(
    async (data: CreateLooseEggPalletRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const newPallet = await createLooseEggPalletApi({
          codigo: data.codigo,
          ubicacion: data.ubicacion || 'PACKING',
          carts: data.carts,
          trays: data.trays,
          eggs: data.eggs,
        });
        setState((prev) => ({
          ...prev,
          openPallets: [...prev.openPallets, newPallet],
          loading: false,
        }));
        return newPallet;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Error al crear pallet de huevo suelto',
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  // Update pallet
  const updatePalletAction = useCallback(
    async (id: string, data: Partial<Pallet>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const updatedPallet = await updatePalletStatus(
          id,
          data.estado || 'open'
        );
        setState((prev) => ({
          ...prev,
          openPallets: prev.openPallets.map((p: Pallet) =>
            p.codigo === id ? updatedPallet : p
          ),
          closedPalletsInPacking: prev.closedPalletsInPacking.map(
            (p: Pallet) => (p.codigo === id ? updatedPallet : p)
          ),
          closedPalletsInTransit: prev.closedPalletsInTransit.map(
            (p: Pallet) => (p.codigo === id ? updatedPallet : p)
          ),
          closedPalletsInBodega: prev.closedPalletsInBodega.map((p: Pallet) =>
            p.codigo === id ? updatedPallet : p
          ),
          selectedPallet:
            prev.selectedPallet?.codigo === id
              ? updatedPallet
              : prev.selectedPallet,
          loading: false,
        }));
        return updatedPallet;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Error al actualizar pallet',
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  // Delete pallet
  const deletePalletAction = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await deletePallet(id);
      setState((prev) => ({
        ...prev,
        openPallets: prev.openPallets.filter((p: Pallet) => p.codigo !== id),
        closedPalletsInPacking: prev.closedPalletsInPacking.filter(
          (p: Pallet) => p.codigo !== id
        ),
        closedPalletsInTransit: prev.closedPalletsInTransit.filter(
          (p: Pallet) => p.codigo !== id
        ),
        closedPalletsInBodega: prev.closedPalletsInBodega.filter(
          (p: Pallet) => p.codigo !== id
        ),
        selectedPallet:
          prev.selectedPallet?.codigo === id ? null : prev.selectedPallet,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Error al eliminar pallet',
        loading: false,
      }));
      throw error;
    }
  }, []);

  // Close pallet
  const closePalletAction = useCallback(async (codigo: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await updatePalletStatus(codigo, 'CERRADO');
      setState((prev) => ({
        ...prev,
        openPallets: prev.openPallets.filter(
          (p: Pallet) => p.codigo !== codigo
        ),
        closedPalletsInPacking: prev.closedPalletsInPacking.filter(
          (p: Pallet) => p.codigo !== codigo
        ),
        closedPalletsInTransit: prev.closedPalletsInTransit.filter(
          (p: Pallet) => p.codigo !== codigo
        ),
        closedPalletsInBodega: prev.closedPalletsInBodega.filter(
          (p: Pallet) => p.codigo !== codigo
        ),
        selectedPallet:
          prev.selectedPallet?.codigo === codigo ? null : prev.selectedPallet,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Error al cerrar pallet',
        loading: false,
      }));
      throw error;
    }
  }, []);

  // Move pallet
  const movePalletAction = useCallback(
    async (codigo: string, location: Location) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const updatedPallet = await movePallet(codigo, location);
        setState((prev) => ({
          ...prev,
          openPallets: prev.openPallets.map((p: Pallet) =>
            p.codigo === codigo ? updatedPallet : p
          ),
          closedPalletsInPacking: prev.closedPalletsInPacking.map(
            (p: Pallet) => (p.codigo === codigo ? updatedPallet : p)
          ),
          closedPalletsInTransit: prev.closedPalletsInTransit.map(
            (p: Pallet) => (p.codigo === codigo ? updatedPallet : p)
          ),
          selectedPallet:
            prev.selectedPallet?.codigo === codigo
              ? updatedPallet
              : prev.selectedPallet,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Error al mover pallet',
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  const value: PalletContextType = {
    openPallets: state.openPallets,
    closedPalletsInPacking: state.closedPalletsInPacking,
    closedPalletsInTransit: state.closedPalletsInTransit,
    closedPalletsInBodega: state.closedPalletsInBodega,
    selectedPallet: state.selectedPallet,
    loading: state.loading,
    error: state.error,
    fetchPallets,
    fetchActivePallets,
    fetchClosedPalletsInPacking,
    fetchClosedPalletsInTransit,
    fetchClosedPalletsInBodega,
    selectPallet,
    clearSelectedPallet,
    createPallet: createPalletAction,
    updatePallet: updatePalletAction,
    deletePallet: deletePalletAction,
    closePallet: closePalletAction,
    movePallet: movePalletAction,
    createLooseEggPallet: createLooseEggPalletAction,
  };

  return (
    <PalletContext.Provider value={value}>{children}</PalletContext.Provider>
  );
};

// Hook to use the context
export const usePalletContext = () => {
  const context = useContext(PalletContext);
  if (context === undefined) {
    throw new Error('usePalletContext must be used within a PalletProvider');
  }
  return context;
};

// Legacy hooks for backward compatibility
export const useActivePallets = () => {
  const { openPallets, loading, error, fetchActivePallets } =
    usePalletContext();
  return {
    pallets: openPallets,
    loading,
    error,
    fetchActivePallets,
  };
};

export const useClosedPalletsInPacking = () => {
  const {
    closedPalletsInPacking,
    loading,
    error,
    fetchClosedPalletsInPacking,
  } = usePalletContext();
  return {
    pallets: closedPalletsInPacking,
    loading,
    error,
    fetchClosedPalletsInPacking,
  };
};

export const useClosedPalletsInTransit = () => {
  const {
    closedPalletsInTransit,
    loading,
    error,
    fetchClosedPalletsInTransit,
  } = usePalletContext();
  return {
    pallets: closedPalletsInTransit,
    loading,
    error,
    fetchClosedPalletsInTransit,
  };
};

export const useClosedPalletsInBodega = () => {
  const { closedPalletsInBodega, loading, error, fetchClosedPalletsInBodega } =
    usePalletContext();
  return {
    pallets: closedPalletsInBodega,
    loading,
    error,
    fetchClosedPalletsInBodega,
  };
};

export const useClosedPalletsInVenta = () => {
  const { closedPalletsInBodega, loading, error } = usePalletContext();
  return {
    pallets: closedPalletsInBodega, // Using bodega as fallback for venta
    loading,
    error,
    fetchClosedPalletsInVenta: () => Promise.resolve(),
  };
};

export const usePalletLocation = () => {
  return {
    currentLocation: 'PACKING' as Location,
    setLocation: () => {},
  };
};

export const useSelectedPallet = () => {
  const { selectedPallet, selectPallet, clearSelectedPallet } =
    usePalletContext();
  return {
    selectedPallet,
    selectPallet,
    clearSelectedPallet,
  };
};

export const useFilteredPallets = () => {
  const { openPallets } = usePalletContext();
  return {
    pallets: openPallets,
    loading: false,
    error: null,
  };
};

export const usePalletActions = () => {
  const { createPallet, updatePallet, deletePallet, closePallet, movePallet } =
    usePalletContext();

  return {
    createPallet,
    updatePallet,
    deletePallet,
    closePallet,
    movePallet,
  };
};
