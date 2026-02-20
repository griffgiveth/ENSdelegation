import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import confetti from 'canvas-confetti';
import { ArrowRight } from 'lucide-react';
import { Toast } from './Toast';

const ENS_TOKEN_ADDRESS = '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72';
const GRIFF_ADDRESS = '0x839395e20bbB182fa440d08F850E6c7A8f6F0780';

const ENS_TOKEN_ABI = [
  {
    name: 'delegate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'delegatee', type: 'address' }],
    outputs: [],
  },
] as const;

export function DelegateButton({ showSubtext = true }: { showSubtext?: boolean }) {
  const { isConnected } = useAccount();
  const [showToast, setShowToast] = useState(false);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && !showToast) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0080BC', '#00AAFF', '#CEE1E8', '#011A25'],
      });
      setShowToast(true);
    }
  }, [isSuccess, showToast]);

  const handleDelegate = () => {
    try {
      writeContract({
        address: ENS_TOKEN_ADDRESS,
        abi: ENS_TOKEN_ABI,
        functionName: 'delegate',
        args: [GRIFF_ADDRESS],
      });
    } catch (error) {
      console.error('Delegation error:', error);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <>
      {showToast && (
        <Toast message="Welcome to the squad!" onClose={() => setShowToast(false)} />
      )}
      <button
        onClick={handleDelegate}
        disabled={isPending || isConfirming}
        className="group relative inline-flex items-center gap-3 bg-ens-blue hover:bg-ens-blue-mid text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-lg shadow-ens-blue/25 hover:shadow-xl hover:shadow-ens-blue/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
      >
        {isPending || isConfirming ? (
          <span className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            {isPending ? 'Confirm in wallet...' : 'Processing...'}
          </span>
        ) : (
          <>
            Stake Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </>
  );
}
