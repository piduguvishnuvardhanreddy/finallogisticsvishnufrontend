import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FeedbackModal from "../components/FeedbackModal";
import AddMoneyButton from "../components/AddMoneyButton";
import { useDeliveries } from "../context/DeliveriesContext";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { deliveries: bookings, loading, cancelBooking, getStats, refreshDeliveries } = useDeliveries();
  const socket = useSocket();
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, delivery: null });
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    // Force refresh when component mounts
    console.log("CustomerDashboard mounted - fetching deliveries");
    refreshDeliveries();
    fetchWalletBalance();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log("Auto-refreshing deliveries");
      refreshDeliveries();
      fetchWalletBalance();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshDeliveries]);

  const fetchWalletBalance = async () => {
    try {
      // Try new endpoint first
      const response = await api.get("/money/balance");
      setWalletBalance(response.data.balance || 0);
      console.log("💰 Wallet balance fetched:", response.data.balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      // Fallback to 0
      setWalletBalance(0);
    }
  };

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket) return;

    // Join delivery rooms for all customer bookings
    bookings.forEach(booking => {
      socket.emit('joinDelivery', booking._id);
    });

    // Listen for status updates
    socket.on('statusUpdate', (data) => {
      console.log('📡 Status update received:', data);
      refreshDeliveries();
    });

    // Listen for location updates
    socket.on('locationUpdate', (data) => {
      console.log('📍 Location update received:', data);
    });

    // Cleanup
    return () => {
      bookings.forEach(booking => {
        socket.emit('leaveDelivery', booking._id);
      });
      socket.off('statusUpdate');
      socket.off('locationUpdate');
    };
  }, [socket, bookings, refreshDeliveries]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    const result = await cancelBooking(id);
    if (result.success) {
      alert("✅ Booking cancelled successfully");
    } else {
      alert(result.error || "Failed to cancel booking");
    }
  };

  const openFeedbackModal = (delivery) => {
    setFeedbackModal({ isOpen: true, delivery });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, delivery: null });
  };

  const handleFeedbackSuccess = () => {
    refreshDeliveries();
  };

  const stats = getStats();

  // Debug: Log bookings whenever they change
  useEffect(() => {
    console.log("Bookings updated:", bookings);
    console.log("Total bookings:", bookings.length);
  }, [bookings]);

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      Approved: "bg-green-100 text-green-700",
      Assigned: "bg-blue-100 text-blue-700",
      Accepted: "bg-indigo-100 text-indigo-700",
      "On Route": "bg-orange-100 text-orange-700",
      Delivered: "bg-emerald-100 text-emerald-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🛒 My Bookings
            </h1>
            <p className="text-gray-600">Manage and track your delivery bookings</p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            {/* Balance Display */}
            <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2">
              💰 Balance: ₹{walletBalance.toFixed(2)}
            </div>
            
            {/* NEW ADD MONEY BUTTON COMPONENT */}
            <AddMoneyButton onSuccess={fetchWalletBalance} />
            
            {/* View Wallet Button */}
            <button
              onClick={() => navigate("/customer/wallet")}
              className="px-4 py-3 bg-white border-2 border-green-600 text-green-600 font-semibold rounded-lg shadow-lg hover:bg-green-50"
            >
              📊 View Wallet
            </button>
            <motion.button
              onClick={refreshDeliveries}
              className="px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Refresh
            </motion.button>
            <motion.button
              onClick={() => navigate("/customer/book")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              📦 Book New Delivery
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-orange-600">{stats.onRoute}</div>
            <div className="text-sm text-gray-600">On Route</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
        </motion.div>

        {/* Bookings List */}
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
              <p className="text-gray-600 font-medium">Loading bookings...</p>
            </div>
          </motion.div>
        ) : bookings.length === 0 ? (
          <motion.div
            className="bg-white p-12 rounded-2xl shadow-lg border border-gray-100 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first delivery booking</p>
            <motion.button
              onClick={() => navigate("/customer/book")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Booking
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking._id}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  {/* Left Section - Booking Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <motion.span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          booking.status
                        )}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {booking.status}
                      </motion.span>
                      <span className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 font-medium">📍 Pickup</div>
                        <div className="text-gray-900 font-semibold">
                          {booking.pickupLocation?.address || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">🎯 Drop</div>
                        <div className="text-gray-900 font-semibold">
                          {booking.dropLocation?.address || "N/A"}
                        </div>
                      </div>
                    </div>

                    {booking.packageDetails && (
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">
                          <strong>Type:</strong> {booking.packageDetails.packageType || "N/A"}
                        </span>
                        <span className="text-gray-600">
                          <strong>Weight:</strong> {booking.packageDetails.weight || "N/A"} kg
                        </span>
                      </div>
                    )}

                    {booking.assignedDriver && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">👤 Assigned Driver</div>
                        <div className="text-gray-900 font-semibold">
                          {booking.assignedDriver.name}
                        </div>
                      </div>
                    )}

                    {booking.assignedVehicle && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600">🚚 Assigned Vehicle</div>
                        <div className="text-gray-900 font-semibold">
                          {booking.assignedVehicle.name} ({booking.assignedVehicle.plateNumber})
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex lg:flex-col gap-2">
                    {booking.status === "On Route" && (
                      <motion.button
                        onClick={() => navigate(`/track/${booking._id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🗺️ Track
                      </motion.button>
                    )}
                    {booking.status === "Delivered" && !booking.feedback && (
                      <motion.button
                        onClick={() => openFeedbackModal(booking)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ⭐ Rate Delivery
                      </motion.button>
                    )}
                    {booking.status === "Delivered" && booking.feedback && (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-center">
                        ✅ Feedback Submitted
                      </div>
                    )}
                    {(booking.status === "Pending" || booking.status === "Approved") && (
                      <motion.button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ❌ Cancel
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={closeFeedbackModal}
        delivery={feedbackModal.delivery}
        onSuccess={handleFeedbackSuccess}
      />
    </div>
  );
};

export default CustomerDashboard;
