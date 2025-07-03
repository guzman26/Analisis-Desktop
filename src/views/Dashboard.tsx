import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <h1>Bienvenidos a Lomas Altas</h1>
      <Link to="/openPallets">Open Pallets</Link>
    </div>
  );
};

export default Dashboard;
