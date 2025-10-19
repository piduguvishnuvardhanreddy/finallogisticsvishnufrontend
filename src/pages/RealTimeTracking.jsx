import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import io from "socket.io-client";

const RealTimeTracking = () => {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchDeliveryDetails();
    
    // Setup Socket.IO connection
    const newSocket = io("https://finallogisticsvishnubackend.onrender.com", {
      transports: ["websocket", "polling"]
    });
    
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [deliveryId]);

  useEffect(() => {
    if (socket && deliveryId) {
      // Join delivery tracking room
      socket.emit("joinDelivery", deliveryId);

      // Listen for location updates
      socket.on("locationUpdate", (data) => {
        console.log("Location update received:", data);
        setDriverLocation(data.location);
        
        // Update delivery current location
        setDelivery(prev => ({
          ...prev,
          currentLocation: data.location
        }));
      });

      // Listen for status updates
      socket.on("statusUpdate", (data) => {
        console.log("Status update received:", data);
        setDelivery(prev => ({
          ...prev,
          status: data.status
        }));
      });

      return () => {
        socket.emit("leaveDelivery", deliveryId);
        socket.off("locationUpdate");
        socket.off("statusUpdate");
      };
    }
  }, [socket, deliveryId]);

  const fetchDeliveryDetails = async () => {
    try {
      const response = await api.get(`/deliveries/${deliveryId}/track`);
      setDelivery(response.data);
      
      if (response.data.currentLocation) {
        setDriverLocation(response.data.currentLocation);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching delivery:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-blue-100 text-blue-800",
      Assigned: "bg-indigo-100 text-indigo-800",
      Accepted: "bg-purple-100 text-purple-800",
      "On Route": "bg-orange-100 text-orange-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: "⏳",
      Approved: "✅",
      Assigned: "👤",
      Accepted: "🤝",
      "On Route": "🚚",
      Delivered: "📦",
      Cancelled: "❌"
    };
    return icons[status] || "📋";
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(2);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Delivery Not Found</h2>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pickupLat = delivery.pickupLocation?.lat;
  const pickupLng = delivery.pickupLocation?.lng;
  const dropLat = delivery.dropLocation?.lat;
  const dropLng = delivery.dropLocation?.lng;
  const currentLat = driverLocation?.lat || delivery.currentLocation?.lat;
  const currentLng = driverLocation?.lng || delivery.currentLocation?.lng;

  let distanceToDestination = null;
  if (currentLat && currentLng && dropLat && dropLng) {
    distanceToDestination = calculateDistance(currentLat, currentLng, dropLat, dropLng);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📍 Real-Time Tracking</h1>
          <p className="text-gray-600">Track your delivery in real-time</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🗺️ Live Map</h2>
              
              {/* Map Visualization */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-8 mb-4 relative overflow-hidden" style={{ height: "500px" }}>
                {/* Pickup Location */}
                {pickupLat && pickupLng && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="text-2xl mb-1">📍</div>
                    <div className="text-xs font-semibold">PICKUP</div>
                    <div className="text-xs font-mono">{pickupLat.toFixed(6)}</div>
                    <div className="text-xs font-mono">{pickupLng.toFixed(6)}</div>
                  </div>
                )}

                {/* Drop Location */}
                {dropLat && dropLng && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-xs font-semibold">DROP-OFF</div>
                    <div className="text-xs font-mono">{dropLat.toFixed(6)}</div>
                    <div className="text-xs font-mono">{dropLng.toFixed(6)}</div>
                  </div>
                )}

                {/* Current Driver Location */}
                {currentLat && currentLng && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="bg-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl">
                      <div className="text-4xl mb-2">🚚</div>
                      <div className="text-xs font-semibold">DRIVER</div>
                      <div className="text-xs font-mono">{currentLat.toFixed(6)}</div>
                      <div className="text-xs font-mono">{currentLng.toFixed(6)}</div>
                      {distanceToDestination && (
                        <div className="text-xs mt-2 bg-white text-blue-600 px-2 py-1 rounded">
                          {distanceToDestination} km to destination
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Route Line Visualization */}
                {pickupLat && pickupLng && dropLat && dropLng && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: "#10b981", stopOpacity: 0.5 }} />
                        <stop offset="100%" style={{ stopColor: "#ef4444", stopOpacity: 0.5 }} />
                      </linearGradient>
                    </defs>
                    <line
                      x1="20%"
                      y1="20%"
                      x2="80%"
                      y2="20%"
                      stroke="url(#routeGradient)"
                      strokeWidth="4"
                      strokeDasharray="10,5"
                    />
                  </svg>
                )}

                {/* No Location Message */}
                {!currentLat && !currentLng && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📡</div>
                      <p className="text-gray-600 font-semibold">Waiting for driver location...</p>
                      <p className="text-sm text-gray-500 mt-2">Location will appear once driver starts the delivery</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-xs text-green-700 font-semibold mb-1">📍 PICKUP COORDINATES</p>
                  {pickupLat && pickupLng ? (
                    <>
                      <p className="text-sm font-mono text-gray-800">Lat: {pickupLat.toFixed(6)}</p>
                      <p className="text-sm font-mono text-gray-800">Lng: {pickupLng.toFixed(6)}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Not available</p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs text-blue-700 font-semibold mb-1">🚚 CURRENT LOCATION</p>
                  {currentLat && currentLng ? (
                    <>
                      <p className="text-sm font-mono text-gray-800">Lat: {currentLat.toFixed(6)}</p>
                      <p className="text-sm font-mono text-gray-800">Lng: {currentLng.toFixed(6)}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Updated: {new Date(driverLocation?.lastUpdated || delivery.currentLocation?.lastUpdated).toLocaleTimeString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Waiting...</p>
                  )}
                </div>

                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="text-xs text-red-700 font-semibold mb-1">🎯 DROP COORDINATES</p>
                  {dropLat && dropLng ? (
                    <>
                      <p className="text-sm font-mono text-gray-800">Lat: {dropLat.toFixed(6)}</p>
                      <p className="text-sm font-mono text-gray-800">Lng: {dropLng.toFixed(6)}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Not available</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Delivery Details Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">📦 Delivery Status</h3>
              
              <div className="flex items-center justify-center mb-4">
                <div className={`text-6xl mb-2`}>{getStatusIcon(delivery.status)}</div>
              </div>
              
              <div className={`px-4 py-3 rounded-lg text-center font-bold text-lg ${getStatusColor(delivery.status)}`}>
                {delivery.status}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery ID:</span>
                  <span className="font-semibold text-gray-800">{delivery.deliveryId}</span>
                </div>
                {distanceToDestination && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance to Drop:</span>
                    <span className="font-semibold text-blue-600">{distanceToDestination} km</span>
                  </div>
                )}
                {delivery.estimatedDistance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Distance:</span>
                    <span className="font-semibold text-gray-800">{delivery.estimatedDistance} km</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Driver Info */}
            {delivery.assignedDriver && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">👨‍✈️ Driver Details</h3>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {delivery.assignedDriver.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{delivery.assignedDriver.name}</p>
                    <p className="text-sm text-gray-600">{delivery.assignedDriver.email}</p>
                  </div>
                </div>

                {delivery.assignedVehicle && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">🚚 Vehicle</p>
                    <p className="font-semibold text-gray-800">{delivery.assignedVehicle.name}</p>
                    <p className="text-sm text-gray-600">{delivery.assignedVehicle.plateNumber}</p>
                    <p className="text-xs text-gray-500">{delivery.assignedVehicle.type}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Locations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">📍 Locations</h3>
              
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="text-xs text-green-700 font-semibold mb-1">PICKUP</p>
                  <p className="text-sm text-gray-800">{delivery.pickupLocation?.address}</p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                  <p className="text-xs text-red-700 font-semibold mb-1">DROP-OFF</p>
                  <p className="text-sm text-gray-800">{delivery.dropLocation?.address}</p>
                </div>
              </div>
            </motion.div>

            {/* Pricing */}
            {delivery.pricing && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">💰 Pricing</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-semibold">₹{delivery.pricing.basePrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight Charge:</span>
                    <span className="font-semibold">₹{delivery.pricing.weightCharge?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance Charge:</span>
                    <span className="font-semibold">₹{delivery.pricing.distanceCharge?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cluster Charge:</span>
                    <span className="font-semibold">₹{delivery.pricing.clusterCharge?.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold text-gray-800">Total:</span>
                    <span className="font-bold text-blue-600 text-lg">₹{delivery.pricing.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;
