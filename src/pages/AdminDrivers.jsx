import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const AdminDrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [searchQuery, statusFilter, drivers]);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/users/drivers");
      setDrivers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    let filtered = drivers;

    if (statusFilter !== "All") {
      filtered = filtered.filter(d => d.driverProfile?.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDrivers(filtered);
  };

  const handleStatusChange = async (driverId, newStatus) => {
    try {
      await api.put(`/users/drivers/${driverId}/status`, { status: newStatus });
      alert("Driver status updated successfully!");
      fetchDrivers();
    } catch (error) {
      console.error("Error updating driver status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Inactive: "bg-gray-100 text-gray-800 border-gray-200",
      "On Leave": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Suspended: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Driver Management 👥</h1>
          <p className="text-gray-600">Manage and monitor all drivers</p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Drivers</label>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-600">
            <p className="text-sm text-gray-600 mb-1">Total Drivers</p>
            <p className="text-3xl font-bold text-gray-800">{drivers.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-600">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">
              {drivers.filter(d => d.driverProfile?.status === "Active").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-600">
            <p className="text-sm text-gray-600 mb-1">On Leave</p>
            <p className="text-3xl font-bold text-yellow-600">
              {drivers.filter(d => d.driverProfile?.status === "On Leave").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-gray-600">
            <p className="text-sm text-gray-600 mb-1">Inactive</p>
            <p className="text-3xl font-bold text-gray-600">
              {drivers.filter(d => d.driverProfile?.status === "Inactive").length}
            </p>
          </div>
        </motion.div>

        {/* Drivers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver, index) => (
            <motion.div
              key={driver._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {driver.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{driver.name}</h3>
                  <p className="text-sm text-gray-600">{driver.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{driver.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(driver.driverProfile?.status)}`}>
                    {driver.driverProfile?.status || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold">
                    {driver.driverProfile?.performance?.averageRating?.toFixed(1) || "0.0"} ⭐
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold">
                    {driver.driverProfile?.performance?.completedTrips || 0} trips
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Wallet:</span>
                  <span className="font-semibold text-green-600">
                    ₹{driver.driverProfile?.wallet?.balance?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <select
                  value={driver.driverProfile?.status || "Active"}
                  onChange={(e) => handleStatusChange(driver._id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                </select>
                <button
                  onClick={() => window.open(`/admin/drivers/${driver._id}`, '_blank')}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm"
                >
                  👁️ View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDrivers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No drivers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDrivers;
