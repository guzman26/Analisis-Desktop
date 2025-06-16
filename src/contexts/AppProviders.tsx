import { PalletProvider } from './PalletContext';
import { BoxesProvider } from './BoxesContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <PalletProvider>
      <BoxesProvider>{children}</BoxesProvider>
    </PalletProvider>
  );
};
