import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../services/api";

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [viewedFilter, setViewedFilter] = useState("All");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [searchQuery, ratingFilter, viewedFilter, feedback]);

  const fetchFeedback = async () => {
    try {
      const response = await api.get("/feedback");
      setFeedback(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setLoading(false);
    }
  };

  const filterFeedback = () => {
    let filtered = feedback;

    if (ratingFilter !== "All") {
      filtered = filtered.filter(f => f.rating?.stars === parseInt(ratingFilter));
    }

    if (viewedFilter !== "All") {
      filtered = filtered.filter(f => f.adminViewed === (viewedFilter === "Viewed"));
    }

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.feedback?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFeedback(filtered);
  };

  const markAsViewed = async (feedbackId) => {
    try {
      await api.put(`/feedback/${feedbackId}/mark-viewed`);
      fetchFeedback();
    } catch (error) {
      console.error("Error marking feedback as viewed:", error);
    }
  };

  const openResponseModal = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowResponseModal(true);
    markAsViewed(feedbackItem._id);
  };

  const submitResponse = async () => {
    try {
      await api.post(`/feedback/${selectedFeedback._id}/respond`, {
        message: responseMessage
      });
      alert("Response sent successfully!");
      setShowResponseModal(false);
      setResponseMessage("");
      fetchFeedback();
    } catch (error) {
      console.error("Error sending response:", error);
      alert("Failed to send response");
    }
  };

  const getRatingColor = (stars) => {
    if (stars >= 4) return "text-green-600";
    if (stars >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Customer Feedback ⭐</h1>
          <p className="text-gray-600">Monitor and respond to customer reviews</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={viewedFilter}
                onChange={(e) => setViewedFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="All">All</option>
                <option value="Viewed">Viewed</option>
                <option value="Unviewed">Unviewed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
        >
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="bg-white rounded-xl shadow-lg p-4">
              <div className="text-2xl mb-1">{"⭐".repeat(stars)}</div>
              <p className="text-2xl font-bold text-gray-800">
                {feedback.filter(f => f.rating?.stars === stars).length}
              </p>
              <p className="text-xs text-gray-600">{stars} Star{stars > 1 ? 's' : ''}</p>
            </div>
          ))}
        </motion.div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No feedback found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </motion.div>
          ) : (
            filteredFeedback.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition ${
                  !item.adminViewed ? "border-l-4 border-yellow-500" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {item.customer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{item.customer?.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className={`text-3xl mb-1 ${getRatingColor(item.rating?.stars)}`}>
                        {"⭐".repeat(item.rating?.stars || 0)}
                      </div>
                      <p className="text-gray-800 mb-2">{item.feedback}</p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-600 mb-1">Driver: <span className="font-semibold text-gray-800">{item.driver?.name}</span></p>
                      <p className="text-sm text-gray-600">Delivery: <span className="font-semibold text-gray-800">{item.delivery?.deliveryId}</span></p>
                    </div>

                    {item.rating?.categories && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <div className="bg-blue-50 rounded-lg p-2">
                          <p className="text-xs text-gray-600">Punctuality</p>
                          <p className="font-bold text-blue-700">{item.rating.categories.punctuality}/5</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                          <p className="text-xs text-gray-600">Professional</p>
                          <p className="font-bold text-green-700">{item.rating.categories.professionalism}/5</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2">
                          <p className="text-xs text-gray-600">Vehicle</p>
                          <p className="font-bold text-purple-700">{item.rating.categories.vehicleCondition}/5</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-2">
                          <p className="text-xs text-gray-600">Communication</p>
                          <p className="font-bold text-orange-700">{item.rating.categories.communication}/5</p>
                        </div>
                      </div>
                    )}

                    {item.adminResponse && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Admin Response:</p>
                        <p className="text-sm text-blue-800">{item.adminResponse.message}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {new Date(item.adminResponse.respondedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:ml-6">
                    {!item.adminViewed && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold text-center">
                        New
                      </span>
                    )}
                    {!item.adminResponse && (
                      <button
                        onClick={() => openResponseModal(item)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold whitespace-nowrap"
                      >
                        Respond
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Respond to Feedback</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedFeedback?.customer?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{selectedFeedback?.customer?.name}</h3>
                  <div className="text-yellow-500">
                    {"⭐".repeat(selectedFeedback?.rating?.stars || 0)}
                  </div>
                </div>
              </div>
              <p className="text-gray-800">{selectedFeedback?.feedback}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Write your response to the customer..."
                rows="6"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseMessage("");
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitResponse}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Send Response
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
