import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const AdminDashboardEnhanced = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [driverStats, setDriverStats] = useState({});
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [deliveryStatsRes, driversRes, deliveriesRes, feedbackRes] = await Promise.all([
        api.get("/deliveries/stats"),
        api.get("/users/drivers/stats/overview"),
        api.get("/deliveries"),
        api.get("/feedback")
      ]);

      setStats(deliveryStatsRes.data);
      setDriverStats(driversRes.data);
      
      // Show ALL recent deliveries (not just completed)
      const allDeliveries = Array.isArray(deliveriesRes.data) ? deliveriesRes.data : deliveriesRes.data.deliveries || [];
      
      // Sort by most recent and take top 5
      const sortedDeliveries = allDeliveries.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      
      setRecentDeliveries(sortedDeliveries.slice(0, 5));
      setRecentFeedback(feedbackRes.data.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Admin Dashboard 🎯</h1>
          <p className="text-xl text-gray-600">Manage your logistics operations</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <button
            onClick={() => navigate("/admin/assign")}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">🚚</div>
            <h3 className="text-lg font-bold">Assign Delivery</h3>
          </button>
          <button
            onClick={() => navigate("/vehicles")}
            className="bg-gradient-to-br from-green-600 to-teal-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">🚗</div>
            <h3 className="text-lg font-bold">Manage Vehicles</h3>
          </button>
          <button
            onClick={() => navigate("/admin/drivers")}
            className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-bold">Manage Drivers</h3>
          </button>
          <button
            onClick={() => navigate("/admin/feedback")}
            className="bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-lg font-bold">View Feedback</h3>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-600">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total || 0}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-600">
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pending || 0}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-600">
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-gray-800">{(stats.assigned || 0) + (stats.onRoute || 0)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-600">
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.delivered || 0}</p>
                </div>
              </div>
            </motion.div>

            {/* Driver Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Driver Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Drivers</p>
                  <p className="text-3xl font-bold text-gray-800">{driverStats.total || 0}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">{driverStats.active || 0}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">On Delivery</p>
                  <p className="text-3xl font-bold text-orange-600">{driverStats.onDelivery || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Inactive</p>
                  <p className="text-3xl font-bold text-gray-600">{driverStats.inactive || 0}</p>
                </div>
              </div>
            </motion.div>

            {/* Recent Deliveries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recent Deliveries</h2>
                <button
                  onClick={() => navigate("/deliveries")}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {recentDeliveries.map((delivery) => (
                  <div
                    key={delivery._id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/track/${delivery._id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{delivery.deliveryId}</h3>
                        <p className="text-sm text-gray-600">
                          {delivery.customer?.name || "N/A"}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        delivery.status === "Delivered" ? "bg-green-100 text-green-800" :
                        delivery.status === "On Route" ? "bg-orange-100 text-orange-800" :
                        delivery.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {delivery.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>From: {delivery.pickupLocation?.address}</p>
                      <p>To: {delivery.dropLocation?.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Feedback */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Recent Feedback</h3>
                <button
                  onClick={() => navigate("/admin/feedback")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {recentFeedback.map((feedback) => (
                  <div key={feedback._id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {feedback.customer?.name}
                      </span>
                      <div className="text-yellow-500">
                        {"⭐".repeat(feedback.rating?.stars || 0)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{feedback.feedback}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Driver: {feedback.driver?.name}
                    </p>
                  </div>
                ))}
                {recentFeedback.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No feedback yet</p>
                )}
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white"
            >
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="opacity-90">Available Drivers</span>
                  <span className="text-2xl font-bold">{driverStats.available || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-90">Pending Approvals</span>
                  <span className="text-2xl font-bold">{stats.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-90">Active Deliveries</span>
                  <span className="text-2xl font-bold">{stats.onRoute || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Search */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Search</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/deliveries?search=${e.target.value}`);
                    }
                  }}
                />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/admin/drivers?search=${e.target.value}`);
                    }
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardEnhanced;
