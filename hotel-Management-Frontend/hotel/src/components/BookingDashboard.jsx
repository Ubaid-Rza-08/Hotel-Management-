// components/BookingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CreditCard, 
  MapPin, 
  Hotel, 
  Bed, 
  Check, 
  X, 
  Eye,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  Plus,
  Star,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BookingDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('my-bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const API_BASE_URL = 'http://localhost:8084/api/bookings';

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/my-bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setBookings(data.data);
        } else {
          setError(data.error || 'Failed to fetch bookings');
          setBookings([]);
        }
      } else if (response.status === 401) {
        setError('Authentication failed. Please login again.');
        setBookings([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `HTTP Error: ${response.status}`);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Network error. Please check your connection.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId, reason) => {
    if (!token) {
      alert('Authentication required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cancel/${bookingId}?cancellationReason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Booking cancelled successfully!');
          fetchMyBookings(); // Refresh the list
        } else {
          alert('Failed to cancel booking: ' + (data.error || 'Unknown error'));
        }
      } else {
        const errorData = await response.json();
        alert('Failed to cancel booking: ' + (errorData.error || `HTTP Error: ${response.status}`));
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Network error. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'CONFIRMED': { color: 'bg-green-100 text-green-700', text: 'Confirmed' },
      'PENDING': { color: 'bg-yellow-100 text-yellow-700', text: 'Pending' },
      'CANCELLED': { color: 'bg-red-100 text-red-700', text: 'Cancelled' },
      'COMPLETED': { color: 'bg-blue-100 text-blue-700', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.confirmationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === '' || booking.bookingStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const bookingStats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.bookingStatus === 'CONFIRMED').length,
    completed: bookings.filter(b => b.bookingStatus === 'COMPLETED').length,
    totalSpent: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
          <p className="text-gray-600">Loading bookings...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to port 8084</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">Manage your hotel and room reservations</p>
              {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchMyBookings}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button 
                onClick={() => setShowCreateBooking(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                New Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{bookingStats.total}</p>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{bookingStats.confirmed}</p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{bookingStats.completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">₹{bookingStats.totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by hotel, room, confirmation code, or location..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <button
                  onClick={() => { setSearchTerm(''); setFilterStatus(''); }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchMyBookings}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <Calendar className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus ? 'No matching bookings found' : 'No bookings yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus 
                ? 'Try adjusting your search criteria'
                : 'Start exploring and book your first stay'
              }
            </p>
            {!searchTerm && !filterStatus && (
              <button 
                onClick={() => setShowCreateBooking(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Make Your First Booking
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.bookingId} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Hotel className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.hotelName || 'Unknown Hotel'}
                        </h3>
                        {getStatusBadge(booking.bookingStatus)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Bed className="w-4 h-4" />
                        <span className="text-sm">{booking.roomName || 'Unknown Room'}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{booking.location || 'Location not specified'}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">Confirmation: {booking.confirmationCode}</span>
                        <span>•</span>
                        <span>{booking.numberOfRooms} room(s)</span>
                        <span>•</span>
                        <span>{booking.numberOfAdults} adult(s)</span>
                        {booking.numberOfChildren > 0 && (
                          <>
                            <span>•</span>
                            <span>{booking.numberOfChildren} child(ren)</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">₹{booking.totalAmount?.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{booking.totalNights} night(s)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                        <p className="text-xs text-gray-500">{booking.checkInTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                        <p className="text-xs text-gray-500">{booking.checkOutTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Guests</p>
                        <p className="font-medium">{booking.numberOfAdults + (booking.numberOfChildren || 0)} total</p>
                        <p className="text-xs text-gray-500">{booking.selectedBedType} bed</p>
                      </div>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Booked on {formatDateTime(booking.createdAt)}
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowBookingDetails(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 font-medium rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      
                      {booking.bookingStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a reason for cancellation:');
                            if (reason) {
                              cancelBooking(booking.bookingId, reason);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          onClose={() => {
            setShowBookingDetails(false);
            setSelectedBooking(null);
          }} 
        />
      )}

      {/* Create Booking Modal */}
      {showCreateBooking && (
        <CreateBookingModal 
          onClose={() => setShowCreateBooking(false)}
          onSuccess={() => {
            setShowCreateBooking(false);
            fetchMyBookings();
          }}
        />
      )}
    </div>
  );
};

// Booking Details Modal Component
const BookingDetailsModal = ({ booking, onClose }) => {
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    return new Date(dateTimeString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-gray-600">Confirmation: {booking.confirmationCode}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Accommodation Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Hotel:</span> {booking.hotelName}</p>
                  <p><span className="font-medium">Room:</span> {booking.roomName}</p>
                  <p><span className="font-medium">Location:</span> {booking.location}</p>
                  <p><span className="font-medium">Status:</span> {booking.bookingStatus}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Guest Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {booking.firstName} {booking.lastName}</p>
                  <p><span className="font-medium">Email:</span> {booking.email}</p>
                  <p><span className="font-medium">Phone:</span> {booking.phoneNumber}</p>
                  <p><span className="font-medium">Country:</span> {booking.country}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Stay Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Check-in:</span> {booking.checkInDate} at {booking.checkInTime}</p>
                  <p><span className="font-medium">Check-out:</span> {booking.checkOutDate} at {booking.checkOutTime}</p>
                  <p><span className="font-medium">Duration:</span> {booking.totalNights} night(s)</p>
                  <p><span className="font-medium">Rooms:</span> {booking.numberOfRooms}</p>
                  <p><span className="font-medium">Guests:</span> {booking.numberOfAdults} adult(s), {booking.numberOfChildren || 0} child(ren)</p>
                  <p><span className="font-medium">Bed Type:</span> {booking.selectedBedType}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pricing Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Pricing Type:</span> {booking.pricingType}</p>
                  <p><span className="font-medium">Room Price:</span> ₹{booking.selectedRoomPrice}/night</p>
                  <p><span className="font-medium">Price per Room:</span> ₹{booking.pricePerRoom}</p>
                  {booking.numberOfExtraBeds > 0 && (
                    <>
                      <p><span className="font-medium">Extra Beds:</span> {booking.numberOfExtraBeds} × ₹{booking.extraBedPrice}/night</p>
                      <p><span className="font-medium">Extra Bed Cost:</span> ₹{booking.totalExtraBedCost}</p>
                    </>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <p className="font-semibold"><span className="font-medium">Total Amount:</span> ₹{booking.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{booking.specialRequests}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Booking Timeline</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Created:</span> {formatDateTime(booking.createdAt)}</p>
                <p><span className="font-medium">Last Updated:</span> {formatDateTime(booking.updatedAt)}</p>
                {booking.cancelledAt && (
                  <p><span className="font-medium">Cancelled:</span> {formatDateTime(booking.cancelledAt)}</p>
                )}
              </div>
            </div>

            {booking.cancellationReason && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cancellation Details</h3>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">{booking.cancellationReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Booking Modal Component (Placeholder)
const CreateBookingModal = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Booking</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Plus className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Creation Form</h3>
            <p className="text-gray-600 mb-6">
              The complete booking creation form would integrate here with your room and hotel search functionality.
            </p>
            <p className="text-sm text-gray-500">
              This would include room selection, guest details, pricing options, and payment integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDashboard;