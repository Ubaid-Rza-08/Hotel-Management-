import { useState, useEffect, useCallback } from 'react';
import { Hotel, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { callApi } from '../api/client';
import { HOTEL_API } from '../api/config';
import { Spin, ErrBox, Empty } from '../components/ui/index';
import HotelCard from '../components/hotel/HotelCard';

// ─────────────────────────────────────────────────────────────
//  HOTELS PAGE
// ─────────────────────────────────────────────────────────────
const HotelsPage = ({ setView }) => {
  const { token } = useAuth();
  const [hotels,  setHotels]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const d = await callApi(`${HOTEL_API}/my-hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(d.data || []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const deleteHotel = async (id) => {
    if (!confirm('Delete this hotel?')) return;
    try {
      await callApi(`${HOTEL_API}/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Hotels</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {hotels.length} propert{hotels.length === 1 ? 'y' : 'ies'} listed
            </p>
          </div>
          <button onClick={() => setView('create-hotel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a] transition-colors">
            <Plus className="w-4 h-4" />Add Hotel
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-20"><Spin cls="w-8 h-8 text-[#003580]" /></div>}
        {err     && <ErrBox msg={err} onRetry={load} />}
        {!loading && !err && hotels.length === 0 && (
          <Empty icon={Hotel} title="No hotels yet"
            desc="List your first property to start accepting bookings"
            cta={
              <button onClick={() => setView('create-hotel')}
                className="px-5 py-2.5 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a]">
                Add Property
              </button>
            } />
        )}
        {!loading && !err && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {hotels.map(h => (
              <HotelCard 
                key={h.hotelId} 
                hotel={h} 
                onDelete={() => deleteHotel(h.hotelId)} 
                onView={() => setView('rooms', h.hotelId)} // Triggers navigation with hotelId
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelsPage;