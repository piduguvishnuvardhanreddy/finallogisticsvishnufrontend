import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useDeliveries } from "../context/DeliveriesContext";

const DriverDashboard = () => {
  const { deliveries, loading, acceptDelivery, rejectDelivery, updateDeliveryStatus, getStats, refreshDeliveries } = useDeliveries();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    refreshDeliveries();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = getStats();

  const handleAcceptDelivery = async (id) => {
    const result = await acceptDelivery(id);
    if (result.success) {
      alert("✅ Delivery accepted successfully!");
    } else {
      alert(result.error || "Failed to accept delivery");
    }
  };

  const handleRejectDelivery = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    const result = await rejectDelivery(selectedDelivery, rejectReason);
    if (result.success) {
      alert("✅ Delivery rejected");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedDelivery(null);
    } else {
      alert(result.error || "Failed to reject delivery");
    }
  };

  const handleStartDelivery = async (id) => {
    const result = await updateDeliveryStatus(id, "On Route");
    if (result.success) {
      alert("✅ Delivery started!");
    } else {
      alert(result.error || "Failed to start delivery");
    }
  };

  const handleCompleteDelivery = async (id) => {
    const result = await updateDeliveryStatus(id, "Delivered");
    if (result.success) {
      alert("✅ Delivery completed!");
    } else {
      alert(result.error || "Failed to complete delivery");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Assigned: "bg-yellow-100 text-yellow-700 border-yellow-300",
      Accepted: "bg-blue-100 text-blue-700 border-blue-300",
      "On Route": "bg-orange-100 text-orange-700 border-orange-300",
      Delivered: "bg-green-100 text-green-700 border-green-300",
      Rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const calculateRoute = (pickup, drop) => {
    if (!pickup?.lat || !drop?.lat) return null;
    const distance = Math.sqrt(
      Math.pow(pickup.lat - drop.lat, 2) + Math.pow(pickup.lng - drop.lng, 2)
    ) * 111; // Rough km conversion
    return distance.toFixed(2);
  };

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
            🚚 Driver Dashboard
          </h1>
          <p className="text-gray-600">Manage and track your assigned deliveries</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
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
            <div className="text-3xl font-bold text-yellow-600">{stats.assigned}</div>
            <div className="text-gray-600 font-medium text-sm">Assigned</div>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-blue-500">{stats.accepted}</div>
            <div className="text-gray-600 font-medium text-sm">Accepted</div>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-orange-600">{stats.onRoute}</div>
            <div className="text-gray-600 font-medium text-sm">On Route</div>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="text-3xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-gray-600 font-medium text-sm">Delivered</div>
          </motion.div>
        </motion.div>

        {/* Deliveries List */}
        {loading ? (
          <motion.div
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-600 font-medium">Loading deliveries...</p>
            </div>
          </motion.div>
        ) : deliveries.length === 0 ? (
          <motion.div
            className="bg-white p-12 rounded-2xl shadow-lg border border-gray-100 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Deliveries Assigned</h3>
            <p className="text-gray-600">You don't have any deliveries assigned yet</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery, idx) => (
              <motion.div
                key={delivery._id}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Section - Delivery Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <motion.span
                        className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(delivery.status)}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {delivery.status}
                      </motion.span>
                      <span className="text-sm text-gray-500">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Route Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <div className="text-xs text-green-700 font-semibold mb-1">📍 PICKUP</div>
                        <div className="text-gray-900 font-semibold">
                          {delivery.pickupLocation?.address || "N/A"}
                        </div>
                        {delivery.pickupLocation?.lat && (
                          <div className="text-xs text-gray-600 mt-1">
                            {delivery.pickupLocation.lat.toFixed(4)}, {delivery.pickupLocation.lng.toFixed(4)}
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <div className="text-xs text-red-700 font-semibold mb-1">🎯 DROP-OFF</div>
                        <div className="text-gray-900 font-semibold">
                          {delivery.dropLocation?.address || "N/A"}
                        </div>
                        {delivery.dropLocation?.lat && (
                          <div className="text-xs text-gray-600 mt-1">
                            {delivery.dropLocation.lat.toFixed(4)}, {delivery.dropLocation.lng.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Route Info */}
                    {calculateRoute(delivery.pickupLocation, delivery.dropLocation) && (
                      <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="text-xs text-blue-700 font-semibold">Distance</div>
                          <div className="text-lg font-bold text-blue-900">
                            {calculateRoute(delivery.pickupLocation, delivery.dropLocation)} km
                          </div>
                        </div>
                        {delivery.estimatedDuration && (
                          <div>
                            <div className="text-xs text-blue-700 font-semibold">Est. Duration</div>
                            <div className="text-lg font-bold text-blue-900">
                              {delivery.estimatedDuration} min
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Customer & Package Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {delivery.customer && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-xs text-purple-700 font-semibold">👤 Customer</div>
                          <div className="text-gray-900 font-semibold">{delivery.customer.name}</div>
                          <div className="text-sm text-gray-600">{delivery.customer.email}</div>
                        </div>
                      )}
                      {delivery.packageDetails && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="text-xs text-orange-700 font-semibold">📦 Package</div>
                          <div className="text-gray-900 font-semibold">
                            {delivery.packageDetails.packageType || "Standard"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {delivery.packageDetails.weight} kg
                          </div>
                        </div>
                      )}
                    </div>

                    {delivery.assignedVehicle && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-700 font-semibold">🚚 Vehicle</div>
                        <div className="text-gray-900 font-semibold">
                          {delivery.assignedVehicle.name} - {delivery.assignedVehicle.plateNumber}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {delivery.status === "Assigned" && (
                      <>
                        <motion.button
                          onClick={() => handleAcceptDelivery(delivery._id)}
                          className="px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ✅ Accept
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            setSelectedDelivery(delivery._id);
                            setShowRejectModal(true);
                          }}
                          className="px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ❌ Reject
                        </motion.button>
                      </>
                    )}
                    {delivery.status === "Accepted" && (
                      <motion.button
                        onClick={() => handleStartDelivery(delivery._id)}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🚀 Start Delivery
                      </motion.button>
                    )}
                    {delivery.status === "On Route" && (
                      <motion.button
                        onClick={() => handleCompleteDelivery(delivery._id)}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✓ Complete
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${delivery.pickupLocation?.lat},${delivery.pickupLocation?.lng}&destination=${delivery.dropLocation?.lat},${delivery.dropLocation?.lng}`, '_blank')}
                      className="px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🗺️ Navigate
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Reject Delivery</h3>
              <p className="text-gray-600 mb-4">Please provide a reason for rejecting this delivery:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="4"
              />
              <div className="flex gap-3">
                <motion.button
                  onClick={handleRejectDelivery}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirm Reject
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                    setSelectedDelivery(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverDashboard;
