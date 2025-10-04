// components/RoomAvailabilityChecker.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw,
  MapPin,
  Star,
  Bed,
  Hotel
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const RoomAvailabilityChecker = () => {
  const { token } = useAuth();
  const [checkData, setCheckData] = useState({
    roomId: '',
    checkIn: '',
    checkOut: '',
    numberOfRooms: 1
  });
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [availabilityCalendar, setAvailabilityCalendar] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const AVAILABILITY_API_URL = 'http://localhost:8084/api/availability';
  const ROOM_API_URL = 'http://localhost:8083/api/rooms';

  useEffect(() => {
    fetchAllRooms();
  }, []);

  const fetchAllRooms = async () => {
    try {
      const response = await fetch(`${ROOM_API_URL}/public/all`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setRooms(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const checkAvailability = async () => {
    if (!checkData.roomId || !checkData.checkIn || !checkData.checkOut) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(checkData.checkIn) >= new Date(checkData.checkOut)) {
      setError('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        checkIn: checkData.checkIn,
        checkOut: checkData.checkOut,
        numberOfRooms: checkData.numberOfRooms.toString()
      });

      const response = await fetch(`${AVAILABILITY_API_URL}/check/${checkData.roomId}?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailabilityResult(data.data);
          // Also fetch calendar data for visual representation
          fetchAvailabilityCalendar();
        } else {
          setError(data.error || 'Failed to check availability');
        }
      } else {
        setError(`HTTP Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityCalendar = async () => {
    if (!checkData.roomId || !checkData.checkIn || !checkData.checkOut) return;

    try {
      const params = new URLSearchParams({
        startDate: checkData.checkIn,
        endDate: checkData.checkOut
      });

      const response = await fetch(`${AVAILABILITY_API_URL}/calendar/${checkData.roomId}?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailabilityCalendar(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    }
  };

  const getAvailabilityStatus = (available, total) => {
    if (!total || total === 0) return { color: 'bg-gray-100 text-gray-700', text: 'N/A' };
    
    const percentage = (available / total) * 100;
    
    if (percentage === 0) return { color: 'bg-red-100 text-red-700', text: 'Fully Booked' };
    if (percentage <= 25) return { color: 'bg-orange-100 text-orange-700', text: 'Limited' };
    if (percentage <= 50) return { color: 'bg-yellow-100 text-yellow-700', text: 'Available' };
    return { color: 'bg-green-100 text-green-700', text: 'Good Availability' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateNights = () => {
    if (!checkData.checkIn || !checkData.checkOut) return 0;
    const checkInDate = new Date(checkData.checkIn);
    const checkOutDate = new Date(checkData.checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Room Availability Checker</h1>
          <p className="text-gray-600 mt-1">Check real-time room availability for your travel dates</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Check Availability</h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                  <select
                    value={checkData.roomId}
                    onChange={(e) => {
                      const roomId = e.target.value;
                      const room = rooms.find(r => r.roomId === roomId);
                      setCheckData({...checkData, roomId});
                      setSelectedRoom(room);
                      setAvailabilityResult(null);
                      setAvailabilityCalendar({});
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a room...</option>
                    {rooms.map(room => (
                      <option key={room.roomId} value={room.roomId}>
                        {room.roomName} - {room.roomType} (₹{room.basePrice}/night)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                    <input
                      type="date"
                      value={checkData.checkIn}
                      onChange={(e) => setCheckData({...checkData, checkIn: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                    <input
                      type="date"
                      value={checkData.checkOut}
                      onChange={(e) => setCheckData({...checkData, checkOut: e.target.value})}
                      min={checkData.checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Number of Rooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rooms</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={checkData.numberOfRooms}
                    onChange={(e) => setCheckData({...checkData, numberOfRooms: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Summary */}
                {checkData.checkIn && checkData.checkOut && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h3 className="font-medium text-indigo-900 mb-2">Booking Summary</h3>
                    <div className="space-y-1 text-sm text-indigo-800">
                      <p>Duration: {calculateNights()} night(s)</p>
                      <p>Rooms: {checkData.numberOfRooms}</p>
                      <p>Dates: {formatDate(checkData.checkIn)} - {formatDate(checkData.checkOut)}</p>
                    </div>
                  </div>
                )}

                {/* Check Button */}
                <button
                  onClick={checkAvailability}
                  disabled={loading || !checkData.roomId || !checkData.checkIn || !checkData.checkOut}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Checking Availability...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Check Availability
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Availability Result */}
            {availabilityResult && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Availability Result</h3>
                
                <div className={`p-6 rounded-xl border-2 ${
                  availabilityResult.isAvailable 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {availabilityResult.isAvailable ? (
                      <Check className="w-8 h-8 text-green-600" />
                    ) : (
                      <X className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <h4 className={`text-xl font-bold ${
                        availabilityResult.isAvailable ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {availabilityResult.isAvailable ? 'Available!' : 'Not Available'}
                      </h4>
                      <p className={`text-sm ${
                        availabilityResult.isAvailable ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {availabilityResult.isAvailable 
                          ? 'Your requested rooms are available for the selected dates'
                          : 'Sorry, the requested rooms are not available for these dates'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Check-in</p>
                      <p className="text-gray-600">{formatDate(availabilityResult.checkIn)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Check-out</p>
                      <p className="text-gray-600">{formatDate(availabilityResult.checkOut)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Requested</p>
                      <p className="text-gray-600">{availabilityResult.requestedRooms} room(s)</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Room ID</p>
                      <p className="text-gray-600 font-mono text-xs">{availabilityResult.roomId}</p>
                    </div>
                  </div>

                  {availabilityResult.isAvailable && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <button className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        Proceed to Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            {Object.keys(availabilityCalendar).length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Availability</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(availabilityCalendar)
                    .sort(([a], [b]) => new Date(a) - new Date(b))
                    .map(([date, available]) => {
                      const totalRooms = selectedRoom?.numberOfRooms || 10;
                      const status = getAvailabilityStatus(available, totalRooms);
                      
                      return (
                        <div key={date} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {formatDate(date)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {available}/{totalRooms} available
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Room Details */}
          <div className="lg:col-span-1">
            {selectedRoom ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Selected Room</h3>
                
                <div className="space-y-4">
                  {selectedRoom.roomImages && selectedRoom.roomImages.length > 0 && (
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedRoom.roomImages[0]}
                        alt={selectedRoom.roomName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full hidden items-center justify-center bg-gray-200">
                        <Bed className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{selectedRoom.roomName}</h4>
                    <p className="text-gray-600">{selectedRoom.roomType} Room</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-medium">₹{selectedRoom.basePrice}/night</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">1 Guest</span>
                      <span className="font-medium">₹{selectedRoom.priceForOneGuest}/night</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">2 Guests</span>
                      <span className="font-medium">₹{selectedRoom.priceForTwoGuest}/night</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Rooms</span>
                      <span className="font-medium">{selectedRoom.numberOfRooms}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Features</h5>
                    <div className="space-y-1 text-sm">
                      {selectedRoom.breakfastIncluded && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-4 h-4" />
                          Breakfast Included
                        </div>
                      )}
                      {selectedRoom.parkingAvailable && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Check className="w-4 h-4" />
                          Parking Available
                        </div>
                      )}
                      {selectedRoom.childrenAllowed && (
                        <div className="flex items-center gap-2 text-purple-600">
                          <Check className="w-4 h-4" />
                          Child Friendly
                        </div>
                      )}
                      {selectedRoom.petAllowed && (
                        <div className="flex items-center gap-2 text-orange-600">
                          <Check className="w-4 h-4" />
                          Pet Friendly
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Check-in/out times */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="font-medium">{selectedRoom.checkinTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="font-medium">{selectedRoom.checkoutTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                  <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Room Selected</h3>
                  <p className="text-gray-600">Choose a room from the dropdown to see details and check availability.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAvailabilityChecker;