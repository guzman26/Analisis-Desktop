import { useContext, useEffect } from 'react';
import { PalletContext } from '@/contexts/PalletContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const {
    activePallets,
    closedPalletsInPacking,
    fetchActivePallets,
    fetchClosedPalletsInPacking,
  } = useContext(PalletContext);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchActivePallets();
        await fetchClosedPalletsInPacking();
      } catch (error) {
        console.error('Error loading pallets:', error);
      }
    };
    loadData();
  }, [fetchActivePallets, fetchClosedPalletsInPacking]);

  useEffect(() => {
    console.warn('Active pallets:', activePallets);
  }, [activePallets]);

  useEffect(() => {
    console.warn('Closed pallets in packing:', closedPalletsInPacking);
  }, [closedPalletsInPacking]);

  return (
    <div>
      <h1>Bienvenidos a Lomas Altas</h1>
      <Link to="/openPallets">Open Pallets</Link>
    </div>
  );
};

export default Dashboard;
