import { PalletProvider } from './PalletContext';
import { BoxesProvider } from './BoxesContext';
import { CustomerProvider } from './CustomerContext';
import { SalesProvider } from './SalesContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <PalletProvider>
      <BoxesProvider>
        <CustomerProvider>
          <SalesProvider>{children}</SalesProvider>
        </CustomerProvider>
      </BoxesProvider>
    </PalletProvider>
  );
};
