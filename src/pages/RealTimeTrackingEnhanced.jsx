import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import DeliveryMap from "../components/DeliveryMap";
import api from "../services/api";
import io from "socket.io-client";

const RealTimeTrackingEnhanced = () => {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distanceToDestination, setDistanceToDestination] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchDelivery();
    
    // Initialize Socket.IO
    const newSocket = io("https://finallogisticsvishnubackend.onrender.com");
    setSocket(newSocket);

    // Join tracking room
    newSocket.emit("joinTracking", deliveryId);

    // Listen for location updates
    newSocket.on("locationUpdate", (data) => {
      console.log("Location update received:", data);
      setCurrentLocation(data.location);
      if (delivery?.dropLocation) {
        const distance = calculateDistance(
          data.location.lat,
          data.location.lng,
          delivery.dropLocation.lat,
          delivery.dropLocation.lng
        );
        setDistanceToDestination(distance);
      }
    });

    return () => {
      newSocket.emit("leaveTracking", deliveryId);
      newSocket.disconnect();
    };
  }, [deliveryId]);

  const fetchDelivery = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/deliveries/${deliveryId}/track`);
      setDelivery(response.data);
      
      // Set initial current location if available
      if (response.data.currentLocation) {
        setCurrentLocation(response.data.currentLocation);
        const distance = calculateDistance(
          response.data.currentLocation.lat,
          response.data.currentLocation.lng,
          response.data.dropLocation.lat,
          response.data.dropLocation.lng
        );
        setDistanceToDestination(distance);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching delivery:", error);
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula to calculate distance between two coordinates
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance.toFixed(2);
  };

  const updateLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          await api.put(`/deliveries/${deliveryId}/location`, {
            lat: latitude,
            lng: longitude
          });
          
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          if (delivery?.dropLocation) {
            const distance = calculateDistance(
              latitude,
              longitude,
              delivery.dropLocation.lat,
              delivery.dropLocation.lng
            );
            setDistanceToDestination(distance);
          }
          
          alert("✅ Location updated successfully!");
        } catch (error) {
          console.error("Error updating location:", error);
          alert("Failed to update location");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get your location");
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-2xl text-gray-600">Delivery not found</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-semibold shadow"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📍 Real-Time Tracking</h1>
          <p className="text-gray-600">Track delivery: {delivery.deliveryId}</p>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <DeliveryMap delivery={delivery} currentLocation={currentLocation} />
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-6 rounded-2xl shadow-xl ${
            delivery.status === "Delivered" ? "bg-gradient-to-r from-green-500 to-emerald-600" :
            delivery.status === "On Route" ? "bg-gradient-to-r from-purple-500 to-pink-600" :
            "bg-gradient-to-r from-blue-500 to-indigo-600"
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Current Status</p>
              <h2 className="text-3xl font-bold">{delivery.status}</h2>
            </div>
            <div className="text-6xl">
              {delivery.status === "Delivered" ? "✅" :
               delivery.status === "On Route" ? "🚚" : "📦"}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Locations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">📍 Locations</h3>

            {/* Pickup Location */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="text-3xl">🏁</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-700 mb-1">Pickup Location</p>
                  <p className="text-gray-800 font-medium mb-2">{delivery.pickupLocation.address}</p>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Coordinates</p>
                    <p className="font-mono text-sm text-gray-800">
                      Lat: {delivery.pickupLocation.lat?.toFixed(6)}
                    </p>
                    <p className="font-mono text-sm text-gray-800">
                      Lng: {delivery.pickupLocation.lng?.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Location */}
            {currentLocation && (
              <div className="mb-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">📍</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-700 mb-1">Current Location</p>
                    <p className="text-gray-600 text-sm mb-2">
                      Last updated: {currentLocation.lastUpdated ? 
                        new Date(currentLocation.lastUpdated).toLocaleTimeString() : 
                        "Just now"}
                    </p>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Coordinates</p>
                      <p className="font-mono text-sm text-gray-800">
                        Lat: {currentLocation.lat?.toFixed(6)}
                      </p>
                      <p className="font-mono text-sm text-gray-800">
                        Lng: {currentLocation.lng?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Drop Location */}
            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="flex items-start space-x-3">
                <div className="text-3xl">🎯</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-700 mb-1">Drop Location</p>
                  <p className="text-gray-800 font-medium mb-2">{delivery.dropLocation.address}</p>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Coordinates</p>
                    <p className="font-mono text-sm text-gray-800">
                      Lat: {delivery.dropLocation.lat?.toFixed(6)}
                    </p>
                    <p className="font-mono text-sm text-gray-800">
                      Lng: {delivery.dropLocation.lng?.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Distance & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Distance Card */}
            {distanceToDestination && (
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="text-center">
                  <div className="text-5xl mb-3">📏</div>
                  <p className="text-orange-100 text-sm mb-2">Distance to Destination</p>
                  <h2 className="text-5xl font-bold mb-2">{distanceToDestination}</h2>
                  <p className="text-2xl font-semibold">kilometers</p>
                </div>
              </div>
            )}

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📦 Delivery Info</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Delivery ID</span>
                  <span className="font-bold text-gray-800">{delivery.deliveryId}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-bold text-gray-800">{delivery.customer?.name}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Driver</span>
                  <span className="font-bold text-gray-800">
                    {delivery.assignedDriver?.name || "Not assigned"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-bold text-gray-800">
                    {delivery.assignedVehicle?.plateNumber || "Not assigned"}
                  </span>
                </div>

                {delivery.startTime && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Started At</span>
                    <span className="font-bold text-gray-800">
                      {new Date(delivery.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Update Location Button (for drivers) */}
            {delivery.status === "On Route" && (
              <button
                onClick={updateLocation}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition"
              >
                📍 Update My Location
              </button>
            )}
          </motion.div>
        </div>

        {/* Status History */}
        {delivery.statusHistory && delivery.statusHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Status History</h3>
            <div className="space-y-3">
              {delivery.statusHistory.map((history, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">
                    {history.status === "Delivered" ? "✅" :
                     history.status === "On Route" ? "🚚" :
                     history.status === "Assigned" ? "📋" : "📦"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{history.status}</p>
                    <p className="text-sm text-gray-600">{history.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(history.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RealTimeTrackingEnhanced;
