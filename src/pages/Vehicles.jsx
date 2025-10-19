import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useVehicles } from "../context/VehiclesContext";

const Vehicles = () => {
  const { vehicles, loading, addVehicle, deleteVehicle, refreshVehicles } = useVehicles();
  const [form, setForm] = useState({
    name: "",
    type: "",
    plateNumber: "",
    capacity: 0,
    status: "Available"
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addVehicle(form);
    if (result.success) {
      setForm({ name: "", type: "", plateNumber: "", capacity: 0, status: "Available" });
      alert("✅ Vehicle added successfully!");
    } else {
      alert(result.error || "Failed to add vehicle");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    const result = await deleteVehicle(id);
    if (result.success) {
      alert("✅ Vehicle deleted successfully!");
    } else {
      alert(result.error || "Failed to delete vehicle");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      <div className="w-full px-6 py-6">
      <motion.h2
        className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🚚 Vehicles Management
      </motion.h2>

      {/* Vehicle Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Vehicle Name"
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
          whileFocus={{ scale: 1.02 }}
        />
        <motion.input
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Type (Truck/Van)"
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
          whileFocus={{ scale: 1.02 }}
        />
        <motion.input
          name="plateNumber"
          value={form.plateNumber}
          onChange={handleChange}
          placeholder="Plate Number"
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
          whileFocus={{ scale: 1.02 }}
        />
        <motion.input
          name="capacity"
          type="number"
          value={form.capacity}
          onChange={handleChange}
          placeholder="Capacity"
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          whileFocus={{ scale: 1.02 }}
        />
        <motion.button
          type="submit"
          className="md:col-span-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          ✨ Add Vehicle
        </motion.button>
      </motion.form>

      {/* Vehicle List */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-gray-800">
            Existing Vehicles ({vehicles.length})
          </h3>
          <motion.button
            onClick={refreshVehicles}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Refresh
          </motion.button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🚚</div>
            <p>No vehicles added yet</p>
          </div>
        ) : (
          <motion.ul className="space-y-3">
            {vehicles.map((v, idx) => (
              <motion.li
                key={v._id}
                className="flex justify-between items-center border border-gray-200 p-4 rounded-xl bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ scale: 1.01, x: 4 }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800 text-lg">{v.name}</span>
                    <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{v.type}</span>
                    <span className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{v.plateNumber}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Capacity: {v.capacity} kg
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.span
                    className={`text-sm px-3 py-1 rounded-full font-medium ${
                      v.status === "Available" 
                        ? "bg-green-100 text-green-700" 
                        : v.status === "On Route"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {v.status}
                  </motion.span>
                  <motion.button
                    onClick={() => handleDelete(v._id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🗑️
                  </motion.button>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>
      </div>
    </div>
  );
};

export default Vehicles;
