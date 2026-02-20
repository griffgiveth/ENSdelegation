export function HeroPortrait() {
  return (
    <div className="relative flex items-center justify-center animate-scale-in">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-ens-blue orb-glow animate-float" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-ens-blue-vivid orb-glow animate-float-delayed top-10 -right-10" />
      <div className="absolute w-[250px] h-[250px] rounded-full bg-ens-blue-light orb-glow animate-float-slow -bottom-5 -left-10" />

      <div className="relative z-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-ens-blue via-ens-blue-vivid to-ens-blue rounded-3xl opacity-50 group-hover:opacity-75 blur-sm transition-opacity duration-500" />
          <div className="relative bg-white rounded-3xl p-2 shadow-2xl">
            <img
              src="/grifftelegram_(1).jpg"
              alt="Griff Green"
              className="w-full max-w-[420px] rounded-2xl object-cover aspect-square"
            />
          </div>
        </div>

        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card rounded-full px-6 py-2.5 shadow-lg">
          <span className="text-ens-blue-dark font-bold text-lg tracking-tight">griff.eth</span>
        </div>
      </div>
    </div>
  );
}
