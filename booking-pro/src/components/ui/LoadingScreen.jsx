import { Spin } from './index';

// ─────────────────────────────────────────────────────────────
//  LOADING SCREEN  (shown while AuthProvider checks session)
// ─────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#003580] flex flex-col items-center justify-center gap-5">
    <span className="font-black text-3xl text-white">
      booking<span className="text-[#FFD700]">.</span>pro
    </span>
    <Spin cls="w-8 h-8 text-[#FFD700]" />
  </div>
);

export default LoadingScreen;
