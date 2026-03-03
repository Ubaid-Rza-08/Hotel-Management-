import { useState } from 'react';
import { Search, Shield } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  HERO  (home-page search banner)
// ─────────────────────────────────────────────────────────────
export const Hero = ({ setView }) => {
  const [q, setQ] = useState('');

  return (
    <div className="bg-[#003580] pt-8 pb-14">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-1">Find your next stay</h1>
        <p className="text-blue-200 text-sm mb-7">Search deals on hotels, homes, and much more…</p>

        <div className="bg-[#FFD700] p-1.5 rounded-2xl shadow-2xl">
          <div className="bg-white rounded-xl flex flex-col sm:flex-row overflow-hidden">
            <div className="flex-1 flex items-center gap-2 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-gray-200">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input placeholder="Where are you going?" value={q}
                onChange={e => setQ(e.target.value)}
                className="flex-1 text-sm outline-none placeholder-gray-400" />
            </div>
            <button onClick={() => setView('explore')}
              className="px-8 py-3.5 bg-[#003580] text-white font-bold text-sm hover:bg-[#00266a] transition-colors">
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {['Hotels', 'Apartments', 'Villas', 'Hostels', 'Resorts'].map(t => (
            <button key={t} onClick={() => setView('explore')}
              className="px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-medium hover:bg-white/15 transition-colors">
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────────────────────────
export const Footer = () => (
  <footer className="bg-[#003580] mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-black text-xl text-white">
          booking<span className="text-[#FFD700]">.</span>pro
        </span>
        <p className="text-blue-200/70 text-xs text-center">
          © 2025 BookingPro · Hotel Management Platform · Powered by Razorpay
        </p>
        <div className="flex items-center gap-2 text-blue-200/70 text-xs">
          <Shield className="w-4 h-4 text-[#FFD700]" />
          <span>256-bit SSL Secured</span>
        </div>
      </div>
    </div>
  </footer>
);
