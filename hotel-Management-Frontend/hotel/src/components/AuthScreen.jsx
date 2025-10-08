// components/AuthScreen.jsx
import React from 'react';
import { Hotel } from 'lucide-react';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';

const AuthScreen = ({ authMode, setAuthMode }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl inline-block mb-4">
          <Hotel className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BookingPro</h1>
        <p className="text-gray-600">Hotel Management Platform</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {authMode === 'login' ? (
          <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    </div>
  </div>
);

export default AuthScreen;