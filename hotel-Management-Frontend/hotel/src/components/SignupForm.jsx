import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Key, Hotel, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SignupForm = ({ onSwitchToLogin }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    city: '',
    username: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('otp-request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:8080/api/v1';

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      if (response.ok) {
        setStep('otp-verify');
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
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      
      if (response.ok) {
        setStep('details');
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const completeSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/complete-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        login(data.accessToken, data.refreshToken);
      } else {
        const data = await response.json();
        setError(data.message || 'Signup failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-6 shadow-lg">
          <Hotel className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">Join our hotel management system</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${
          step === 'otp-request' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 
          'bg-green-500 text-white'
        }`}>
          {step === 'otp-request' ? '1' : <Check className="w-5 h-5" />}
        </div>
        <div className={`w-20 h-1 mx-2 rounded-full ${
          step !== 'otp-request' ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gray-300'
        }`}></div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${
          step === 'otp-verify' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 
          step === 'details' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
        }`}>
          {step === 'details' ? <Check className="w-5 h-5" /> : '2'}
        </div>
        <div className={`w-20 h-1 mx-2 rounded-full ${
          step === 'details' ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gray-300'
        }`}></div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${
          step === 'details' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 'bg-gray-300 text-gray-500'
        }`}>
          3
        </div>
      </div>

      {step === 'otp-request' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <button
            onClick={sendOtp}
            disabled={loading || !formData.email}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </div>
      )}

      {step === 'otp-verify' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Verification Code</label>
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
            <p className="text-sm text-gray-500 mt-3 text-center">Code sent to {formData.email}</p>
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
              'Verify Code'
            )}
          </button>

          <button
            onClick={() => setStep('otp-request')}
            className="w-full text-sm text-amber-600 hover:text-amber-700 font-medium py-2"
          >
            ← Change email address
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="johndoe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="New York"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={completeSignup}
            disabled={loading || !formData.fullName || !formData.city}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              'Complete Registration'
            )}
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <span className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-amber-600 hover:text-amber-700 font-semibold hover:underline"
          >
            Sign in
          </button>
        </span>
      </div>
    </div>
  );
};

export default SignupForm;