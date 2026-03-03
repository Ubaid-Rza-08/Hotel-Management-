import { useState } from 'react';
import { Globe, Mail, Phone, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { callApi } from '../../api/client';
import { AUTH_API } from '../../api/config';
import { Spin } from '../ui/index';

// ─────────────────────────────────────────────────────────────
//  SMALL AUTH ATOMS
// ─────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      {children}
    </div>
  </div>
);

const BtnPrimary = ({ onClick, loading, disabled, children }) => (
  <button onClick={onClick} disabled={loading || disabled}
    className="w-full py-3.5 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
    {loading && <Spin cls="w-4 h-4 text-white" />}
    {children}
  </button>
);

const Divider = () => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-gray-200" />
    <span className="text-xs text-gray-400 font-medium">OR</span>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

const BtnGoogle = ({ onClick }) => (
  <button onClick={onClick}
    className="w-full py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Continue with Google
  </button>
);

// ─────────────────────────────────────────────────────────────
//  AUTH SCREEN
// ─────────────────────────────────────────────────────────────
const AuthScreen = () => {
  const { login } = useAuth();
  const [tab,        setTab]        = useState('login');
  const [email,      setEmail]      = useState('');
  const [otp,        setOtp]        = useState('');
  const [step,       setStep]       = useState('email'); // 'email' | 'otp'
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState('');
  const [signupData, setSignupData] = useState({ fullName: '', email: '', phoneNumber: '' });

  const sendOtp = async () => {
    if (!email) return;
    setLoading(true); setErr('');
    try {
      await callApi(`${AUTH_API}/auth/login/send-otp`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStep('otp');
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true); setErr('');
    try {
      const d = await callApi(`${AUTH_API}/auth/login/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      login(d.accessToken);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const handleSignup = async () => {
    setLoading(true); setErr('');
    try {
      await callApi(`${AUTH_API}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(signupData),
      });
      setEmail(signupData.email); setTab('login'); setStep('email');
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const googleUrl = `${AUTH_API.replace('/api/v1', '')}/oauth2/authorization/google`;

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg,#003580 0%,#005eb8 60%,#0071c2 100%)' }}>

      {/* Top bar */}
      <div className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <span className="font-black text-2xl text-white tracking-tight">
          booking<span className="text-[#FFD700]">.</span>pro
        </span>
        <div className="flex items-center gap-3 text-blue-200 text-sm">
          <Globe className="w-4 h-4" />
          <span>English (IN)</span>
          <span className="text-blue-400">|</span>
          <span>₹ INR</span>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white">
              {tab === 'login' ? 'Sign in or create account' : 'Create your account'}
            </h1>
            <p className="text-blue-200 text-sm mt-1">Get the best hotel deals, manage bookings &amp; more</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-2 border-b border-gray-100">
              {['login', 'signup'].map(t => (
                <button key={t}
                  onClick={() => { setTab(t); setStep('email'); setErr(''); }}
                  className={`py-4 text-sm font-bold transition-colors ${
                    tab === t ? 'text-[#003580] border-b-2 border-[#003580]' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {err && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{err}
                </div>
              )}

              {/* ── LOGIN ── */}
              {tab === 'login' && (
                <>
                  {step === 'email' ? (
                    <>
                      <Field label="Email address" icon={Mail}>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendOtp()}
                          placeholder="your@email.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 focus:border-[#003580]" />
                      </Field>
                      <BtnPrimary onClick={sendOtp} loading={loading} disabled={!email}>
                        Continue with Email
                      </BtnPrimary>
                      <Divider />
                      <BtnGoogle onClick={() => window.location.href = googleUrl} />
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 text-center">
                        We sent a 6-digit code to <span className="font-bold text-gray-900">{email}</span>
                      </p>
                      <input type="text" value={otp} maxLength={6}
                        onChange={e => setOtp(e.target.value.replace(/\D/, '').slice(0, 6))}
                        onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                        placeholder="000000"
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#003580]/30 focus:border-[#003580]" />
                      <BtnPrimary onClick={verifyOtp} loading={loading} disabled={otp.length !== 6}>
                        Verify &amp; Sign In
                      </BtnPrimary>
                      <button onClick={() => { setStep('email'); setOtp(''); }}
                        className="w-full text-sm text-gray-400 hover:text-gray-600">
                        ← Use different email
                      </button>
                    </>
                  )}
                </>
              )}

              {/* ── SIGNUP ── */}
              {tab === 'signup' && (
                <>
                  {[
                    { label: 'Full Name',    key: 'fullName',    type: 'text',  placeholder: 'John Doe',       icon: User  },
                    { label: 'Email',        key: 'email',       type: 'email', placeholder: 'you@email.com',  icon: Mail  },
                    { label: 'Phone Number', key: 'phoneNumber', type: 'tel',   placeholder: '+91 9876543210', icon: Phone },
                  ].map(f => (
                    <Field key={f.key} label={f.label} icon={f.icon}>
                      <input type={f.type} value={signupData[f.key]}
                        onChange={e => setSignupData(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 focus:border-[#003580]" />
                    </Field>
                  ))}
                  <BtnPrimary onClick={handleSignup} loading={loading}
                    disabled={!signupData.fullName || !signupData.email}>
                    Create Account
                  </BtnPrimary>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-blue-200/70 text-xs mt-5">
            By continuing you agree to our Terms &amp; Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
