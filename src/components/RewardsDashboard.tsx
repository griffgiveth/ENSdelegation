import { useState, useEffect, type ReactNode } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Info,
  Sprout,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Toast } from './Toast';

const ENS_TOKEN_ADDRESS = '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72' as const;
const GRIFF_ADDRESS = '0x839395e20bbB182fa440d08F850E6c7A8f6F0780' as const;

const ENS_TOKEN_ABI = [
  {
    name: 'delegate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'delegatee', type: 'address' }],
    outputs: [],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'delegates',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function MetricCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-3 md:p-4 text-center transition-all duration-300 hover:-translate-y-0.5 ${
        accent
          ? 'bg-[#387AF5]/5 border border-[#387AF5]/15'
          : 'bg-white/50 border border-ens-blue-light/25'
      }`}
    >
      <div
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-1.5 ${
          accent
            ? 'bg-[#387AF5]/10 text-[#387AF5]'
            : 'bg-ens-blue-pale text-ens-blue-dark/40'
        }`}
      >
        {icon}
      </div>
      <p className="text-[10px] md:text-xs font-medium text-ens-blue-dark/45 mb-0.5">
        {label}
      </p>
      <p
        className={`text-base md:text-lg font-bold ${
          accent ? 'text-[#387AF5]' : 'text-ens-blue-dark'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function RewardsDashboard() {
  const { isConnected, address } = useAccount();
  const [userStaked, setUserStaked] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [aprData, setAprData] = useState<{ aprPercent: number; monthlyDelegatorPool: number; totalEligibleSupply: number } | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    const fetchApr = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/ens-apr`, {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data.aprPercent !== undefined) {
          setAprData({
            aprPercent: data.aprPercent,
            monthlyDelegatorPool: data.monthlyDelegatorPool,
            totalEligibleSupply: data.totalEligibleSupply,
          });
        }
      } catch {
        // fallback handled by null state
      }
    };
    fetchApr();
  }, []);

  const aprPercent = aprData ? aprData.aprPercent.toFixed(1) : '--';
  const apr = aprData ? aprData.aprPercent / 100 : 0;
  const stakedAmount = parseFloat(userStaked) || 0;
  const monthlyRewards = stakedAmount * (apr / 12);

  useEffect(() => {
    if (isSuccess && !showToast) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#387AF5', '#0080BC', '#00AAFF', '#CEE1E8'],
      });
      setShowToast(true);
    }
  }, [isSuccess, showToast]);

  const handleStake = () => {
    writeContract({
      address: ENS_TOKEN_ADDRESS,
      abi: ENS_TOKEN_ABI,
      functionName: 'delegate',
      args: [GRIFF_ADDRESS],
    });
  };

  const handleUnstake = () => {
    if (!address) return;
    writeContract({
      address: ENS_TOKEN_ADDRESS,
      abi: ENS_TOKEN_ABI,
      functionName: 'delegate',
      args: [address],
    });
  };

  const { data: ensBalanceRaw } = useReadContract({
    address: ENS_TOKEN_ADDRESS,
    abi: ENS_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: currentDelegate } = useReadContract({
    address: ENS_TOKEN_ADDRESS,
    abi: ENS_TOKEN_ABI,
    functionName: 'delegates',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const ensBalance = ensBalanceRaw != null ? parseFloat(formatUnits(ensBalanceRaw, 18)) : 0;
  const isDelegatedToGriff = currentDelegate?.toLowerCase() === GRIFF_ADDRESS.toLowerCase();
  const availableToStake = isDelegatedToGriff ? 0 : ensBalance;
  const currentlyStaked = isDelegatedToGriff ? ensBalance : 0;

  const formatBalance = (val: number) => {
    if (val === 0) return '0';
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  };

  const isProcessing = isPending || isConfirming;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {showToast && (
        <Toast
          message="Transaction successful!"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-ens-blue-dark tracking-tight">
          Rewards <span className="text-gradient-ens">Dashboard</span>
        </h2>
        <p className="mt-2 text-ens-blue-dark/50 max-w-md mx-auto">
          Track your staking rewards and manage your ENS position
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="dashboard-glass rounded-3xl p-8 md:p-10 relative overflow-hidden animate-fade-up">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#387AF5]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-ens-blue-vivid/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-ens-blue-dark">
                Your Staking Stats
              </h3>
              <div className="mt-2 h-0.5 w-12 mx-auto bg-gradient-to-r from-transparent via-[#387AF5]/40 to-transparent rounded-full" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-0.5 bg-[#387AF5]/5 border border-[#387AF5]/15">
                <p className="text-xs md:text-sm font-medium text-ens-blue-dark/45 mb-1">
                  Current APR
                </p>
                <p className="text-2xl md:text-3xl font-bold text-[#387AF5]">
                  {aprPercent}%
                </p>
              </div>
              <MetricCard
                icon={<img src="/token.png" alt="Token" className="w-5 h-5 object-contain" />}
                label="Claimable"
                value="0.00 ENS"
              />
              <MetricCard
                icon={<img src="/enslogodark.png" alt="ENS" className="w-5 h-5 object-contain" />}
                label="Total Staked"
                value={`${formatBalance(currentlyStaked)} ENS`}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-ens-blue-dark/60 mb-2">
                Your ENS Balance
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={userStaked}
                  onChange={(e) => setUserStaked(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className="w-full bg-white/80 border border-ens-blue-light/50 rounded-2xl px-5 py-4 pr-16 text-lg font-semibold text-ens-blue-dark placeholder-ens-blue-dark/25 focus:outline-none focus:ring-2 focus:ring-[#387AF5]/20 focus:border-[#387AF5]/30 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-ens-blue-dark/35">
                  ENS
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between px-1">
                <span className="text-sm text-ens-blue-dark/45">
                  Est. Monthly Rewards
                </span>
                <span className="text-sm font-bold text-[#387AF5]">
                  {monthlyRewards.toFixed(2)} ENS
                </span>
              </div>
            </div>

            {!isConnected ? (
              <div className="flex justify-center py-2">
                <ConnectButton />
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#2563eb] via-[#387AF5] to-[#06b6d4] text-white font-bold text-lg shadow-lg shadow-[#387AF5]/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                >
                  <Sprout size={20} />
                  Harvest Rewards
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleStake}
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-full bg-[#387AF5] hover:bg-[#387AF5]/90 text-white font-semibold shadow-md shadow-[#387AF5]/15 hover:shadow-lg hover:shadow-[#387AF5]/25 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <ArrowDownToLine size={16} />
                          Stake
                        </>
                      )}
                    </button>
                    <span className="mt-1.5 text-xs font-medium text-ens-blue-dark/45">
                      {formatBalance(availableToStake)} ENS available
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleUnstake}
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-full border-2 border-ens-blue-light/60 hover:border-[#387AF5]/30 text-ens-blue-dark/60 hover:text-ens-blue-dark font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="animate-spin h-4 w-4 border-2 border-ens-blue-dark/30 border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <ArrowUpFromLine size={16} />
                          Unstake
                        </>
                      )}
                    </button>
                    <span className="mt-1.5 text-xs font-medium text-ens-blue-dark/45">
                      {formatBalance(currentlyStaked)} ENS staked
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-start gap-2.5 bg-ens-blue-pale/50 rounded-xl p-3">
              <Info size={14} className="text-ens-blue/60 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-ens-blue-dark/45 leading-relaxed">
                Your reward is based on your average ENS balance over 180 days,
                as per the ENS DAO Delegation Incentives Program.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
