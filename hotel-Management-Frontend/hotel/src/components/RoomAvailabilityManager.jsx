import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Check, X, AlertCircle, RefreshCw } from 'lucide-react';

const RoomAvailabilityManager = ({ roomId, onClose }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkAvailabilityData, setCheckAvailabilityData] = useState({
    checkIn: '',
    checkOut: '',
    requiredRooms: 1
  });
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [updateData, setUpdateData] = useState({
    checkIn: '',
    checkOut: '',
    numberOfRooms: 1,
    reduce: false
  });

  const API_BASE_URL = 'http://localhost:8083/api/rooms';

  useEffect(() => {
    fetchRoomAvailability();
  }, [roomId]);

  const fetchRoomAvailability = async () => {
    setLoading(true);
    try {
      // Since availability endpoints are commented out, we'll simulate data
      // Replace this with actual API call when backend is ready
      const simulatedData = generateSimulatedAvailability();
      setAvailability(simulatedData);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSimulatedAvailability = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const totalRooms = 10;
      const bookedRooms = Math.floor(Math.random() * totalRooms);
      const availableRooms = totalRooms - bookedRooms;
      
      data.push({
        date: date.toISOString().split('T')[0],
        totalRooms,
        availableRooms,
        bookedRooms
      });
    }
    
    return data;
  };

  const checkAvailability = async () => {
    if (!checkAvailabilityData.checkIn || !checkAvailabilityData.checkOut) {
      alert('Please select both check-in and check-out dates');
      return;
    }

    setLoading(true);
    try {
      // Simulate availability check
      const checkIn = new Date(checkAvailabilityData.checkIn);
      const checkOut = new Date(checkAvailabilityData.checkOut);
      
      let isAvailable = true;
      let minAvailable = Infinity;
      
      // Check each date in the range
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayAvailability = availability.find(a => a.date === dateStr);
        
        if (dayAvailability) {
          minAvailable = Math.min(minAvailable, dayAvailability.availableRooms);
          if (dayAvailability.availableRooms < checkAvailabilityData.requiredRooms) {
            isAvailable = false;
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setAvailabilityResult({
        available: isAvailable,
        minAvailableRooms: minAvailable === Infinity ? 0 : minAvailable,
        requestedRooms: checkAvailabilityData.requiredRooms,
        checkIn: checkAvailabilityData.checkIn,
        checkOut: checkAvailabilityData.checkOut
      });
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async () => {
    if (!updateData.checkIn || !updateData.checkOut) {
      alert('Please select both check-in and check-out dates');
      return;
    }

    setLoading(true);
    try {
      // Simulate availability update
      const updatedAvailability = [...availability];
      const checkIn = new Date(updateData.checkIn);
      const checkOut = new Date(updateData.checkOut);
      
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayIndex = updatedAvailability.findIndex(a => a.date === dateStr);
        
        if (dayIndex !== -1) {
          if (updateData.reduce) {
            updatedAvailability[dayIndex].availableRooms = Math.max(0, 
              updatedAvailability[dayIndex].availableRooms - updateData.numberOfRooms);
            updatedAvailability[dayIndex].bookedRooms = Math.min(
              updatedAvailability[dayIndex].totalRooms,
              updatedAvailability[dayIndex].bookedRooms + updateData.numberOfRooms);
          } else {
            updatedAvailability[dayIndex].availableRooms = Math.min(
              updatedAvailability[dayIndex].totalRooms,
              updatedAvailability[dayIndex].availableRooms + updateData.numberOfRooms);
            updatedAvailability[dayIndex].bookedRooms = Math.max(0,
              updatedAvailability[dayIndex].bookedRooms - updateData.numberOfRooms);
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setAvailability(updatedAvailability);
      
      // Reset form
      setUpdateData({
        checkIn: '',
        checkOut: '',
        numberOfRooms: 1,
        reduce: false
      });
      
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityStatus = (availableRooms, totalRooms) => {
    const percentage = (availableRooms / totalRooms) * 100;
    
    if (percentage === 0) return { status: 'full', color: 'bg-red-500', text: 'Full' };
    if (percentage <= 25) return { status: 'low', color: 'bg-orange-500', text: 'Low' };
    if (percentage <= 50) return { status: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    return { status: 'high', color: 'bg-green-500', text: 'Available' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Room Availability Management</h2>
              <p className="text-gray-600">Manage room availability and bookings</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Check Availability Section */}
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Check Availability
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                      <input
                        type="date"
                        value={checkAvailabilityData.checkIn}
                        onChange={(e) => setCheckAvailabilityData(prev => ({...prev, checkIn: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                      <input
                        type="date"
                        value={checkAvailabilityData.checkOut}
                        onChange={(e) => setCheckAvailabilityData(prev => ({...prev, checkOut: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={checkAvailabilityData.checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Rooms</label>
                    <input
                      type="number"
                      min="1"
                      value={checkAvailabilityData.requiredRooms}
                      onChange={(e) => setCheckAvailabilityData(prev => ({...prev, requiredRooms: parseInt(e.target.value)}))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={checkAvailability}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Check Availability
                  </button>
                </div>
                
                {/* Availability Result */}
                {availabilityResult && (
                  <div className={`mt-4 p-4 rounded-lg ${availabilityResult.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {availabilityResult.available ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-semibold ${availabilityResult.available ? 'text-green-800' : 'text-red-800'}`}>
                        {availabilityResult.available ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Period: {availabilityResult.checkIn} to {availabilityResult.checkOut}</p>
                      <p>Requested: {availabilityResult.requestedRooms} room(s)</p>
                      <p>Available: {availabilityResult.minAvailableRooms} room(s)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Update Availability Section */}
              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-600" />
                  Update Availability
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                      <input
                        type="date"
                        value={updateData.checkIn}
                        onChange={(e) => setUpdateData(prev => ({...prev, checkIn: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                      <input
                        type="date"
                        value={updateData.checkOut}
                        onChange={(e) => setUpdateData(prev => ({...prev, checkOut: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min={updateData.checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
                    <input
                      type="number"
                      min="1"
                      value={updateData.numberOfRooms}
                      onChange={(e) => setUpdateData(prev => ({...prev, numberOfRooms: parseInt(e.target.value)}))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="updateAction"
                          checked={!updateData.reduce}
                          onChange={() => setUpdateData(prev => ({...prev, reduce: false}))}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm">Add rooms (increase availability)</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="updateAction"
                          checked={updateData.reduce}
                          onChange={() => setUpdateData(prev => ({...prev, reduce: true}))}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm">Book rooms (reduce availability)</span>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    onClick={updateAvailability}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Update Availability
                  </button>
                </div>
              </div>
            </div>

            {/* Availability Calendar */}
            <div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  30-Day Availability Overview
                </h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading availability...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availability.map((day, index) => {
                      const status = getAvailabilityStatus(day.availableRooms, day.totalRooms);
                      const date = new Date(day.date);
                      const isToday = day.date === new Date().toISOString().split('T')[0];
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {date.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                                {isToday && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Today</span>}
                              </p>
                              <p className="text-sm text-gray-600">{status.text}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {day.availableRooms}/{day.totalRooms}
                            </p>
                            <p className="text-xs text-gray-500">available</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">Available (50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-600">Medium (26-50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-gray-600">Low (1-25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600">Full (0%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {availability.filter(day => day.availableRooms > day.totalRooms * 0.5).length}
              </div>
              <div className="text-sm text-green-600">High Availability Days</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">
                {availability.filter(day => day.availableRooms > 0 && day.availableRooms <= day.totalRooms * 0.5).length}
              </div>
              <div className="text-sm text-yellow-600">Medium/Low Days</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-700">
                {availability.filter(day => day.availableRooms === 0).length}
              </div>
              <div className="text-sm text-red-600">Fully Booked Days</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {availability.length > 0 ? Math.round(availability.reduce((sum, day) => sum + (day.availableRooms / day.totalRooms), 0) / availability.length * 100) : 0}%
              </div>
              <div className="text-sm text-blue-600">Avg. Availability</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAvailabilityManager;