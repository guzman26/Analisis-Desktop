import { PalletProvider } from './PalletContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return <PalletProvider>{children}</PalletProvider>;
};
