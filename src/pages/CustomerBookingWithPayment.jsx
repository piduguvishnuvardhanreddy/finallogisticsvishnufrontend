import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MapLocationPicker from "../components/MapLocationPicker";
import api from "../services/api";

const CustomerBookingWithPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Booking Form, 2: Payment
  const [deliveryId, setDeliveryId] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Map location states
  const [pickupLocation, setPickupLocation] = useState({ address: "", lat: null, lng: null });
  const [dropLocation, setDropLocation] = useState({ address: "", lat: null, lng: null });
  
  const [form, setForm] = useState({
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

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  // Auto-calculate distance when locations change
  useEffect(() => {
    if (pickupLocation.lat && dropLocation.lat) {
      const distance = calculateDistance();
      setForm(prev => ({ ...prev, estimatedDistance: distance }));
    }
  }, [pickupLocation, dropLocation]);

  useEffect(() => {
    calculatePrice();
  }, [form.packageWeight, form.cluster, form.estimatedDistance]);

  const calculateDistance = () => {
    if (!pickupLocation.lat || !dropLocation.lat) return 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = (dropLocation.lat - pickupLocation.lat) * Math.PI / 180;
    const dLon = (dropLocation.lng - pickupLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickupLocation.lat * Math.PI / 180) * Math.cos(dropLocation.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(2));
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await api.get("/wallet/customer/balance");
      setWalletBalance(response.data.balance || 0);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const calculatePrice = () => {
    const weight = parseFloat(form.packageWeight) || 0;
    const distance = parseFloat(form.estimatedDistance) || 0;
    const cluster = form.cluster || "Small";
    
    let basePrice = 50;
    let weightCharge = weight * 10;
    let distanceCharge = distance * 8;
    
    const clusterPrices = {
      "Small": 0,
      "Medium": 50,
      "Large": 100,
      "Extra Large": 200
    };
    let clusterCharge = clusterPrices[cluster] || 0;
    
    let total = basePrice + weightCharge + distanceCharge + clusterCharge;
    setEstimatedPrice(total);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!pickupLocation.lat || !pickupLocation.lng) {
      alert("Please select pickup location on the map");
      return;
    }

    if (!dropLocation.lat || !dropLocation.lng) {
      alert("Please select drop location on the map");
      return;
    }

    if (!form.packageWeight || parseFloat(form.packageWeight) <= 0) {
      alert("Please enter valid package weight");
      return;
    }

    if (!form.estimatedDistance || parseFloat(form.estimatedDistance) <= 0) {
      alert("Please enter valid estimated distance");
      return;
    }

    if (!form.contactNumber) {
      alert("Please enter contact number");
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        pickupLocation: {
          address: pickupLocation.address,
          lat: pickupLocation.lat,
          lng: pickupLocation.lng,
        },
        dropLocation: {
          address: dropLocation.address,
          lat: dropLocation.lat,
          lng: dropLocation.lng,
        },
        packageDetails: {
          weight: parseFloat(form.packageWeight),
          dimensions: form.packageDimensions || "",
          description: form.packageDescription || "",
          packageType: form.packageType,
          cluster: form.cluster,
        },
        preferredDate: form.preferredDate || "",
        preferredTime: form.preferredTime || "",
        contactNumber: form.contactNumber,
        specialInstructions: form.specialInstructions || "",
        estimatedDistance: parseFloat(form.estimatedDistance),
      };

      console.log("Submitting booking:", bookingData);

      const response = await api.post("/deliveries/customer/book", bookingData);
      
      console.log("Booking response:", response.data);

      if (response.data.success) {
        setDeliveryId(response.data.delivery._id);
        setEstimatedPrice(response.data.delivery.pricing.totalPrice);
        setStep(2); // Move to payment step
      } else {
        alert(response.data.message || "Failed to create booking");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert(err.response?.data?.message || "Failed to create booking. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentWithWallet = async () => {
    if (walletBalance < estimatedPrice) {
      alert(`Insufficient wallet balance! You need ₹${(estimatedPrice - walletBalance).toFixed(2)} more.`);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/wallet/customer/pay-delivery", {
        deliveryId: deliveryId
      });

      if (response.data.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          navigate("/customer/deliveries");
        }, 3000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess) {
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
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful!</h2>
            <p className="text-gray-600 mb-2">Your delivery has been booked and paid.</p>
            <p className="text-sm text-gray-500">Redirecting to your deliveries...</p>
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📦 Book a Delivery</h1>
          <p className="text-gray-600">Fill in the details and complete payment</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-semibold">Booking Details</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-semibold">Payment</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <motion.form
            onSubmit={handleBookingSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Map Location Picker */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🗺️</span> Select Pickup & Drop Locations on Map
              </h3>
              <MapLocationPicker
                pickupLocation={pickupLocation}
                setPickupLocation={setPickupLocation}
                dropLocation={dropLocation}
                setDropLocation={setDropLocation}
                showRoute={true}
              />
            </div>

            {/* Package Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📦 Package Details</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="packageWeight"
                  value={form.packageWeight}
                  onChange={handleChange}
                  placeholder="e.g., 5.5"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cluster *</label>
                <select
                  name="cluster"
                  value={form.cluster}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Extra Large">Extra Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Distance (km) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="estimatedDistance"
                  value={form.estimatedDistance}
                  readOnly
                  placeholder="Auto-calculated from map"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">📏 Automatically calculated from map locations</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g., +91 9876543210"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Estimated Price */}
              <div className="lg:col-span-2 mt-6">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-xl border-2 border-blue-300">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">💰 Estimated Price</h3>
                  <p className="text-4xl font-bold text-blue-600">₹{estimatedPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-2">Final price may vary based on actual distance</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Continue to Payment →"}
            </button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">💳 Complete Payment</h2>

            {/* Price Summary */}
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-2xl text-blue-600">₹{estimatedPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl mb-6 border-2 border-purple-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-semibold">Your Wallet Balance</p>
                  <p className="text-3xl font-bold text-purple-900">₹{walletBalance.toFixed(2)}</p>
                </div>
                <div className="text-5xl">💰</div>
              </div>
              
              {walletBalance < estimatedPrice && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="text-red-700 font-semibold">⚠️ Insufficient Balance</p>
                  <p className="text-sm text-red-600 mt-1">
                    You need ₹{(estimatedPrice - walletBalance).toFixed(2)} more to complete this payment.
                  </p>
                  <button
                    onClick={() => navigate("/customer/wallet")}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    Add Money to Wallet
                  </button>
                </div>
              )}
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePaymentWithWallet}
              disabled={loading || walletBalance < estimatedPrice}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing Payment..." : `Pay ₹${estimatedPrice.toFixed(2)} with Wallet`}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              ← Back to Booking Details
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CustomerBookingWithPayment;
