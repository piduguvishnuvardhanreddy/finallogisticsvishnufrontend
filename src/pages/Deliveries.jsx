import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useDrivers } from "../context/DriversContext";
import { useVehicles } from "../context/VehiclesContext";
import { useDeliveries } from "../context/DeliveriesContext";

const Deliveries = () => {
  const { deliveries, loading, updateDeliveryStatus, deleteDelivery, refreshDeliveries } = useDeliveries();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    refreshDeliveries();
  }, []);

  const handleDeleteDelivery = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    const result = await deleteDelivery(id);
    if (result.success) {
      alert("✅ Delivery deleted successfully");
    } else {
      alert(result.error || "Failed to delete delivery");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const result = await updateDeliveryStatus(id, status);
    if (!result.success) {
      alert(result.error || "Failed to update status");
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
        📦 Delivery Management
      </motion.h2>

      {/* Info Banner */}
      <motion.div
        className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-blue-900">Delivery Workflow</h3>
            <p className="text-sm text-blue-800">
              Customers create bookings → Admin approves → Admin assigns driver & vehicle → Driver accepts & delivers
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        className="flex gap-2 mb-4 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {["All", "Pending", "Approved", "Assigned", "Accepted", "On Route", "Delivered", "Cancelled", "Rejected"].map((status) => (
          <motion.button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === status
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {status}
          </motion.button>
        ))}
      </motion.div>

      {/* Delivery List */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-bold text-xl mb-4 text-gray-800">
          {filterStatus === "All" ? "All Deliveries" : `${filterStatus} Deliveries`} 
          <span className="ml-2 text-sm text-gray-500">
            ({deliveries.filter(d => filterStatus === "All" || d.status === filterStatus).length})
          </span>
        </h3>
        <motion.ul className="space-y-3">
          {deliveries.filter(d => filterStatus === "All" || d.status === filterStatus).map((d, idx) => (
            <motion.li
              key={d._id}
              className="border border-gray-200 p-5 rounded-xl bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.01, x: 4 }}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div className="flex-1">
                  <div className="text-gray-800 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-700">📍 Pickup:</span>
                      <span>{d.pickupLocation?.address || d.pickupAddress || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-red-700">🎯 Drop:</span>
                      <span>{d.dropLocation?.address || d.dropAddress || "N/A"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <motion.span
                      className="inline-block text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium"
                      whileHover={{ scale: 1.05 }}
                    >
                      {d.status}
                    </motion.span>
                    {d.customer && (
                      <motion.span
                        className="inline-block text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium"
                        whileHover={{ scale: 1.05 }}
                      >
                        👤 {d.customer.name}
                      </motion.span>
                    )}
                    {d.assignedDriver && (
                      <motion.span
                        className="inline-block text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium"
                        whileHover={{ scale: 1.05 }}
                      >
                        🚗 Driver: {d.assignedDriver.name}
                      </motion.span>
                    )}
                    {d.assignedVehicle && (
                      <motion.span
                        className="inline-block text-sm px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium"
                        whileHover={{ scale: 1.05 }}
                      >
                        🚚 {d.assignedVehicle.name}
                      </motion.span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* Status buttons for driver/admin */}
                  {["Pending", "On Route", "Delivered"].map(s => (
                    <motion.button
                      key={s}
                      onClick={() => handleUpdateStatus(d._id, s)}
                      className="px-3 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-blue-100 hover:to-purple-100 font-medium transition-all"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
      </div>
    </div>
  );
};

export default Deliveries;
