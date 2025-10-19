import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const CustomerBookingEnhanced = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  
  const [form, setForm] = useState({
    pickupAddress: "",
    pickupLat: "",
    pickupLng: "",
    dropAddress: "",
    dropLat: "",
    dropLng: "",
    packageWeight: "",
    packageDimensions: "",
    packageDescription: "",
    packageType: "Standard",
    cluster: "Small",
    preferredDate: "",
    preferredTime: "",
    contactNumber: "",
    specialInstructions: "",
    estimatedDistance: 0,
  });

  // Calculate price whenever relevant fields change
  useEffect(() => {
    calculatePrice();
  }, [form.packageWeight, form.cluster, form.estimatedDistance]);

  const calculatePrice = () => {
    const weight = parseFloat(form.packageWeight) || 0;
    const distance = parseFloat(form.estimatedDistance) || 0;
    const cluster = form.cluster || "Small";
    
    // Base price
    let basePrice = 50;
    
    // Weight charge (₹10 per kg)
    let weightCharge = weight * 10;
    
    // Distance charge (₹8 per km)
    let distanceCharge = distance * 8;
    
    // Cluster charge
    const clusterPrices = {
      "Small": 0,
      "Medium": 50,
      "Large": 100,
      "Extra Large": 200
    };
    let clusterCharge = clusterPrices[cluster] || 0;
    
    // Total price
    let total = basePrice + weightCharge + distanceCharge + clusterCharge;
    setEstimatedPrice(total);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        pickupLocation: {
          address: form.pickupAddress,
          lat: parseFloat(form.pickupLat) || 0,
          lng: parseFloat(form.pickupLng) || 0,
        },
        dropLocation: {
          address: form.dropAddress,
          lat: parseFloat(form.dropLat) || 0,
          lng: parseFloat(form.dropLng) || 0,
        },
        packageDetails: {
          weight: parseFloat(form.packageWeight),
          dimensions: form.packageDimensions,
          description: form.packageDescription,
          packageType: form.packageType,
          cluster: form.cluster,
        },
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        contactNumber: form.contactNumber,
        specialInstructions: form.specialInstructions,
        estimatedDistance: parseFloat(form.estimatedDistance),
      };

      const response = await api.post("/deliveries/customer/book", bookingData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-2">Your delivery request has been submitted successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Book a Delivery</h1>
          <p className="text-xl text-gray-600">Fast, reliable, and affordable delivery service</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition ${
                  step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-4">
            <span className="text-sm font-medium text-gray-600">Locations</span>
            <span className="text-sm font-medium text-gray-600">Package Details</span>
            <span className="text-sm font-medium text-gray-600">Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-2xl p-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Step 1: Locations */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">📍 Pickup & Drop Locations</h2>
                  
                  <div className="bg-blue-50 p-6 rounded-2xl space-y-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Pickup Location</h3>
                    <input
                      type="text"
                      name="pickupAddress"
                      value={form.pickupAddress}
                      onChange={handleChange}
                      placeholder="Enter pickup address"
                      required
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        name="pickupLat"
                        value={form.pickupLat}
                        onChange={handleChange}
                        placeholder="Latitude"
                        step="any"
                        className="px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        name="pickupLng"
                        value={form.pickupLng}
                        onChange={handleChange}
                        placeholder="Longitude"
                        step="any"
                        className="px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-2xl space-y-4">
                    <h3 className="font-semibold text-green-900 mb-3">Drop Location</h3>
                    <input
                      type="text"
                      name="dropAddress"
                      value={form.dropAddress}
                      onChange={handleChange}
                      placeholder="Enter drop address"
                      required
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        name="dropLat"
                        value={form.dropLat}
                        onChange={handleChange}
                        placeholder="Latitude"
                        step="any"
                        className="px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="number"
                        name="dropLng"
                        value={form.dropLng}
                        onChange={handleChange}
                        placeholder="Longitude"
                        step="any"
                        className="px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Distance (km)</label>
                    <input
                      type="number"
                      name="estimatedDistance"
                      value={form.estimatedDistance}
                      onChange={handleChange}
                      placeholder="Enter estimated distance"
                      step="0.1"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-lg shadow-lg"
                  >
                    Next: Package Details →
                  </button>
                </motion.div>
              )}

              {/* Step 2: Package Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Package Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
                      <input
                        type="number"
                        name="packageWeight"
                        value={form.packageWeight}
                        onChange={handleChange}
                        placeholder="Enter weight"
                        required
                        step="0.1"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                      <input
                        type="text"
                        name="packageDimensions"
                        value={form.packageDimensions}
                        onChange={handleChange}
                        placeholder="L x W x H (cm)"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
                    <select
                      name="packageType"
                      value={form.packageType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Fragile">Fragile</option>
                      <option value="Perishable">Perishable</option>
                      <option value="Documents">Documents</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose Cluster (Size Range) *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["Small", "Medium", "Large", "Extra Large"].map((cluster) => (
                        <button
                          key={cluster}
                          type="button"
                          onClick={() => setForm({ ...form, cluster })}
                          className={`p-4 rounded-xl border-2 font-semibold transition ${
                            form.cluster === cluster
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {cluster}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      name="packageDescription"
                      value={form.packageDescription}
                      onChange={handleChange}
                      placeholder="Describe your package"
                      required
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg"
                    >
                      Next: Confirm →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">✅ Final Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={form.preferredDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                      <input
                        type="time"
                        name="preferredTime"
                        value={form.preferredTime}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={form.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <textarea
                      name="specialInstructions"
                      value={form.specialInstructions}
                      onChange={handleChange}
                      placeholder="Any special instructions for the driver"
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50"
                    >
                      {loading ? "Booking..." : "Confirm Booking"}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.form>
          </div>

          {/* Price Calculator Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white sticky top-8">
              <h3 className="text-2xl font-bold mb-6">💰 Price Estimate</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-purple-100">Base Price</span>
                  <span className="font-semibold">₹50.00</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-purple-100">Weight ({form.packageWeight || 0} kg)</span>
                  <span className="font-semibold">₹{((parseFloat(form.packageWeight) || 0) * 10).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-purple-100">Distance ({form.estimatedDistance || 0} km)</span>
                  <span className="font-semibold">₹{((parseFloat(form.estimatedDistance) || 0) * 8).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-purple-100">Cluster ({form.cluster})</span>
                  <span className="font-semibold">
                    ₹{form.cluster === "Small" ? "0.00" : form.cluster === "Medium" ? "50.00" : form.cluster === "Large" ? "100.00" : "200.00"}
                  </span>
                </div>
              </div>

              <div className="bg-white/20 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Price</span>
                  <span className="text-3xl font-bold">₹{estimatedPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 text-sm">
                <p className="mb-2">✨ <strong>Includes:</strong></p>
                <ul className="space-y-1 text-purple-100">
                  <li>• Real-time tracking</li>
                  <li>• Insurance coverage</li>
                  <li>• Professional handling</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingEnhanced;
