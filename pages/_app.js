import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { chains, wagmiConfig } from '@/lib/web3';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
          <Toaster position="top-right" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
} 