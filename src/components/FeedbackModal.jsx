import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const FeedbackModal = ({ isOpen, onClose, delivery, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState({
    punctuality: 0,
    professionalism: 0,
    vehicleCondition: 0,
    communication: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const availableTags = [
    "Excellent Service",
    "On Time",
    "Professional",
    "Friendly",
    "Careful Handling",
    "Needs Improvement",
    "Late",
    "Rude",
    "Damaged Package"
  ];

  const categoryLabels = {
    punctuality: "⏰ Punctuality",
    professionalism: "👔 Professionalism",
    vehicleCondition: "🚗 Vehicle Condition",
    communication: "💬 Communication"
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleCategoryRating = (category, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a star rating");
      return;
    }

    if (!feedback.trim()) {
      alert("Please provide your feedback");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/feedback/submit", {
        deliveryId: delivery._id,
        rating,
        feedback: feedback.trim(),
        tags: selectedTags,
        categories
      });

      if (response.data.success) {
        alert("✅ Thank you for your feedback!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(error.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating, onRate, onHover, size = "text-4xl") => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover && onHover(star)}
            onMouseLeave={() => onHover && onHover(0)}
            className={`${size} transition-all transform hover:scale-110 ${
              star <= (onHover ? hoveredRating : currentRating)
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">⭐ Rate Your Delivery</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Delivery ID: {delivery?.deliveryId?.substring(0, 12)}...
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                ✕
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Overall Rating */}
            <div className="text-center">
              <label className="block text-lg font-bold text-gray-800 mb-3">
                How was your overall experience?
              </label>
              <div className="flex justify-center">
                {renderStars(rating, setRating, setHoveredRating)}
              </div>
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-gray-600 font-semibold"
                >
                  {rating === 5 && "🎉 Excellent!"}
                  {rating === 4 && "😊 Very Good!"}
                  {rating === 3 && "🙂 Good"}
                  {rating === 2 && "😐 Fair"}
                  {rating === 1 && "😞 Poor"}
                </motion.p>
              )}
            </div>

            {/* Category Ratings */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-4">Rate Specific Aspects:</h3>
              <div className="space-y-4">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="flex gap-1">
                      {renderStars(
                        categories[key],
                        (value) => handleCategoryRating(key, value),
                        null,
                        "text-2xl"
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Share Your Experience *
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your delivery experience..."
                rows="4"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.length}/500 characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Add Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Driver Info */}
            {delivery?.assignedDriver && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Driver</p>
                <p className="font-bold text-gray-800">{delivery.assignedDriver.name}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "✅ Submit Feedback"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeedbackModal;
