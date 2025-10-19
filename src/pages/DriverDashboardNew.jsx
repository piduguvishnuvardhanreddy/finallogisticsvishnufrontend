import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const DriverDashboardNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, totalEarnings: 0 });
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDeliveries(),
        fetchWallet()
      ]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await api.get("/deliveries/driver/assigned");
      setDeliveries(response.data);
      
      // Calculate stats
      const assigned = response.data.filter(d => d.status === "Assigned").length;
      const inProgress = response.data.filter(d => ["Accepted", "On Route"].includes(d.status)).length;
      const completed = response.data.filter(d => d.status === "Delivered").length;
      
      setStats({
        assigned,
        inProgress,
        completed,
        total: response.data.length
      });
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await api.get("/wallet/driver/balance");
      setWallet({
        balance: response.data.balance || 0,
        totalEarnings: response.data.totalEarnings || 0
      });
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const handleAccept = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/accept`);
      alert("✅ Delivery accepted!");
      fetchDeliveries();
    } catch (error) {
      console.error("Error accepting delivery:", error);
      alert(error.response?.data?.message || "Failed to accept delivery");
    }
  };

  const handleReject = async (deliveryId) => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason) return;

    try {
      await api.put(`/deliveries/${deliveryId}/reject`, { reason });
      alert("✅ Delivery rejected");
      fetchDeliveries();
    } catch (error) {
      console.error("Error rejecting delivery:", error);
      alert(error.response?.data?.message || "Failed to reject delivery");
    }
  };

  const handleStart = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/start`);
      alert("✅ Delivery started!");
      fetchDeliveries();
    } catch (error) {
      console.error("Error starting delivery:", error);
      alert(error.response?.data?.message || "Failed to start delivery");
    }
  };

  const handleComplete = async (deliveryId) => {
    if (!confirm("Mark this delivery as completed?")) return;

    try {
      const response = await api.put(`/deliveries/${deliveryId}/complete`);
      alert("✅ Delivery completed! Earnings credited to your wallet.");
      fetchDeliveries();
      fetchWallet(); // Refresh wallet balance
    } catch (error) {
      console.error("Error completing delivery:", error);
      alert(error.response?.data?.message || "Failed to complete delivery");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Assigned": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "Accepted": "bg-blue-100 text-blue-700 border-blue-300",
      "On Route": "bg-purple-100 text-purple-700 border-purple-300",
      "Delivered": "bg-green-100 text-green-700 border-green-300"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getActionButtons = (delivery) => {
    switch (delivery.status) {
      case "Assigned":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(delivery._id)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              ✅ Accept
            </button>
            <button
              onClick={() => handleReject(delivery._id)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              ❌ Reject
            </button>
          </div>
        );
      case "Accepted":
        return (
          <button
            onClick={() => handleStart(delivery._id)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            🚀 Start Delivery
          </button>
        );
      case "On Route":
        return (
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/track/${delivery._id}`)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              📍 Track & Update Location
            </button>
            <button
              onClick={() => handleComplete(delivery._id)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              ✅ Mark as Delivered
            </button>
          </div>
        );
      case "Delivered":
        return (
          <div className="text-center text-green-600 font-semibold py-2">
            ✅ Completed
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">🚚 Driver Dashboard</h1>
              <p className="text-gray-600">Manage your deliveries and track earnings</p>
            </div>
            <button
              onClick={() => navigate("/driver/profile")}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold shadow-lg"
            >
              👤 View Profile
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white"
          >
            <div className="text-4xl mb-2">💰</div>
            <p className="text-green-100 text-sm">Available Balance</p>
            <h3 className="text-3xl font-bold">₹{wallet.balance.toFixed(2)}</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white"
          >
            <div className="text-4xl mb-2">📊</div>
            <p className="text-blue-100 text-sm">Total Earnings</p>
            <h3 className="text-3xl font-bold">₹{wallet.totalEarnings.toFixed(2)}</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white"
          >
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-purple-100 text-sm">In Progress</p>
            <h3 className="text-3xl font-bold">{stats.inProgress}</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white"
          >
            <div className="text-4xl mb-2">✅</div>
            <p className="text-orange-100 text-sm">Completed</p>
            <h3 className="text-3xl font-bold">{stats.completed}</h3>
          </motion.div>
        </div>

        {/* Deliveries Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 My Deliveries</h2>

          {deliveries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl">No deliveries assigned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deliveries.map((delivery, index) => (
                <motion.div
                  key={delivery._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{delivery.deliveryId}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Customer</p>
                    <p className="font-semibold text-gray-800">{delivery.customer?.name}</p>
                    <p className="text-sm text-gray-600">{delivery.customer?.contactNumber}</p>
                  </div>

                  {/* Locations */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">📍</div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Pickup</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {delivery.pickupLocation?.address}
                        </p>
                        <p className="text-xs text-gray-500">
                          {delivery.pickupLocation?.lat?.toFixed(6)}, {delivery.pickupLocation?.lng?.toFixed(6)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">🎯</div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Drop</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {delivery.dropLocation?.address}
                        </p>
                        <p className="text-xs text-gray-500">
                          {delivery.dropLocation?.lat?.toFixed(6)}, {delivery.dropLocation?.lng?.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <p className="text-xs text-green-700 mb-1">Your Earnings</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₹{delivery.driverEarnings?.netEarnings?.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {getActionButtons(delivery)}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DriverDashboardNew;
