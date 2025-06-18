import { createContext, useState, useCallback } from 'react';
import { Box } from '@/types';
import { extractDataFromResponse } from '@/utils/extractDataFromResponse';
import { getUnassignedBoxesByLocation } from '@/api/get';

interface BoxesContextType {
  unassignedBoxesInBodega: Box[];
  fetchUnassignedBoxesInBodega: () => Promise<void>;
  unassignedBoxesInPacking: Box[];
  fetchUnassignedBoxesInPacking: () => Promise<void>;
}

export const BoxesContext = createContext<BoxesContextType>(
  {} as BoxesContextType
);

interface Props {
  children: React.ReactNode;
}

export const BoxesProvider = ({ children }: Props) => {
  const [unassignedBoxesInBodega, setUnassignedBoxesInBodega] = useState<Box[]>(
    []
  );
  const [unassignedBoxesInPacking, setUnassignedBoxesInPacking] = useState<
    Box[]
  >([]);

  const fetchUnassignedBoxesInBodega = useCallback(async () => {
    try {
      const response = await getUnassignedBoxesByLocation('BODEGA');
      const boxes = extractDataFromResponse(response);
      setUnassignedBoxesInBodega(boxes);
    } catch (error) {
      console.error('Error fetching unassigned boxes:', error);
      setUnassignedBoxesInBodega([]);
    }
  }, []);

  const fetchUnassignedBoxesInPacking = useCallback(async () => {
    try {
      const response = await getUnassignedBoxesByLocation('PACKING');
      const boxes = extractDataFromResponse(response);
      setUnassignedBoxesInPacking(boxes);
    } catch (error) {
      console.error('Error fetching unassigned boxes:', error);
      setUnassignedBoxesInPacking([]);
    }
  }, []);

  const value: BoxesContextType = {
    unassignedBoxesInBodega,
    fetchUnassignedBoxesInBodega,
    unassignedBoxesInPacking,
    fetchUnassignedBoxesInPacking,
  };

  return (
    <BoxesContext.Provider value={value}>{children}</BoxesContext.Provider>
  );
};
