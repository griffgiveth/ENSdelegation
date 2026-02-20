import { Twitter, ExternalLink } from 'lucide-react';
import { HeroPortrait } from './HeroPortrait';
import { DelegateButton } from './DelegateButton';
import { WalletButton } from './WalletButton';
import { RewardsDashboard } from './RewardsDashboard';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white bg-grid relative overflow-hidden">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-ens-blue-light/40 orb-glow -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-ens-blue/20 orb-glow translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-ens-blue-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <img src="/ens-logo-Blue.png" alt="ENS" className="h-8 w-auto" />
          <WalletButton />
        </div>
      </nav>

      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 animate-fade-up flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-ens-blue-pale border border-ens-blue-light rounded-full px-4 py-1.5 w-fit">
                <div className="w-2 h-2 rounded-full bg-ens-blue animate-pulse" />
                <span className="text-ens-blue text-sm font-semibold">ENS Staking</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-ens-blue-dark leading-[1.05] tracking-tight">
                Your ENS can do more than <span className="text-gradient-ens">just sit there.</span>
              </h1>
              <p className="text-xl text-ens-blue-dark/60 font-normal max-w-lg leading-relaxed">
                I'm here to make sure we keep ENS censorship-resistant and decentralized. I'll keep your stake active, which is all you need to do to start earning from the <a href="https://snapshot.box/#/s:ens.eth/proposal/0xf0ad5ad5a1ee353a65424a83e74f2b8846b16885a4be99af26b5162bfa78c644" target="_blank" rel="noopener noreferrer" className="text-ens-blue underline hover:text-ens-blue-dark transition-colors">new program</a>.
              </p>
            </div>

            <div className="hidden lg:block">
              <HeroPortrait />
            </div>
          </div>
        </section>

        <RewardsDashboard />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-ens-blue-dark mb-4 tracking-tight">
              White Hat and a <span className="text-gradient-ens">Builder.</span>
            </h2>
            <p className="text-lg text-ens-blue-dark/50 max-w-2xl mx-auto leading-relaxed">
              I've spent the last decade building public goods like Giveth and DAppNode. I also helped coordinate the rescue of millions during the Parity and TheDAO hacks. I'm stewarding TheDAO Security Fund for Ethereum's security, helping ENS and the wider ecosystem remain unstoppable.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ens-blue-dark via-ens-blue-mid to-ens-blue p-12 md:p-16">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-ens-blue-vivid/20 blur-[100px] translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-ens-blue-light/10 blur-[80px] -translate-x-1/4 translate-y-1/4" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="lg:hidden flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-1 bg-white/20 rounded-2xl blur-sm" />
                  <img
                    src="/grifftelegram_(1).jpg"
                    alt="Griff Green"
                    className="relative w-48 h-48 rounded-2xl object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Ready to stake?
                </h3>
                <p className="text-ens-blue-light text-lg max-w-md leading-relaxed">
                  Your tokens should be working for you. I'll keep your voting record perfect to earn you incentives while I fight to increase the protocol and token's long-term value.
                </p>
              </div>
              <div className="flex-shrink-0">
                <DelegateButton showSubtext={false} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-ens-blue-light/30 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div />
            <a
              href="https://x.com/griffgreen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-ens-blue-dark/50 hover:text-ens-blue transition-colors text-sm group"
            >
              <Twitter size={16} />
              <span>@griffgreen</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
