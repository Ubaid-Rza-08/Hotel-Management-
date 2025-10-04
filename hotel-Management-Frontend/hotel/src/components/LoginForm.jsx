import React, { useState, useEffect } from 'react';
import { Mail, Key, Hotel, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

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
        // OAuth2 login successful, fetch tokens from backend
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/auth/callback/tokens`, {
            method: 'GET',
            credentials: 'include', // Include cookies
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.accessToken && data.refreshToken) {
              // Store tokens and login user
              login(data.accessToken, data.refreshToken);
              
              // Clear the URL parameters
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
        // Clear the error from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Check if this is an OAuth2 callback
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
    // Store current location to return to after auth
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `${API_BASE_URL.replace('/api/v1', '')}/oauth2/authorization/google?redirect_uri=${redirectUri}`;
  };

  // Show loading state during OAuth2 callback processing
  if (loading && (window.location.search.includes('success=true') || window.location.search.includes('user_id='))) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-6 shadow-lg">
            <Hotel className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Completing Sign In</h1>
          <p className="text-gray-600">Please wait while we complete your authentication...</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-6 shadow-lg">
          <Hotel className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your hotel management account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {step === 'email' ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <button
            onClick={sendOtp}
            disabled={loading || !email}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : (
              'Send OTP'
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 font-medium text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Processing...' : 'Sign in with Google'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Enter Verification Code</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center font-mono text-lg tracking-wider"
                placeholder="000000"
              />
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">Verification code sent to {email}</p>
          </div>

          <button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </div>
            ) : (
              'Verify & Sign In'
            )}
          </button>

          <button
            onClick={() => setStep('email')}
            className="w-full text-sm text-amber-600 hover:text-amber-700 font-medium py-2"
          >
            ← Change email address
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <span className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-amber-600 hover:text-amber-700 font-semibold hover:underline"
          >
            Create account
          </button>
        </span>
      </div>
    </div>
  );
};

export default LoginForm;