import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../services/api";

const AdminVehiclesNew = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "",
    plateNumber: "",
    capacity: "",
    fuelType: "Diesel",
    status: "Available"
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/vehicles");
      setVehicles(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "",
      plateNumber: "",
      capacity: "",
      fuelType: "Diesel",
      status: "Available"
    });
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.type || !form.plateNumber) {
      alert("Please fill in all required fields (Name, Type, Plate Number)");
      return;
    }

    try {
      await api.post("/vehicles", {
        name: form.name,
        type: form.type,
        plateNumber: form.plateNumber.toUpperCase(),
        capacity: parseFloat(form.capacity) || 0,
        fuelType: form.fuelType || "Diesel",
        status: form.status
      });

      alert("✅ Vehicle added successfully!");
      setShowAddModal(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert(error.response?.data?.message || "Failed to add vehicle");
    }
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.type || !form.plateNumber) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await api.put(`/vehicles/${selectedVehicle._id}`, {
        name: form.name,
        type: form.type,
        plateNumber: form.plateNumber.toUpperCase(),
        capacity: parseFloat(form.capacity) || 0,
        fuelType: form.fuelType,
        status: form.status
      });

      alert("✅ Vehicle updated successfully!");
      setShowEditModal(false);
      setSelectedVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert(error.response?.data?.message || "Failed to update vehicle");
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
      alert(error.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setForm({
      name: vehicle.name,
      type: vehicle.type,
      plateNumber: vehicle.plateNumber,
      capacity: vehicle.capacity || "",
      fuelType: vehicle.fuelType || "Diesel",
      status: vehicle.status
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      Available: "bg-green-100 text-green-800 border-green-300",
      "On Route": "bg-blue-100 text-blue-800 border-blue-300",
      Assigned: "bg-purple-100 text-purple-800 border-purple-300",
      Maintenance: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Out of Service": "bg-red-100 text-red-800 border-red-300"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🚗 Vehicle Management</h1>
          <p className="text-gray-600">Manage your fleet of delivery vehicles</p>
        </motion.div>

        {/* Stats and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="text-3xl font-bold text-green-600">{vehicles.length}</div>
            <div className="text-gray-600 font-medium">Total Vehicles</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="text-3xl font-bold text-blue-600">
              {vehicles.filter(v => v.status === "Available").length}
            </div>
            <div className="text-gray-600 font-medium">Available</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="text-3xl font-bold text-purple-600">
              {vehicles.filter(v => v.status === "On Route" || v.status === "Assigned").length}
            </div>
            <div className="text-gray-600 font-medium">In Use</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <div className="text-3xl font-bold text-yellow-600">
              {vehicles.filter(v => v.status === "Maintenance").length}
            </div>
            <div className="text-gray-600 font-medium">Maintenance</div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
          >
            ➕ Add New Vehicle
          </button>
          <button
            onClick={fetchVehicles}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">🚚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Vehicles Added</h3>
            <p className="text-gray-600 mb-6">Start by adding your first vehicle</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              ➕ Add Vehicle
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl">
                    🚚
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{vehicle.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{vehicle.type}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plate Number:</span>
                    <span className="font-semibold text-gray-800">{vehicle.plateNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-semibold text-gray-800">{vehicle.capacity || "N/A"} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fuel Type:</span>
                    <span className="font-semibold text-gray-800">{vehicle.fuelType || "N/A"}</span>
                  </div>
                  {vehicle.currentLocation && (
                    <div className="bg-blue-50 p-2 rounded mt-2">
                      <p className="text-xs text-blue-700 font-semibold">📍 Current Location</p>
                      <p className="text-xs text-gray-600 font-mono">
                        {vehicle.currentLocation.lat?.toFixed(6)}, {vehicle.currentLocation.lng?.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(vehicle)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle._id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
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
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
                    >
                      <option value="">Select Type</option>
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="Mini Truck">Mini Truck</option>
                      <option value="Pickup">Pickup</option>
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
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="CNG">CNG</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    ✅ Add Vehicle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Vehicle Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Vehicle</h2>
              
              <form onSubmit={handleEditVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Delivery Van 1"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="Mini Truck">Mini Truck</option>
                      <option value="Pickup">Pickup</option>
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                      required
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type
                    </label>
                    <select
                      value={form.fuelType}
                      onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="CNG">CNG</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="On Route">On Route</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedVehicle(null);
                      resetForm();
                    }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    ✅ Update Vehicle
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

export default AdminVehiclesNew;
