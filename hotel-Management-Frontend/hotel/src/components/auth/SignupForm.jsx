import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Key, Hotel, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// components/auth/SignupForm.jsx
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create account</h2>
        <p className="text-gray-600">Join our hotel management platform</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center justify-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
          step === 'otp-request' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
        }`}>
          {step === 'otp-request' ? '1' : '✓'}
        </div>
        <div className={`w-12 h-1 mx-2 rounded-full ${
          step !== 'otp-request' ? 'bg-blue-600' : 'bg-gray-300'
        }`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
          step === 'otp-verify' ? 'bg-blue-600 text-white' : 
          step === 'details' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
        }`}>
          {step === 'details' ? '✓' : '2'}
        </div>
        <div className={`w-12 h-1 mx-2 rounded-full ${
          step === 'details' ? 'bg-blue-600' : 'bg-gray-300'
        }`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
          step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
        }`}>
          3
        </div>
      </div>

      {step === 'otp-request' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
          <button
            onClick={sendOtp}
            disabled={loading || !formData.email}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </div>
      )}

      {step === 'otp-verify' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg tracking-wider"
              placeholder="000000"
            />
            <p className="text-sm text-gray-500 mt-2 text-center">Code sent to {formData.email}</p>
          </div>
          <button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={completeSignup}
            disabled={loading || !formData.fullName || !formData.city}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </div>
      )}

      <div className="text-center">
        <span className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </button>
        </span>
      </div>
    </div>
  );
};
export default SignupForm;