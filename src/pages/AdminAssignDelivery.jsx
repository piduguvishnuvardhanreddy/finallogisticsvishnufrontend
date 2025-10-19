import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useDrivers } from "../context/DriversContext";
import { useVehicles } from "../context/VehiclesContext";
import { useDeliveries } from "../context/DeliveriesContext";

const AdminAssignDelivery = () => {
  const { deliveries, loading, assignDelivery, refreshDeliveries } = useDeliveries();
  const { drivers, loading: driversLoading } = useDrivers();
  const { vehicles } = useVehicles();
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [assignForm, setAssignForm] = useState({
    driverId: "",
    vehicleId: "",
    estimatedDistance: "",
    estimatedDuration: "",
  });

  useEffect(() => {
    refreshDeliveries();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (deliveryId) => {
    if (!assignForm.driverId || !assignForm.vehicleId) {
      alert("Please select both driver and vehicle");
      return;
    }

    const result = await assignDelivery(deliveryId, {
      driverId: assignForm.driverId,
      vehicleId: assignForm.vehicleId,
      estimatedDistance: parseFloat(assignForm.estimatedDistance) || 0,
      estimatedDuration: parseInt(assignForm.estimatedDuration) || 0,
    });
    
    if (result.success) {
      alert("✅ Delivery assigned successfully!");
      setSelectedDelivery(null);
      setAssignForm({
        driverId: "",
        vehicleId: "",
        estimatedDistance: "",
        estimatedDuration: "",
      });
    } else {
      alert(result.error || "Failed to assign delivery");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Approved: "bg-green-100 text-green-700 border-green-300",
      Assigned: "bg-blue-100 text-blue-700 border-blue-300",
      Rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const availableDrivers = drivers.filter(d => d.role === "Driver");
  const availableVehicles = vehicles.filter(v => v.status === "Available");
  const approvedDeliveries = deliveries.filter(d => 
    d.status === "Approved" || d.status === "Assigned" || d.status === "Rejected"
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="w-full px-6 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🚚 Assign Deliveries
          </h1>
          <p className="text-gray-600">Assign approved deliveries to available drivers and vehicles</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-green-600">{approvedDeliveries.length}</div>
            <div className="text-gray-600 font-medium text-sm">Ready to Assign</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">{availableDrivers.length}</div>
            <div className="text-gray-600 font-medium text-sm">Available Drivers</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">{availableVehicles.length}</div>
            <div className="text-gray-600 font-medium text-sm">Available Vehicles</div>
          </div>
        </motion.div>

        {/* Refresh Button */}
        <div className="flex gap-3 mb-4">
          <motion.button
            onClick={refreshDeliveries}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Refresh Data
          </motion.button>
          {driversLoading && (
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
              Loading drivers...
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : approvedDeliveries.length === 0 ? (
          <motion.div
            className="bg-white p-12 rounded-2xl shadow-lg border border-gray-100 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Deliveries to Assign</h3>
            <p className="text-gray-600">All approved deliveries have been assigned</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {approvedDeliveries.map((delivery, idx) => (
              <motion.div
                key={delivery._id}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Delivery Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <div className="text-xs text-green-700 font-semibold mb-1">📍 PICKUP</div>
                        <div className="text-gray-900 font-semibold">
                          {delivery.pickupLocation?.address || "N/A"}
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <div className="text-xs text-red-700 font-semibold mb-1">🎯 DROP-OFF</div>
                        <div className="text-gray-900 font-semibold">
                          {delivery.dropLocation?.address || "N/A"}
                        </div>
                      </div>
                    </div>

                    {delivery.customer && (
                      <div className="p-3 bg-purple-50 rounded-lg mb-3">
                        <div className="text-xs text-purple-700 font-semibold">👤 Customer</div>
                        <div className="text-gray-900 font-semibold">{delivery.customer.name}</div>
                        <div className="text-sm text-gray-600">{delivery.customer.email}</div>
                      </div>
                    )}

                    {delivery.packageDetails && (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-xs text-orange-700 font-semibold">📦 Package</div>
                        <div className="text-gray-900 font-semibold">
                          {delivery.packageDetails.packageType} - {delivery.packageDetails.weight}kg
                        </div>
                      </div>
                    )}

                    {delivery.status === "Rejected" && delivery.driverRejectedReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <div className="text-xs text-red-700 font-semibold">❌ Rejection Reason</div>
                        <div className="text-gray-900">{delivery.driverRejectedReason}</div>
                      </div>
                    )}
                  </div>

                  {/* Assignment Form */}
                  {selectedDelivery === delivery._id ? (
                    <div className="lg:w-96 bg-blue-50 p-6 rounded-xl border-2 border-blue-300">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Assign Resources</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            👤 Select Driver *
                          </label>
                          <select
                            value={assignForm.driverId}
                            onChange={(e) => setAssignForm({ ...assignForm, driverId: e.target.value })}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Choose Driver</option>
                            {availableDrivers.map((driver) => (
                              <option key={driver._id} value={driver._id}>
                                {driver.name} ({driver.email})
                              </option>
                            ))}
                          </select>
                          {availableDrivers.length === 0 && (
                            <p className="text-xs text-red-600 mt-1">No drivers available</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            🚚 Select Vehicle *
                          </label>
                          <select
                            value={assignForm.vehicleId}
                            onChange={(e) => setAssignForm({ ...assignForm, vehicleId: e.target.value })}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Choose Vehicle</option>
                            {availableVehicles.map((vehicle) => (
                              <option key={vehicle._id} value={vehicle._id}>
                                {vehicle.name} - {vehicle.plateNumber} ({vehicle.type})
                              </option>
                            ))}
                          </select>
                          {availableVehicles.length === 0 && (
                            <p className="text-xs text-red-600 mt-1">No vehicles available</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📏 Estimated Distance (km)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={assignForm.estimatedDistance}
                            onChange={(e) => setAssignForm({ ...assignForm, estimatedDistance: e.target.value })}
                            placeholder="e.g., 15.5"
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ⏱️ Estimated Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={assignForm.estimatedDuration}
                            onChange={(e) => setAssignForm({ ...assignForm, estimatedDuration: e.target.value })}
                            placeholder="e.g., 30"
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleAssign(delivery._id)}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            ✅ Assign
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              setSelectedDelivery(null);
                              setAssignForm({
                                driverId: "",
                                vehicleId: "",
                                estimatedDistance: "",
                                estimatedDuration: "",
                              });
                            }}
                            className="px-4 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <motion.button
                        onClick={() => setSelectedDelivery(delivery._id)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {delivery.status === "Assigned" ? "🔄 Reassign Driver & Vehicle" : "🚚 Assign Driver & Vehicle"}
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssignDelivery;
