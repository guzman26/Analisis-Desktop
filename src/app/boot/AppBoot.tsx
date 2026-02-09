import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/router';

export const AppBoot = () => {
  return (
    <Router>
      <AppProviders>
        <AppRouter />
      </AppProviders>
      <Toaster position="top-right" richColors />
    </Router>
  );
};
