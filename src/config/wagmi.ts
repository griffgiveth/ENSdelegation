import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Delegate to Griff',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet],
  ssr: false,
});
