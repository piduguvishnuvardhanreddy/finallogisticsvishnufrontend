import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const DriverDashboardEnhanced = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, deliveriesRes, walletRes, profileRes] = await Promise.all([
        api.get("/deliveries/stats"),
        api.get("/deliveries/driver/assigned"),
        api.get("/users/wallet"),
        api.get("/users/profile")
      ]);

      setStats(statsRes.data);
      setDeliveries(deliveriesRes.data.filter(d => ["Assigned", "Accepted", "On Route"].includes(d.status)));
      setWallet(walletRes.data);
      setProfile(profileRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/accept`);
      alert("Delivery accepted successfully!");
      fetchDashboardData();
    } catch (error) {
      console.error("Error accepting delivery:", error);
      alert(error.response?.data?.message || "Failed to accept delivery");
    }
  };

  const handleStartDelivery = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/start`);
      alert("Delivery started!");
      navigate(`/driver/tracking/${deliveryId}`);
    } catch (error) {
      console.error("Error starting delivery:", error);
      alert(error.response?.data?.message || "Failed to start delivery");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Assigned: "bg-purple-100 text-purple-800 border-purple-200",
      Accepted: "bg-blue-100 text-blue-800 border-blue-200",
      "On Route": "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Driver Dashboard 🚗</h1>
          <p className="text-xl text-gray-600">Manage your deliveries and track earnings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
                <p className="text-sm text-gray-600 mb-1">Total Trips</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.total || 0}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-600">
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.onRoute || 0}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.delivered || 0}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600">
                <p className="text-sm text-gray-600 mb-1">Earnings</p>
                <p className="text-2xl font-bold text-gray-800">₹{stats?.totalEarnings?.toFixed(0) || 0}</p>
              </div>
            </motion.div>

            {/* Assigned Deliveries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Assigned Deliveries</h2>
                <button
                  onClick={() => navigate("/driver/deliveries")}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-4">
                {deliveries.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-600">No active deliveries</p>
                    <p className="text-sm text-gray-500 mt-2">New deliveries will appear here</p>
                  </div>
                ) : (
                  deliveries.map((delivery) => (
                    <div
                      key={delivery._id}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{delivery.deliveryId}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(delivery.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-700 mb-1">📍 Pickup</p>
                          <p className="font-semibold text-gray-800 text-sm">
                            {delivery.pickupLocation?.address}
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-700 mb-1">🎯 Drop</p>
                          <p className="font-semibold text-gray-800 text-sm">
                            {delivery.dropLocation?.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-4 text-sm">
                        <div className="bg-gray-100 px-3 py-1 rounded-lg">
                          <span className="text-gray-600">Weight:</span>{" "}
                          <span className="font-semibold">{delivery.packageDetails?.weight} kg</span>
                        </div>
                        <div className="bg-gray-100 px-3 py-1 rounded-lg">
                          <span className="text-gray-600">Distance:</span>{" "}
                          <span className="font-semibold">{delivery.estimatedDistance} km</span>
                        </div>
                        {delivery.driverEarnings?.netEarnings && (
                          <div className="bg-green-100 px-3 py-1 rounded-lg">
                            <span className="text-green-700">Earnings:</span>{" "}
                            <span className="font-bold text-green-800">₹{delivery.driverEarnings.netEarnings.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-3">
                        {delivery.status === "Assigned" && (
                          <>
                            <button
                              onClick={() => handleAcceptDelivery(delivery._id)}
                              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                            >
                              Accept
                            </button>
                            <button
                              className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {delivery.status === "Accepted" && (
                          <button
                            onClick={() => handleStartDelivery(delivery._id)}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                          >
                            Start Delivery
                          </button>
                        )}
                        {delivery.status === "On Route" && (
                          <button
                            onClick={() => navigate(`/driver/tracking/${delivery._id}`)}
                            className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                          >
                            Continue Tracking
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">My Wallet</h3>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  💰
                </div>
              </div>
              <div className="mb-2">
                <p className="text-sm opacity-90 mb-1">Available Balance</p>
                <p className="text-4xl font-bold">₹{wallet?.balance?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="mb-6">
                <p className="text-xs opacity-75">
                  Total Earned: ₹{wallet?.totalEarnings?.toFixed(2) || "0.00"}
                </p>
              </div>
              <button
                onClick={() => navigate("/driver/wallet")}
                className="w-full py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                View Wallet
              </button>
            </motion.div>

            {/* Driver Rating */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Your Rating</h3>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-yellow-500 mb-2">
                  {profile?.driverProfile?.performance?.averageRating?.toFixed(1) || "0.0"}
                </div>
                <div className="text-3xl mb-2">
                  {"⭐".repeat(Math.round(profile?.driverProfile?.performance?.averageRating || 0))}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {profile?.driverProfile?.ratings?.length || 0} reviews
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed Trips</span>
                  <span className="font-bold">{profile?.driverProfile?.performance?.completedTrips || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">On-Time Rate</span>
                  <span className="font-bold">{profile?.driverProfile?.performance?.onTimeDeliveryRate || 0}%</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/driver/deliveries")}
                  className="w-full py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-semibold text-left px-4"
                >
                  📋 All Deliveries
                </button>
                <button
                  onClick={() => navigate("/driver/earnings")}
                  className="w-full py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-semibold text-left px-4"
                >
                  💵 Earnings Analytics
                </button>
                <button
                  onClick={() => navigate("/driver/profile")}
                  className="w-full py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition font-semibold text-left px-4"
                >
                  👤 My Profile
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardEnhanced;
