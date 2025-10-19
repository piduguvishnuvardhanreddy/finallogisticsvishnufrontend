import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useDrivers } from "../context/DriversContext";
import { useVehicles } from "../context/VehiclesContext";
import { useDeliveries } from "../context/DeliveriesContext";

const AdminDashboard = () => {
  const { deliveries, loading, approveDelivery, getStats, refreshDeliveries } = useDeliveries();
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();
  const navigate = useNavigate();

  useEffect(() => {
    refreshDeliveries();
  }, []);

  const stats = getStats();

  const handleApprove = async (id) => {
    const result = await approveDelivery(id);
    if (result.success) {
      alert("✅ Delivery approved successfully!");
    } else {
      alert(result.error || "Failed to approve delivery");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      Approved: "bg-green-100 text-green-700",
      Assigned: "bg-blue-100 text-blue-700",
      Accepted: "bg-indigo-100 text-indigo-700",
      "On Route": "bg-orange-100 text-orange-700",
      Delivered: "bg-emerald-100 text-emerald-700",
      Cancelled: "bg-red-100 text-red-700",
      Rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const pendingApprovals = deliveries.filter(d => d.status === "Pending");
  const approvedDeliveries = deliveries.filter(d => d.status === "Approved");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            👑 Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage deliveries, approve bookings, and assign drivers</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-600 font-medium text-sm">Total</div>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-600 font-medium text-sm">Pending</div>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-gray-600 font-medium text-sm">Approved</div>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-blue-500">{stats.assigned}</div>
            <div className="text-gray-600 font-medium text-sm">Assigned</div>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-orange-600">{stats.onRoute}</div>
            <div className="text-gray-600 font-medium text-sm">Active</div>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-emerald-600">{stats.delivered}</div>
            <div className="text-gray-600 font-medium text-sm">Delivered</div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => navigate("/admin/deliveries")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl shadow-lg font-semibold"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            📋 Detailed Delivery List
          </motion.button>
          <motion.button
            onClick={() => navigate("/deliveries")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-lg font-semibold"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            📦 Manage Deliveries
          </motion.button>
          <motion.button
            onClick={() => navigate("/vehicles")}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 rounded-xl shadow-lg font-semibold"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            🚚 Manage Vehicles
          </motion.button>
          <motion.button
            onClick={() => navigate("/admin/assign")}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-xl shadow-lg font-semibold"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            ✨ Assign Delivery
          </motion.button>
        </motion.div>

        {/* Pending Approvals Section */}
        {pendingApprovals.length > 0 && (
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-300 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ⚠️ Pending Approvals ({pendingApprovals.length})
            </h3>
            <div className="space-y-3">
              {pendingApprovals.map((delivery, idx) => (
                <motion.div
                  key={delivery._id}
                  className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-bold">
                          {delivery.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(delivery.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600 font-semibold">📍 Pickup</div>
                          <div className="text-gray-900 font-semibold">
                            {delivery.pickupLocation?.address || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 font-semibold">🎯 Drop</div>
                          <div className="text-gray-900 font-semibold">
                            {delivery.dropLocation?.address || "N/A"}
                          </div>
                        </div>
                      </div>
                      {delivery.customer && (
                        <div className="mt-2 text-sm text-gray-700">
                          <strong>Customer:</strong> {delivery.customer.name} ({delivery.customer.email})
                        </div>
                      )}
                      {delivery.packageDetails && (
                        <div className="mt-1 text-sm text-gray-700">
                          <strong>Package:</strong> {delivery.packageDetails.packageType} - {delivery.packageDetails.weight}kg
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleApprove(delivery._id)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✅ Approve
                      </motion.button>
                      <motion.button
                        onClick={() => navigate("/admin/assign")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        👁️ View
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Approved - Ready to Assign */}
        {approvedDeliveries.length > 0 && (
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-300 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ✅ Approved - Ready to Assign ({approvedDeliveries.length})
            </h3>
            <div className="space-y-3">
              {approvedDeliveries.map((delivery, idx) => (
                <motion.div
                  key={delivery._id}
                  className="p-4 bg-green-50 border border-green-200 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-bold">
                          {delivery.status}
                        </span>
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {delivery.pickupLocation?.address} → {delivery.dropLocation?.address}
                      </div>
                      {delivery.customer && (
                        <div className="mt-2 text-sm text-gray-700">
                          <strong>Customer:</strong> {delivery.customer.name}
                        </div>
                      )}
                    </div>
                    <motion.button
                      onClick={() => navigate("/admin/assign")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🚚 Assign Driver
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Deliveries Summary */}
        <motion.div
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 All Deliveries</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No deliveries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Route</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Driver</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.slice(0, 10).map((delivery) => (
                    <tr key={delivery._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-800">
                        {delivery.customer?.name || "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-800">
                        {delivery.pickupLocation?.address?.substring(0, 30)}... → {delivery.dropLocation?.address?.substring(0, 30)}...
                      </td>
                      <td className="p-3 text-sm text-gray-800">
                        {delivery.assignedDriver?.name || "Unassigned"}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
