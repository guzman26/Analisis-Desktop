import { PalletProvider } from './PalletContext';
import { BoxesProvider } from './BoxesContext';
import { CustomerProvider } from './CustomerContext';
import { SalesProvider } from './SalesContext';
import { IssuesProvider } from './IssuesContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <PalletProvider>
      <BoxesProvider>
        <CustomerProvider>
          <SalesProvider>
            <IssuesProvider>{children}</IssuesProvider>
          </SalesProvider>
        </CustomerProvider>
      </BoxesProvider>
    </PalletProvider>
  );
};
