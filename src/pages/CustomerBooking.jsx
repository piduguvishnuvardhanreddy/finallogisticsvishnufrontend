import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useDeliveries } from "../context/DeliveriesContext";
import MapLocationPicker from "../components/MapLocationPicker";

const CustomerBooking = () => {
  const navigate = useNavigate();
  const { createBooking } = useDeliveries();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [pickupLocation, setPickupLocation] = useState({ address: "", lat: null, lng: null });
  const [dropLocation, setDropLocation] = useState({ address: "", lat: null, lng: null });
  
  const [form, setForm] = useState({
    packageWeight: "",
    packageDimensions: "",
    packageDescription: "",
    packageType: "Standard",
    preferredDate: "",
    preferredTime: "",
    contactNumber: "",
    specialInstructions: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    return R * c;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate locations
    if (!pickupLocation.lat || !pickupLocation.lng) {
      alert("Please select a pickup location on the map");
      return;
    }
    if (!dropLocation.lat || !dropLocation.lng) {
      alert("Please select a drop location on the map");
      return;
    }
    
    setLoading(true);

    try {
      const estimatedDistance = calculateDistance();
      
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
          dimensions: form.packageDimensions,
          description: form.packageDescription,
          packageType: form.packageType,
        },
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        contactNumber: form.contactNumber,
        specialInstructions: form.specialInstructions,
        estimatedDistance: estimatedDistance,
      };

      const result = await createBooking(bookingData);
      
      if (result.success) {
        console.log("Booking created successfully:", result.data);
        setSuccess(true);
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          console.log("Redirecting to customer dashboard");
          navigate("/customer/dashboard", { replace: true, state: { refresh: true } });
        }, 2000);
      } else {
        alert(result.error || "Failed to create booking");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <span className="text-4xl text-green-600">✓</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 Booking Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your delivery booking has been created successfully. An admin will review and assign a driver soon.
            </p>
            <motion.button
              onClick={() => navigate("/customer/dashboard", { replace: true, state: { refresh: true } })}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Dashboard
            </motion.button>
            <p className="text-sm text-gray-500 mt-3">Auto-redirecting in 2 seconds...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="w-full px-6 py-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📦 Book a Delivery
          </h1>
          <p className="text-gray-600">Fill in the details to schedule your delivery</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

          {/* Package Details Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📦</span> Package Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.select
                name="packageType"
                value={form.packageType}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
                <option value="Fragile">Fragile</option>
                <option value="Heavy">Heavy</option>
                <option value="Perishable">Perishable</option>
              </motion.select>
              <motion.input
                name="packageWeight"
                value={form.packageWeight}
                onChange={handleChange}
                placeholder="Weight (kg) *"
                type="number"
                step="0.1"
                required
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.input
                name="packageDimensions"
                value={form.packageDimensions}
                onChange={handleChange}
                placeholder="Dimensions (L x W x H cm)"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.input
                name="packageDescription"
                value={form.packageDescription}
                onChange={handleChange}
                placeholder="Package Description"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📅</span> Preferred Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.input
                name="preferredDate"
                value={form.preferredDate}
                onChange={handleChange}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.input
                name="preferredTime"
                value={form.preferredTime}
                onChange={handleChange}
                type="time"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>

          {/* Contact & Instructions Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📞</span> Contact & Instructions
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <motion.input
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="Contact Number *"
                type="tel"
                required
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.textarea
                name="specialInstructions"
                value={form.specialInstructions}
                onChange={handleChange}
                placeholder="Special Instructions (optional)"
                rows="4"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Processing...
              </span>
            ) : (
              "✨ Book Delivery"
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default CustomerBooking;
