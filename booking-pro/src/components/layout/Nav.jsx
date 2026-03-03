import { useState } from 'react';
import {
  Hotel, Bed, Calendar, CreditCard, Search,
  Plus, ChevronDown, Menu, X, LogOut, User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Overlay } from '../ui/index';
import { fmt } from '../../utils/fmt';

// ─────────────────────────────────────────────────────────────
//  NAV LINKS CONFIG
// ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { id: 'hotels',   label: 'Hotels',   icon: Hotel      },
  { id: 'rooms',    label: 'Rooms',    icon: Bed        },
  { id: 'bookings', label: 'Bookings', icon: Calendar   },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'explore',  label: 'Explore',  icon: Search     },
];

const USER_MENU_LINKS = [
  { label: 'My Bookings',     icon: Calendar,   v: 'bookings' },
  { label: 'Payments',        icon: CreditCard, v: 'payments' },
  { label: 'My Hotels',       icon: Hotel,      v: 'hotels'   },
  { label: 'My Rooms',        icon: Bed,        v: 'rooms'    },
  { label: 'Profile',         icon: User,       v: 'profile'  },
];

// ─────────────────────────────────────────────────────────────
//  NAV
// ─────────────────────────────────────────────────────────────
const Nav = ({ view, setView }) => {
  const { user, logout } = useAuth();
  const [userMenu,   setUserMenu]   = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <>
      <header className="bg-[#003580] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <button onClick={() => setView('hotels')} className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-white font-black text-xl">booking</span>
              <span className="text-[#FFD700] font-black text-2xl">.</span>
              <span className="text-white font-black text-xl">pro</span>
            </button>

            {/* Desktop links */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setView(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    view === id ? 'bg-white text-[#003580]' : 'text-white/85 hover:bg-white/15'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button onClick={() => setView('create-booking')}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFD700] text-[#003580] font-bold text-xs rounded-full hover:bg-yellow-400 transition-colors">
                <Plus className="w-3.5 h-3.5" />New Booking
              </button>

              {/* User avatar dropdown */}
              <div className="relative">
                <button onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/15 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#FFD700] text-[#003580] flex items-center justify-center font-black text-xs overflow-hidden">
                    {user?.profilePhotoUrl
                      ? <img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                      : fmt.initials(user?.fullName)}
                  </div>
                  <span className="hidden sm:block text-white text-xs font-semibold max-w-[90px] truncate">
                    {user?.fullName?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/70" />
                </button>

                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gradient-to-r from-[#003580] to-[#0052a5]">
                        <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                        <p className="text-xs text-blue-200 truncate">{user?.email}</p>
                      </div>
                      {USER_MENU_LINKS.map(({ label, icon: Icon, v }) => (
                        <button key={v} onClick={() => { setView(v); setUserMenu(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Icon className="w-4 h-4 text-gray-400" />{label}
                        </button>
                      ))}
                      <div className="border-t border-gray-100">
                        <button onClick={() => { logout(); setUserMenu(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="w-4 h-4" />Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileMenu(true)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/15 text-white">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile sidebar ── */}
      {mobileMenu && (
        <>
          <Overlay onClose={() => setMobileMenu(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col">
            <div className="bg-[#003580] px-5 py-4 flex items-center justify-between">
              <span className="text-white font-black text-lg">
                booking<span className="text-[#FFD700]">.</span>pro
              </span>
              <button onClick={() => setMobileMenu(false)} className="text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {NAV_LINKS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setView(id); setMobileMenu(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    view === id ? 'bg-blue-50 text-[#003580]' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  <Icon className="w-5 h-5" />{label}
                </button>
              ))}
              <button onClick={() => { setView('create-booking'); setMobileMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#FFD700] text-[#003580] mt-2">
                <Plus className="w-5 h-5" />New Booking
              </button>
            </nav>
            <div className="p-4 border-t">
              <button onClick={() => { logout(); setMobileMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">
                <LogOut className="w-5 h-5" />Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Nav;
