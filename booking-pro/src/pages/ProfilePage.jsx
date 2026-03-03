import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Camera, Edit2, Save,
  LogOut, Calendar, CreditCard, Hotel, Bed, Bell, Shield, ChevronRight,
} from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import { callApi } from "../api/client";
import { AUTH_API } from "../api/config";
import { Spin } from '../components/ui/index';
import { fmt } from '../utils/fmt';

// ─────────────────────────────────────────────────────────────
//  PROFILE PAGE
// ─────────────────────────────────────────────────────────────
const ProfilePage = ({ setView }) => {
  const { user, logout, token, refreshUser } = useAuth();
  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) setForm({
      fullName:    user.fullName    || '',
      email:       user.email       || '',
      phoneNumber: user.phoneNumber || '',
      city:        user.city        || '',
    });
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      await callApi(`${AUTH_API}/profile`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form),
      });
      await refreshUser(); setEditing(false);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const uploadPhoto = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', f);
    try {
      await fetch(`${AUTH_API}/profile/upload-image`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      await refreshUser();
    } catch (e) { alert(e.message); }
    finally { setUploading(false); }
  };

  if (!user) return null;

  const NAV_ITEMS = [
    { I: Calendar,   l: 'My Bookings',       d: 'Reservations & stays',    v: 'bookings' },
    { I: CreditCard, l: 'Payment History',    d: 'Transactions & receipts', v: 'payments' },
    { I: Hotel,      l: 'My Properties',      d: 'Manage listed hotels',    v: 'hotels'   },
    { I: Bed,        l: 'My Rooms',           d: 'Room listings',           v: 'rooms'    },
    { I: Bell,       l: 'Notifications',      d: 'Alerts & updates',        v: null       },
    { I: Shield,     l: 'Privacy & Security', d: 'Account security',        v: null       },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-[#003580] to-[#0071c2]" />

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden">
                  {user.profilePhotoUrl
                    ? <img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-[#FFD700] flex items-center justify-center">
                        <span className="text-[#003580] font-black text-2xl">{fmt.initials(user.fullName)}</span>
                      </div>
                  }
                </div>
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#003580] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#00266a] transition-colors">
                  {uploading
                    ? <Spin cls="w-3.5 h-3.5 text-white" />
                    : <Camera className="w-3.5 h-3.5 text-white" />}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={uploadPhoto} disabled={uploading} />
                </label>
              </div>

              <button onClick={() => editing ? save() : setEditing(true)} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                {saving
                  ? <Spin cls="w-3.5 h-3.5 text-gray-600" />
                  : editing
                  ? <Save  className="w-3.5 h-3.5" />
                  : <Edit2 className="w-3.5 h-3.5" />}
                {editing ? (saving ? 'Saving…' : 'Save') : 'Edit'}
              </button>
            </div>

            {/* Edit form / display */}
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: 'Full Name', k: 'fullName',    t: 'text',  I: User   },
                  { l: 'Email',     k: 'email',       t: 'email', I: Mail   },
                  { l: 'Phone',     k: 'phoneNumber', t: 'tel',   I: Phone  },
                  { l: 'City',      k: 'city',        t: 'text',  I: MapPin },
                ].map(({ l, k, t, I }) => (
                  <div key={k}>
                    <label className="block text-xs font-bold text-gray-400 mb-1">{l}</label>
                    <div className="relative">
                      <I className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type={t} value={form[k] || ''}
                        onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black text-gray-900">{user.fullName}</h2>
                <p className="text-gray-400 text-sm">@{user.username}</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {[
                    { I: Mail,   v: user.email                  },
                    { I: Phone,  v: user.phoneNumber || '—'     },
                    { I: MapPin, v: user.city || '—'            },
                  ].map(({ I, v }, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <I className="w-4 h-4 text-gray-400" />{v}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Quick-nav ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {NAV_ITEMS.map(({ I, l, d, v }, i, arr) => (
            <button key={l} onClick={() => v && setView(v)}
              className={`flex items-center gap-4 w-full px-5 py-4 hover:bg-gray-50 transition-colors text-left ${
                i < arr.length - 1 ? 'border-b border-gray-100' : ''
              }`}>
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <I className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{l}</p>
                <p className="text-xs text-gray-400">{d}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>

        {/* ── Sign out ── */}
        <button onClick={logout}
          className="w-full py-3.5 border-2 border-red-200 rounded-2xl text-red-600 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
