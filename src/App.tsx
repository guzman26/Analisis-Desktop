import { BrowserRouter as Router } from 'react-router-dom';
import { RouteRenderer } from './routes/RouteRenderer';
import { AppProviders } from './contexts/AppProviders';

function App() {
  return (
    <Router>
      <AppProviders>
        <RouteRenderer />
      </AppProviders>
    </Router>
  );
}

export default App;
