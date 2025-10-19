import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const CustomerDeliveries = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [rating, setRating] = useState({
    stars: 5,
    feedback: "",
    categories: {
      punctuality: 5,
      professionalism: 5,
      vehicleCondition: 5,
      communication: 5
    }
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [searchQuery, statusFilter, deliveries]);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get("/deliveries/customer/my-bookings");
      // Remove duplicates based on _id
      const uniqueDeliveries = response.data.filter((delivery, index, self) =>
        index === self.findIndex((d) => d._id === delivery._id)
      );
      setDeliveries(uniqueDeliveries);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let filtered = deliveries;

    if (statusFilter !== "All") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.deliveryId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.pickupLocation?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.dropLocation?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDeliveries(filtered);
  };

  const handleCancelDelivery = async (deliveryId) => {
    if (!window.confirm("Are you sure you want to cancel this delivery?")) return;

    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    try {
      await api.put(`/deliveries/${deliveryId}/cancel-advanced`, { reason });
      alert("Delivery cancelled successfully. Refund will be processed to your wallet.");
      fetchDeliveries();
    } catch (error) {
      console.error("Error cancelling delivery:", error);
      alert(error.response?.data?.message || "Failed to cancel delivery");
    }
  };

  const openRatingModal = (delivery) => {
    setSelectedDelivery(delivery);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    try {
      await api.post(`/deliveries/${selectedDelivery._id}/rate`, rating);
      alert("Thank you for your feedback!");
      setShowRatingModal(false);
      fetchDeliveries();
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(error.response?.data?.message || "Failed to submit rating");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-blue-100 text-blue-800",
      Assigned: "bg-purple-100 text-purple-800",
      Accepted: "bg-indigo-100 text-indigo-800",
      "On Route": "bg-orange-100 text-orange-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      Rejected: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Deliveries</h1>
          <p className="text-gray-600">Track and manage all your delivery orders</p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Deliveries</label>
              <input
                type="text"
                placeholder="Search by ID, pickup, or drop location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Assigned">Assigned</option>
                <option value="On Route">On Route</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Deliveries List */}
        <div className="space-y-4">
          {filteredDeliveries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No deliveries found</h3>
              <p className="text-gray-600 mb-6">Start by creating a new delivery booking</p>
              <button
                onClick={() => navigate("/customer/book")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Book New Delivery
              </button>
            </motion.div>
          ) : (
            filteredDeliveries.map((delivery, index) => (
              <motion.div
                key={delivery._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{delivery.deliveryId}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">📍 Pickup</p>
                        <p className="font-semibold text-gray-800">{delivery.pickupLocation?.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">🎯 Drop</p>
                        <p className="font-semibold text-gray-800">{delivery.dropLocation?.address}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Weight:</span> {delivery.packageDetails?.weight} kg
                      </div>
                      <div>
                        <span className="font-medium">Cluster:</span> {delivery.packageDetails?.cluster}
                      </div>
                      {delivery.pricing?.totalPrice && (
                        <div>
                          <span className="font-medium">Price:</span> ₹{delivery.pricing.totalPrice.toFixed(2)}
                        </div>
                      )}
                      {delivery.assignedDriver && (
                        <div>
                          <span className="font-medium">Driver:</span> {delivery.assignedDriver.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                    {delivery.status === "On Route" && (
                      <button
                        onClick={() => navigate(`/track/${delivery._id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        Track Live
                      </button>
                    )}
                    
                    {delivery.status === "Delivered" && !delivery.rating?.stars && (
                      <button
                        onClick={() => openRatingModal(delivery)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        Rate Delivery
                      </button>
                    )}

                    {delivery.status === "Delivered" && delivery.rating?.stars && (
                      <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <div className="text-yellow-600 font-semibold">
                          {"⭐".repeat(delivery.rating.stars)}
                        </div>
                        <p className="text-xs text-gray-600">Rated</p>
                      </div>
                    )}
                    
                    {!["Delivered", "Cancelled"].includes(delivery.status) && (
                      <button
                        onClick={() => handleCancelDelivery(delivery._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/track/${delivery._id}`)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Rate Your Delivery</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Overall Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating({ ...rating, stars: star })}
                      className="text-4xl transition"
                    >
                      {star <= rating.stars ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Punctuality</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rating.categories.punctuality}
                  onChange={(e) => setRating({
                    ...rating,
                    categories: { ...rating.categories, punctuality: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Poor</span>
                  <span>{rating.categories.punctuality}/5</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Professionalism</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rating.categories.professionalism}
                  onChange={(e) => setRating({
                    ...rating,
                    categories: { ...rating.categories, professionalism: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Poor</span>
                  <span>{rating.categories.professionalism}/5</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Condition</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rating.categories.vehicleCondition}
                  onChange={(e) => setRating({
                    ...rating,
                    categories: { ...rating.categories, vehicleCondition: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Poor</span>
                  <span>{rating.categories.vehicleCondition}/5</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rating.categories.communication}
                  onChange={(e) => setRating({
                    ...rating,
                    categories: { ...rating.categories, communication: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Poor</span>
                  <span>{rating.categories.communication}/5</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                <textarea
                  value={rating.feedback}
                  onChange={(e) => setRating({ ...rating, feedback: e.target.value })}
                  placeholder="Share your experience..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRating}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CustomerDeliveries;
