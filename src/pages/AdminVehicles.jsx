import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../services/api";

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "",
    plateNumber: "",
    model: "",
    year: new Date().getFullYear(),
    capacity: "",
    fuelType: "Diesel",
    status: "Available"
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      console.log("Fetching vehicles...");
      setLoading(true);
      const response = await api.get("/vehicles");
      console.log("Vehicles fetched:", response.data);
      setVehicles(response.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      console.error("Error response:", error.response?.data);
      alert("Failed to fetch vehicles: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "",
      plateNumber: "",
      model: "",
      year: new Date().getFullYear(),
      capacity: "",
      fuelType: "Diesel",
      status: "Available"
    });
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    
    console.log("=== SUBMITTING VEHICLE ===");
    console.log("Form data:", form);

    // Validation
    if (!form.name || !form.name.trim()) {
      alert("❌ Please enter vehicle name");
      return;
    }

    if (!form.type || !form.type.trim()) {
      alert("❌ Please select vehicle type");
      return;
    }

    if (!form.plateNumber || !form.plateNumber.trim()) {
      alert("❌ Please enter plate number");
      return;
    }

    setSubmitting(true);

    try {
      const vehicleData = {
        name: form.name.trim(),
        type: form.type.trim(),
        plateNumber: form.plateNumber.trim().toUpperCase(),
        model: form.model ? form.model.trim() : form.name.trim(), // Use name as model if not provided
        year: form.year ? parseInt(form.year) : new Date().getFullYear(),
        capacity: form.capacity ? parseFloat(form.capacity) : 0,
        fuelType: form.fuelType || "Diesel",
        status: form.status || "Available"
      };

      console.log("Sending to API:", vehicleData);

      const response = await api.post("/vehicles", vehicleData);

      console.log("API Response:", response.data);

      if (response.data.success) {
        alert("✅ Vehicle added successfully!");
        setShowAddModal(false);
        resetForm();
        fetchVehicles();
      } else {
        alert("❌ " + (response.data.message || "Failed to add vehicle"));
      }
    } catch (error) {
      console.error("=== ADD VEHICLE ERROR ===");
      console.error("Error:", error);
      console.error("Response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to add vehicle";
      alert("❌ " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await api.delete(`/vehicles/${vehicleId}`);
      alert("✅ Vehicle deleted successfully!");
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("❌ " + (error.response?.data?.message || "Failed to delete vehicle"));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Available: "bg-green-100 text-green-800",
      "On Route": "bg-blue-100 text-blue-800",
      Assigned: "bg-purple-100 text-purple-800",
      Maintenance: "bg-yellow-100 text-yellow-800",
      "Out of Service": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🚗 Vehicle Management</h1>
            <p className="text-gray-600">Manage your fleet of vehicles</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ➕ Add New Vehicle
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-green-600">{vehicles.length}</div>
            <div className="text-gray-600">Total Vehicles</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600">
              {vehicles.filter(v => v.status === "Available").length}
            </div>
            <div className="text-gray-600">Available</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-purple-600">
              {vehicles.filter(v => v.status === "On Route").length}
            </div>
            <div className="text-gray-600">On Route</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {vehicles.filter(v => v.status === "Maintenance").length}
            </div>
            <div className="text-gray-600">Maintenance</div>
          </div>
        </div>

        {/* Vehicles List */}
        {vehicles.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-lg text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Vehicles Yet</h3>
            <p className="text-gray-600 mb-6">Add your first vehicle to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, idx) => (
              <motion.div
                key={vehicle._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{vehicle.name}</h3>
                    <p className="text-gray-600">{vehicle.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <span className="font-semibold w-32">Plate Number:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{vehicle.plateNumber}</span>
                  </div>
                  {vehicle.model && (
                    <div className="flex items-center text-gray-700">
                      <span className="font-semibold w-32">Model:</span>
                      <span>{vehicle.model}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700">
                    <span className="font-semibold w-32">Capacity:</span>
                    <span>{vehicle.capacity?.weight || vehicle.capacity || 0} kg</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-semibold w-32">Fuel Type:</span>
                    <span>{vehicle.fuelType || "Diesel"}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteVehicle(vehicle._id)}
                  className="w-full py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  🗑️ Delete
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">➕ Add New Vehicle</h2>
              
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Delivery Van 1"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Type</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Car">Car</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plate Number *
                    </label>
                    <input
                      type="text"
                      value={form.plateNumber}
                      onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g., KA01AB1234"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 uppercase"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      placeholder="e.g., Tata Ace, Mahindra Bolero"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year (Optional)
                    </label>
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      placeholder={new Date().getFullYear().toString()}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      placeholder="e.g., 500"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type
                    </label>
                    <select
                      value={form.fuelType}
                      onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={submitting}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? "Adding..." : "✅ Add Vehicle"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminVehicles;
