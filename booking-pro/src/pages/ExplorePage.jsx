import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { callApi } from "../api/client";
import { HOTEL_API } from "../api/config";
import { Spin, Empty } from "../components/ui/index";
import HotelCard from '../components/hotel/HotelCard';

// ─────────────────────────────────────────────────────────────
//  EXPLORE PAGE  (public hotel search & listing)
// ─────────────────────────────────────────────────────────────
const ExplorePage = ({ setView }) => { // <-- ADDED setView HERE
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [showAdv, setShowAdv] = useState(false);
  const [filters, setFilters] = useState({ location: '', minRating: '', maxRating: '' });

  useEffect(() => {
    fetchAllHotels();
  }, []);

  const fetchAllHotels = async () => {
    setLoading(true);
    try {
      const d = await callApi(`${HOTEL_API}/public/all`);
      setResults(d.data || []);
      setSearched(false);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    if (!q.trim() && !filters.location) return fetchAllHotels();

    setLoading(true); setSearched(true);
    try {
      const p = new URLSearchParams();
      if (q.trim()) p.set('hotelName', q);
      if (filters.location) p.set('location', filters.location);

      const d = await callApi(`${HOTEL_API}/public/search?${p}`);
      let res = d.data || [];
      
      if (filters.minRating) res = res.filter(h => (h.rating || 0) >= +filters.minRating);
      if (filters.maxRating) res = res.filter(h => (h.rating || 0) <= +filters.maxRating);
      
      setResults(res);
    } catch { 
      setResults([]); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar */}
      <div className="bg-[#003580] py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-black text-white mb-4">Explore Hotels</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                placeholder="Hotel name or location…" 
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]" 
              />
            </div>
            <button onClick={search} disabled={loading}
              className="px-6 py-3.5 bg-[#FFD700] text-[#003580] font-black rounded-xl text-sm hover:bg-yellow-400 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]">
              {loading ? <Spin cls="w-4 h-4 text-[#003580]" /> : 'Search'}
            </button>
          </div>

          <button onClick={() => setShowAdv(v => !v)}
            className="mt-3 flex items-center gap-2 text-blue-200 text-sm font-medium hover:text-white transition-colors">
            <Filter className="w-4 h-4" />{showAdv ? 'Hide' : 'Show'} filters
          </button>

          {showAdv && (
            <div className="mt-3 bg-white rounded-xl p-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Location',   key: 'location',  ph: 'City or area' },
                { label: 'Min Rating', key: 'minRating', ph: '1–5'          },
                { label: 'Max Rating', key: 'maxRating', ph: '1–5'          },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{f.label}</label>
                  <input value={filters[f.key]} onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.ph} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#003580]" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && <div className="flex justify-center py-20"><Spin cls="w-8 h-8 text-[#003580]" /></div>}
        {!loading && results.length === 0 && (
          <Empty icon={Search} title={searched ? "No hotels found" : "No hotels available"}
            desc={searched ? "Try a different search term or remove filters" : "Check back later for new listings!"} />
        )}
        {!loading && results.length > 0 && (
          <>
            <div className="flex justify-between items-end mb-6">
              <p className="text-lg text-gray-800 font-bold">
                {searched ? `${results.length} hotels found` : 'All Available Hotels'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map(h => (
                <HotelCard 
                  key={h.hotelId} 
                  hotel={h} 
                  onView={() => setView('rooms', h.hotelId)} // <-- Pass hotel ID to rooms view
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;