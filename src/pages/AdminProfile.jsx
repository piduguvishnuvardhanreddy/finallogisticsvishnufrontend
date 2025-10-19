import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      setProfile(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [deliveriesRes, driversRes] = await Promise.all([
        api.get("/deliveries"),
        api.get("/auth/drivers")
      ]);
      
      const deliveries = deliveriesRes.data;
      const drivers = driversRes.data;
      
      setStats({
        totalDeliveries: deliveries.length,
        pendingDeliveries: deliveries.filter(d => d.status === "Pending").length,
        activeDeliveries: deliveries.filter(d => ["Assigned", "Accepted", "On Route"].includes(d.status)).length,
        completedDeliveries: deliveries.filter(d => d.status === "Delivered").length,
        totalDrivers: drivers.length,
        activeDrivers: drivers.filter(d => d.driverProfile?.status === "Active").length,
        totalRevenue: deliveries
          .filter(d => d.status === "Delivered")
          .reduce((sum, d) => sum + (d.pricing?.totalPrice || 0), 0)
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/users/profile", formData);
      setProfile(response.data);
      setFormData(response.data);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Failed to update profile: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-semibold shadow"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👑 Admin Profile</h1>
          <p className="text-gray-600">Manage your administrator account</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{profile?.name}</h3>
                    <p className="text-purple-600 font-semibold">👑 {profile?.role}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-800">{profile?.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-800">{profile?.phone || "Not provided"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="font-semibold text-gray-800">{profile?.address || "Not provided"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Account Created</p>
                    <p className="font-semibold text-gray-800">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="font-semibold text-gray-800">
                      {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* System Overview */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">📊 System Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Total Deliveries</span>
                  <span className="text-2xl font-bold">{stats?.totalDeliveries || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Pending</span>
                  <span className="text-2xl font-bold">{stats?.pendingDeliveries || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Active</span>
                  <span className="text-2xl font-bold">{stats?.activeDeliveries || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Completed</span>
                  <span className="text-2xl font-bold">{stats?.completedDeliveries || 0}</span>
                </div>
              </div>
            </div>

            {/* Drivers Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🚗 Drivers</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Drivers</span>
                  <span className="text-xl font-bold text-gray-800">{stats?.totalDrivers || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Active Drivers</span>
                  <span className="text-xl font-bold text-green-600">{stats?.activeDrivers || 0}</span>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">💰 Total Revenue</h3>
              <p className="text-4xl font-bold">₹{stats?.totalRevenue?.toFixed(2) || "0.00"}</p>
              <p className="text-sm text-green-100 mt-2">From completed deliveries</p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/admin/deliveries")}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  📋 View All Deliveries
                </button>
                <button
                  onClick={() => navigate("/admin/drivers")}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  👥 Manage Drivers
                </button>
                <button
                  onClick={() => navigate("/vehicles")}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  🚚 Manage Vehicles
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
