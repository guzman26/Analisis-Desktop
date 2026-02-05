import { BrowserRouter as Router } from 'react-router-dom';
import { RouteRenderer } from './routes/RouteRenderer';
import { AppProviders } from './contexts/AppProviders';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <Router>
      <AppProviders>
        <RouteRenderer />
      </AppProviders>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
