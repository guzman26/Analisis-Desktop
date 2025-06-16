import { Pallet } from '@/types';
import { getPallets } from '@/api/get';
import { createContext, ReactNode, useState, useCallback } from 'react';
import { extractDataFromResponse } from '@/utils/extractDataFromResponse';
import { movePallet } from '@/api/post';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';

interface PalletContextType {
  activePallets: Pallet[];
  fetchActivePallets: () => Promise<void>;
  closedPalletsInPacking: Pallet[];
  fetchClosedPalletsInPacking: () => Promise<void>;
  closedPalletsInTransit: Pallet[];
  fetchClosedPalletsInTransit: () => Promise<void>;
  movePalletFunction: (
    codigo: string,
    ubicacion: 'TRANSITO' | 'BODEGA' | 'VENTA'
  ) => Promise<any>;
  palletsInBodega: Pallet[];
  fetchPalletsInBodega: () => Promise<void>;
}

export const PalletContext = createContext<PalletContextType>(
  {} as PalletContextType
);

interface Props {
  children: ReactNode;
}

export const PalletProvider: React.FC<Props> = ({ children }) => {
  const [activePallets, setActivePallets] = useState<Pallet[]>([]);
  const [closedPalletsInPacking, setClosedPalletsInPacking] = useState<
    Pallet[]
  >([]);
  const [closedPalletsInTransit, setClosedPalletsInTransit] = useState<
    Pallet[]
  >([]);
  const [palletsInBodega, setPalletsInBodega] = useState<Pallet[]>([]);
  // Función auxiliar para procesar pallets y asignarles el calibre
  const processPalletsWithCalibre = useCallback(
    (pallets: Pallet[]): Pallet[] => {
      return pallets.map((pallet) => ({
        ...pallet,
        calibre: getCalibreFromCodigo(pallet.codigo),
      }));
    },
    []
  );

  const fetchActivePallets = useCallback(async () => {
    const response = await getPallets({ estado: 'open' });
    const pallets = extractDataFromResponse(response);
    const palletsWithCalibre = processPalletsWithCalibre(pallets);
    setActivePallets(palletsWithCalibre);
  }, [processPalletsWithCalibre]);

  const fetchClosedPalletsInPacking = useCallback(async () => {
    const response = await getPallets({
      estado: 'closed',
      ubicacion: 'PACKING',
    });
    const pallets = extractDataFromResponse(response);
    const palletsWithCalibre = processPalletsWithCalibre(pallets);
    setClosedPalletsInPacking(palletsWithCalibre);
  }, [processPalletsWithCalibre]);

  const fetchClosedPalletsInTransit = useCallback(async () => {
    const response = await getPallets({
      estado: 'closed',
      ubicacion: 'TRANSITO',
    });
    const pallets = extractDataFromResponse(response);
    const palletsWithCalibre = processPalletsWithCalibre(pallets);
    setClosedPalletsInTransit(palletsWithCalibre);
  }, [processPalletsWithCalibre]);

  const movePalletFunction = useCallback(
    async (codigo: string, ubicacion: 'TRANSITO' | 'BODEGA' | 'VENTA') => {
      return await movePallet(codigo, ubicacion);
    },
    []
  );

  const fetchPalletsInBodega = useCallback(async () => {
    const response = await getPallets({ ubicacion: 'BODEGA' });
    const pallets = extractDataFromResponse(response);
    const palletsWithCalibre = processPalletsWithCalibre(pallets);
    setPalletsInBodega(palletsWithCalibre);
  }, [processPalletsWithCalibre]);

  const value: PalletContextType = {
    activePallets,
    fetchActivePallets,
    closedPalletsInPacking,
    fetchClosedPalletsInPacking,
    closedPalletsInTransit,
    fetchClosedPalletsInTransit,
    movePalletFunction,
    palletsInBodega,
    fetchPalletsInBodega,
  };

  return (
    <PalletContext.Provider value={value}>{children}</PalletContext.Provider>
  );
};
