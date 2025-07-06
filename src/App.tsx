import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Add other routes here */}
      </Routes>
    </Layout>
  );
}

export default App;
