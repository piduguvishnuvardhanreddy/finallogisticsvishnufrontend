import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../services/api";

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchWallet();
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

  const fetchWallet = async () => {
    try {
      const response = await api.get("/users/wallet");
      setWallet(response.data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/users/profile", formData);
      // Update profile state immediately
      setProfile(response.data);
      setFormData(response.data);
      // Also update localStorage user data
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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{profile?.name}</h3>
                    <p className="text-gray-600">{profile?.role}</p>
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
                </div>
              </div>
            )}
          </motion.div>

          {/* Wallet Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">My Wallet</h3>
              <div className="mb-4">
                <p className="text-sm opacity-90 mb-1">Current Balance</p>
                <p className="text-4xl font-bold">₹{wallet?.balance?.toFixed(2) || "0.00"}</p>
              </div>
              <button className="w-full py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                Add Money
              </button>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {wallet?.transactions?.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`font-bold ${transaction.type === "Credit" || transaction.type === "Refund" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "Credit" || transaction.type === "Refund" ? "+" : "-"}₹{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
                {(!wallet?.transactions || wallet.transactions.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No transactions yet</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
