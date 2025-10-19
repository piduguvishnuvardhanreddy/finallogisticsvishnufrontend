import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const AdminDriverDetail = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverDetails();
    fetchDriverDeliveries();
  }, [driverId]);

  const fetchDriverDetails = async () => {
    try {
      const response = await api.get(`/users/drivers/${driverId}`);
      setDriver(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching driver details:", error);
      setLoading(false);
    }
  };

  const fetchDriverDeliveries = async () => {
    try {
      const response = await api.get(`/deliveries?driverId=${driverId}`);
      setDeliveries(response.data);
    } catch (error) {
      console.error("Error fetching driver deliveries:", error);
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

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Driver Not Found</h2>
            <button
              onClick={() => navigate("/admin/drivers")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Drivers
            </button>
          </div>
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
          className="mb-6"
        >
          <button
            onClick={() => navigate("/admin/drivers")}
            className="mb-4 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-semibold shadow"
          >
            ← Back to Drivers
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Driver Details 👤</h1>
          <p className="text-gray-600">Comprehensive driver information and performance</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Driver Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                {driver.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{driver.name}</h2>
              <p className="text-gray-600">{driver.email}</p>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mt-3 ${
                driver.driverProfile?.status === "Active" ? "bg-green-100 text-green-800" :
                driver.driverProfile?.status === "On Leave" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {driver.driverProfile?.status || "N/A"}
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-800">{driver.phone || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">License Number</p>
                <p className="font-semibold text-gray-800">{driver.driverProfile?.licenseNumber || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Vehicle Type</p>
                <p className="font-semibold text-gray-800">{driver.driverProfile?.vehicleType || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Joined Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(driver.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Performance & Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Performance Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Performance Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {driver.driverProfile?.performance?.completedTrips || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Completed Trips</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {driver.driverProfile?.performance?.averageRating?.toFixed(1) || "0.0"} ⭐
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    ₹{driver.driverProfile?.wallet?.balance?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Wallet Balance</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    ₹{driver.driverProfile?.wallet?.totalEarnings?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
                </div>
              </div>
            </div>

            {/* Recent Deliveries */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🚚 Recent Deliveries</h3>
              {deliveries.length > 0 ? (
                <div className="space-y-3">
                  {deliveries.slice(0, 5).map((delivery) => (
                    <div key={delivery._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          delivery.status === "Delivered" ? "bg-green-100 text-green-800" :
                          delivery.status === "On Route" ? "bg-orange-100 text-orange-800" :
                          delivery.status === "Assigned" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {delivery.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(delivery.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>From:</strong> {delivery.pickupLocation?.address?.substring(0, 50)}...
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>To:</strong> {delivery.dropLocation?.address?.substring(0, 50)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No deliveries found</p>
              )}
            </div>

            {/* Recent Ratings */}
            {driver.driverProfile?.ratings && driver.driverProfile.ratings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">⭐ Recent Ratings</h3>
                <div className="space-y-3">
                  {driver.driverProfile.ratings.slice(0, 5).map((rating, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < rating.stars ? "text-yellow-500" : "text-gray-300"}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.feedback && (
                        <p className="text-sm text-gray-700 italic">"{rating.feedback}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDriverDetail;
