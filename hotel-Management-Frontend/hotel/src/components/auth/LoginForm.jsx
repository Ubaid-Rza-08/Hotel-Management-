// components/auth/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { Mail, Key, Globe, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LoginForm = ({ onSwitchToSignup }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:8080/api/v1';

  // Handle OAuth2 callback on component mount
  useEffect(() => {
    const handleOAuth2Callback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const error = urlParams.get('error');
      const userId = urlParams.get('user_id');

      if (success === 'true' && userId) {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/auth/callback/tokens`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.accessToken && data.refreshToken) {
              login(data.accessToken, data.refreshToken);
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              setError('Failed to retrieve authentication tokens');
            }
          } else {
            const errorData = await response.json();
            setError(errorData.message || 'OAuth2 authentication failed');
          }
        } catch (err) {
          console.error('OAuth2 callback error:', err);
          setError('Failed to complete OAuth2 authentication');
        } finally {
          setLoading(false);
        }
      } else if (error) {
        setError(decodeURIComponent(error));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    if (window.location.search.includes('success=true') || window.location.search.includes('error=')) {
      handleOAuth2Callback();
    }
  }, [login]);

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setStep('otp');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      if (response.ok) {
        const data = await response.json();
        login(data.accessToken, data.refreshToken);
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `${API_BASE_URL.replace('/api/v1', '')}/oauth2/authorization/google?redirect_uri=${redirectUri}`;
  };

  if (loading && (window.location.search.includes('success=true') || window.location.search.includes('user_id='))) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {step === 'email' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <button
            onClick={sendOtp}
            disabled={loading || !email}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Globe className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg tracking-wider"
                placeholder="000000"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">Code sent to {email}</p>
          </div>

          <button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>

          <button
            onClick={() => setStep('email')}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
          >
            ← Change email address
          </button>
        </div>
      )}

      <div className="text-center">
        <span className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </span>
      </div>
    </div>
  );
};
export default LoginForm;