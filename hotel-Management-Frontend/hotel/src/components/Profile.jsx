import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, X, Save, Edit2, Trash2, Hotel, LogOut, Shield, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, logout, fetchUserProfile, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const API_BASE_URL = 'http://localhost:8080/api/v1';

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        city: user.city || ''
      });
    }
  }, [user]);

  const updateProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchUserProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  const uploadPhoto = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/profile/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
    setUploadingPhoto(false);
  };

  const deletePhoto = async () => {
    if (!confirm('Are you sure you want to delete your profile photo?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/profile/delete-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl shadow-sm">
                <Hotel className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hotel Management</h1>
                <p className="text-sm text-gray-500">Professional Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user.roles?.includes('ADMIN') && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">Admin</span>
                </div>
              )}
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-10">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-lg">
                  {user.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <User className="w-14 h-14 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {!isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    {uploadingPhoto ? (
                      <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-5 h-5 text-gray-600" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadPhoto}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-1">{user.fullName || 'Guest User'}</h2>
                <p className="text-amber-100 text-lg">@{user.username}</p>
                <div className="flex items-center gap-6 mt-3">
                  <span className="text-sm text-amber-100 bg-white/20 px-3 py-1 rounded-full">
                    {user.email}
                  </span>
                  {user.providerType && (
                    <span className="text-xs px-3 py-1 bg-white/20 text-white rounded-full font-medium">
                      {user.providerType} Login
                    </span>
                  )}
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-white text-amber-600 rounded-xl hover:bg-amber-50 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2 font-semibold"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="md:col-span-2">
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
            ) : (
              <div className="space-y-8">
                {/* Profile Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Phone</p>
                        <p className="text-lg font-semibold text-gray-900">{user.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Location</p>
                        <p className="text-lg font-semibold text-gray-900">{user.city || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Username</p>
                      <p className="text-base text-gray-900">@{user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Account Type</p>
                      <div className="flex items-center gap-2">
                        <span className="text-base text-gray-900">{user.providerType || 'Email'}</span>
                        {user.roles?.includes('ADMIN') && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                  {user.profilePhotoUrl && (
                    <button
                      onClick={deletePhoto}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Photo
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-300"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Hotel className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hotel Services</h3>
            </div>
            <p className="text-gray-600 mb-4">Access your hotel bookings, preferences, and loyalty rewards.</p>
            <button className="w-full py-2 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium">
              View Services
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Team Management</h3>
            </div>
            <p className="text-gray-600 mb-4">Manage your team members and administrative privileges.</p>
            <button 
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                user.roles?.includes('ADMIN') 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!user.roles?.includes('ADMIN')}
            >
              {user.roles?.includes('ADMIN') ? 'Manage Team' : 'Admin Access Required'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;