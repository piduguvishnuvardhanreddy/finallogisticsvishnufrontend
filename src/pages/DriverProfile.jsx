import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const DriverProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, totalEarnings: 0 });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleType: ""
  });

  useEffect(() => {
    fetchProfile();
    fetchWallet();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      setProfile(response.data);
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        vehicleType: response.data.driverProfile?.vehicleType || ""
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Updating profile with data:", formData);
      
      const response = await api.put("/users/profile", formData);
      
      console.log("Profile update response:", response.data);
      
      // Update profile state immediately
      setProfile(response.data);
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        vehicleType: response.data.driverProfile?.vehicleType || ""
      });
      // Update localStorage user data
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("✅ Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to update profile. Please try again.";
      alert(errorMessage);
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
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/driver/dashboard")}
            className="mb-4 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold shadow"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👤 My Profile</h1>
          <p className="text-gray-600">View and edit your driver profile</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white mb-6">
              <div className="text-center">
                <p className="text-green-100 text-sm mb-2">Available Balance</p>
                <h2 className="text-4xl font-bold mb-4">₹{wallet.balance.toFixed(2)}</h2>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-green-100">Total Earnings</p>
                  <p className="text-2xl font-bold">₹{wallet.totalEarnings.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => navigate("/driver/earnings")}
                  className="w-full py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
                >
                  View Earnings
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    profile?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {profile?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Completed Trips</span>
                  <span className="font-bold text-purple-700">
                    {profile?.driverProfile?.performance?.completedTrips || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-700">Total Trips</span>
                  <span className="font-bold text-orange-700">
                    {profile?.driverProfile?.performance?.totalTrips || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Profile Details</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select vehicle type</option>
                      <option value="Bike">Bike</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        fetchProfile();
                      }}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-gray-800">{profile?.name}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-800">{profile?.email}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-800">{profile?.phone || "Not provided"}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">License Number</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {profile?.driverProfile?.licenseNumber || "Not provided"}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {profile?.driverProfile?.vehicleType || "Not specified"}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Member Since</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(profile?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
