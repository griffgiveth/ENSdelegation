import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChevronDown } from 'lucide-react';

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="inline-flex items-center gap-2 bg-ens-blue hover:bg-ens-blue-mid text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-ens-blue/20"
              >
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                Wrong network
              </button>
            ) : (
              <button
                onClick={openAccountModal}
                className="inline-flex items-center gap-2.5 bg-ens-blue-pale hover:bg-ens-blue-light border border-ens-blue-light/50 hover:border-ens-blue/30 text-ens-blue-dark font-medium text-sm pl-3 pr-4 py-2 rounded-xl transition-all duration-200"
              >
                {account.ensAvatar ? (
                  <img
                    src={account.ensAvatar}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-ens-blue/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ens-blue to-ens-blue-vivid ring-2 ring-ens-blue/20" />
                )}
                <span>{account.ensName || account.displayName}</span>
                <ChevronDown size={14} className="text-ens-blue-dark/40" />
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
