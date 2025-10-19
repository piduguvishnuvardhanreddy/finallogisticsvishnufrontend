import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const CustomerDashboardEnhanced = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, deliveriesRes, walletRes] = await Promise.all([
        api.get("/deliveries/stats"),
        api.get("/deliveries/customer/my-bookings"),
        api.get("/users/wallet")
      ]);

      setStats(statsRes.data);
      setRecentDeliveries(deliveriesRes.data.slice(0, 5));
      setWallet(walletRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Approved: "bg-blue-100 text-blue-800 border-blue-200",
      Assigned: "bg-purple-100 text-purple-800 border-purple-200",
      "On Route": "bg-orange-100 text-orange-800 border-orange-200",
      Delivered: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Welcome Back! 👋</h1>
          <p className="text-xl text-gray-600">Here's what's happening with your deliveries</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <button
            onClick={() => navigate("/customer/book-enhanced")}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-2xl font-bold mb-2">Book Delivery</h3>
            <p className="text-blue-100">Create a new delivery request</p>
          </button>

          <button
            onClick={() => navigate("/customer/deliveries")}
            className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-2xl font-bold mb-2">My Deliveries</h3>
            <p className="text-purple-100">View all your orders</p>
          </button>

          <button
            onClick={() => navigate("/customer/profile")}
            className="bg-gradient-to-br from-green-600 to-teal-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-2xl font-bold mb-2">My Profile</h3>
            <p className="text-green-100">Manage your account</p>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.total || 0}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-600">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.pending || 0}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-600">
                <p className="text-sm text-gray-600 mb-1">On Route</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.onRoute || 0}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
                <p className="text-sm text-gray-600 mb-1">Delivered</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.delivered || 0}</p>
              </div>
            </motion.div>

            {/* Recent Deliveries */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recent Deliveries</h2>
                <button
                  onClick={() => navigate("/customer/deliveries")}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-4">
                {recentDeliveries.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-600 mb-4">No deliveries yet</p>
                    <button
                      onClick={() => navigate("/customer/book-enhanced")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Book Your First Delivery
                    </button>
                  </div>
                ) : (
                  recentDeliveries.map((delivery) => (
                    <div
                      key={delivery._id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/track/${delivery._id}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800">{delivery.deliveryId}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(delivery.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">From:</p>
                          <p className="font-semibold text-gray-800 truncate">
                            {delivery.pickupLocation?.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">To:</p>
                          <p className="font-semibold text-gray-800 truncate">
                            {delivery.dropLocation?.address}
                          </p>
                        </div>
                      </div>
                      {delivery.pricing?.totalPrice && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            Total: <span className="font-bold text-gray-800">₹{delivery.pricing.totalPrice.toFixed(2)}</span>
                          </p>
                        </div>
                      )}
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
              className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">My Wallet</h3>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  💰
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm opacity-90 mb-1">Available Balance</p>
                <p className="text-4xl font-bold">₹{wallet?.balance?.toFixed(2) || "0.00"}</p>
              </div>
              <button
                onClick={() => navigate("/customer/add-money")}
                className="w-full py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition transform hover:scale-105"
              >
                ➕ Add Money
              </button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Active Orders</span>
                  <span className="font-bold text-blue-600">{(stats?.assigned || 0) + (stats?.onRoute || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Completed</span>
                  <span className="font-bold text-green-600">{stats?.delivered || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-700">Cancelled</span>
                  <span className="font-bold text-red-600">{stats?.cancelled || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Help Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white"
            >
              <div className="text-4xl mb-3">🆘</div>
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-sm opacity-90 mb-4">
                Our support team is available 24/7 to assist you
              </p>
              <button className="w-full py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                Contact Support
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardEnhanced;
