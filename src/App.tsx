import { BrowserRouter as Router } from 'react-router-dom';
import { RouteRenderer } from './routes/RouteRenderer';
import { AppProviders } from './contexts/AppProviders';
import {
  NotificationProvider,
  NotificationContainer,
} from './components/Notification';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AppProviders>
          <RouteRenderer />
        </AppProviders>
        <NotificationContainer />
      </NotificationProvider>
    </Router>
  );
}

export default App;
