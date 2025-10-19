import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../services/api";

const AdminAssignDeliveryNew = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [assignForm, setAssignForm] = useState({
    driverId: "",
    vehicleId: "",
    estimatedDistance: "",
    estimatedDuration: ""
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, driversRes, vehiclesRes] = await Promise.all([
        api.get("/deliveries"),
        api.get("/users/drivers"),
        api.get("/vehicles")
      ]);

      setDeliveries(deliveriesRes.data);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleApprove = async (deliveryId) => {
    try {
      await api.put(`/deliveries/${deliveryId}/approve`);
      alert("✅ Delivery approved successfully!");
      fetchAllData();
    } catch (error) {
      console.error("Error approving delivery:", error);
      alert(error.response?.data?.message || "Failed to approve delivery");
    }
  };

  const handleAssign = async () => {
    if (!assignForm.driverId || !assignForm.vehicleId) {
      alert("Please select both driver and vehicle");
      return;
    }

    if (!assignForm.estimatedDistance || parseFloat(assignForm.estimatedDistance) <= 0) {
      alert("Please enter a valid estimated distance");
      return;
    }

    try {
      await api.put(`/deliveries/${selectedDelivery._id}/assign`, {
        driverId: assignForm.driverId,
        vehicleId: assignForm.vehicleId,
        estimatedDistance: parseFloat(assignForm.estimatedDistance),
        estimatedDuration: parseInt(assignForm.estimatedDuration) || 30
      });

      alert("✅ Delivery assigned successfully!");
      setSelectedDelivery(null);
      setAssignForm({
        driverId: "",
        vehicleId: "",
        estimatedDistance: "",
        estimatedDuration: ""
      });
      fetchAllData();
    } catch (error) {
      console.error("Error assigning delivery:", error);
      alert(error.response?.data?.message || "Failed to assign delivery");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Approved: "bg-green-100 text-green-800 border-green-300",
      Assigned: "bg-blue-100 text-blue-800 border-blue-300",
      Accepted: "bg-indigo-100 text-indigo-800 border-indigo-300",
      "On Route": "bg-purple-100 text-purple-800 border-purple-300",
      Delivered: "bg-teal-100 text-teal-800 border-teal-300",
      Cancelled: "bg-red-100 text-red-800 border-red-300",
      Rejected: "bg-orange-100 text-orange-800 border-orange-300"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const pendingDeliveries = deliveries.filter(d => d.status === "Pending");
  const approvedDeliveries = deliveries.filter(d => d.status === "Approved" || d.status === "Assigned" || d.status === "Rejected");
  const availableDrivers = drivers.filter(d => d.role === "Driver" && d.isActive);
  const availableVehicles = vehicles.filter(v => v.status === "Available");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🚚 Delivery Management</h1>
          <p className="text-gray-600">Approve and assign deliveries to drivers</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <div className="text-3xl font-bold text-yellow-600">{pendingDeliveries.length}</div>
            <div className="text-gray-600 font-medium">Pending Approval</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="text-3xl font-bold text-green-600">{approvedDeliveries.length}</div>
            <div className="text-gray-600 font-medium">Ready to Assign</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="text-3xl font-bold text-blue-600">{availableDrivers.length}</div>
            <div className="text-gray-600 font-medium">Available Drivers</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="text-3xl font-bold text-purple-600">{availableVehicles.length}</div>
            <div className="text-gray-600 font-medium">Available Vehicles</div>
          </motion.div>
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <button
            onClick={fetchAllData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Pending Approvals Section */}
        {pendingDeliveries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Pending Approvals</h2>
            <div className="space-y-4">
              {pendingDeliveries.map((delivery) => (
                <div key={delivery._id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-lg font-bold text-gray-800">{delivery.deliveryId}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-700 font-semibold mb-1">📍 PICKUP</p>
                          <p className="text-sm font-semibold text-gray-800">{delivery.pickupLocation?.address}</p>
                          {delivery.pickupLocation?.lat && delivery.pickupLocation?.lng && (
                            <p className="text-xs text-gray-600 mt-1">
                              📌 {delivery.pickupLocation.lat.toFixed(6)}, {delivery.pickupLocation.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-xs text-red-700 font-semibold mb-1">🎯 DROP-OFF</p>
                          <p className="text-sm font-semibold text-gray-800">{delivery.dropLocation?.address}</p>
                          {delivery.dropLocation?.lat && delivery.dropLocation?.lng && (
                            <p className="text-xs text-gray-600 mt-1">
                              📌 {delivery.dropLocation.lat.toFixed(6)}, {delivery.dropLocation.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>

                      {delivery.customer && (
                        <div className="bg-purple-50 p-3 rounded-lg mb-3">
                          <p className="text-xs text-purple-700 font-semibold">👤 Customer</p>
                          <p className="text-sm font-semibold text-gray-800">{delivery.customer.name}</p>
                          <p className="text-xs text-gray-600">{delivery.customer.email}</p>
                        </div>
                      )}

                      {delivery.packageDetails && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-orange-700 font-semibold">📦 Package Details</p>
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">Type:</span> {delivery.packageDetails.packageType || "N/A"} | 
                            <span className="font-semibold"> Weight:</span> {delivery.packageDetails.weight}kg | 
                            <span className="font-semibold"> Cluster:</span> {delivery.packageDetails.cluster}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <button
                        onClick={() => handleApprove(delivery._id)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
                      >
                        ✅ Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Assign Deliveries Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🚚 Assign Deliveries</h2>
          
          {approvedDeliveries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Deliveries to Assign</h3>
              <p className="text-gray-600">All approved deliveries have been assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedDeliveries.map((delivery) => (
                <div key={delivery._id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Delivery Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-lg font-bold text-gray-800">{delivery.deliveryId}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(delivery.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                          <p className="text-xs text-green-700 font-semibold mb-1">📍 PICKUP LOCATION</p>
                          <p className="text-sm font-semibold text-gray-800">{delivery.pickupLocation?.address}</p>
                          {delivery.pickupLocation?.lat && delivery.pickupLocation?.lng && (
                            <p className="text-xs text-gray-600 mt-1 font-mono">
                              📌 Lat: {delivery.pickupLocation.lat.toFixed(6)}, Lng: {delivery.pickupLocation.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                          <p className="text-xs text-red-700 font-semibold mb-1">🎯 DROP-OFF LOCATION</p>
                          <p className="text-sm font-semibold text-gray-800">{delivery.dropLocation?.address}</p>
                          {delivery.dropLocation?.lat && delivery.dropLocation?.lng && (
                            <p className="text-xs text-gray-600 mt-1 font-mono">
                              📌 Lat: {delivery.dropLocation.lat.toFixed(6)}, Lng: {delivery.dropLocation.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {delivery.customer && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-xs text-purple-700 font-semibold">👤 Customer</p>
                            <p className="text-sm font-semibold text-gray-800">{delivery.customer.name}</p>
                            <p className="text-xs text-gray-600">{delivery.customer.email}</p>
                          </div>
                        )}

                        {delivery.packageDetails && (
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <p className="text-xs text-orange-700 font-semibold">📦 Package</p>
                            <p className="text-sm text-gray-800">
                              {delivery.packageDetails.packageType} - {delivery.packageDetails.weight}kg
                            </p>
                            <p className="text-xs text-gray-600">Cluster: {delivery.packageDetails.cluster}</p>
                          </div>
                        )}
                      </div>

                      {delivery.pricing && (
                        <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-700 font-semibold">💰 Pricing</p>
                          <p className="text-lg font-bold text-blue-900">₹{delivery.pricing.totalPrice?.toFixed(2)}</p>
                        </div>
                      )}

                      {delivery.assignedDriver && (
                        <div className="mt-3 bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
                          <p className="text-xs text-indigo-700 font-semibold">👨‍✈️ Currently Assigned To</p>
                          <p className="text-sm font-semibold text-gray-800">{delivery.assignedDriver.name}</p>
                          {delivery.assignedVehicle && (
                            <p className="text-xs text-gray-600">Vehicle: {delivery.assignedVehicle.name} ({delivery.assignedVehicle.plateNumber})</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Assignment Form */}
                    {selectedDelivery?._id === delivery._id ? (
                      <div className="lg:w-96 bg-blue-50 p-6 rounded-xl border-2 border-blue-300">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                          {delivery.status === "Assigned" ? "🔄 Reassign Resources" : "🚚 Assign Resources"}
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              👤 Select Driver *
                            </label>
                            <select
                              value={assignForm.driverId}
                              onChange={(e) => setAssignForm({ ...assignForm, driverId: e.target.value })}
                              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Choose Driver</option>
                              {availableDrivers.map((driver) => (
                                <option key={driver._id} value={driver._id}>
                                  {driver.name} - {driver.email}
                                </option>
                              ))}
                            </select>
                            {availableDrivers.length === 0 && (
                              <p className="text-xs text-red-600 mt-1">⚠️ No drivers available</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              🚚 Select Vehicle *
                            </label>
                            <select
                              value={assignForm.vehicleId}
                              onChange={(e) => setAssignForm({ ...assignForm, vehicleId: e.target.value })}
                              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Choose Vehicle</option>
                              {availableVehicles.map((vehicle) => (
                                <option key={vehicle._id} value={vehicle._id}>
                                  {vehicle.name} - {vehicle.plateNumber} ({vehicle.type})
                                </option>
                              ))}
                            </select>
                            {availableVehicles.length === 0 && (
                              <p className="text-xs text-red-600 mt-1">⚠️ No vehicles available</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              📏 Estimated Distance (km) *
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={assignForm.estimatedDistance}
                              onChange={(e) => setAssignForm({ ...assignForm, estimatedDistance: e.target.value })}
                              placeholder="e.g., 15.5"
                              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-600 mt-1">💡 Used for pricing calculation</p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              ⏱️ Estimated Duration (minutes)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={assignForm.estimatedDuration}
                              onChange={(e) => setAssignForm({ ...assignForm, estimatedDuration: e.target.value })}
                              placeholder="e.g., 30"
                              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleAssign}
                              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
                            >
                              ✅ {delivery.status === "Assigned" ? "Reassign" : "Assign"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDelivery(null);
                                setAssignForm({
                                  driverId: "",
                                  vehicleId: "",
                                  estimatedDistance: "",
                                  estimatedDuration: ""
                                });
                              }}
                              className="px-4 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <button
                          onClick={() => setSelectedDelivery(delivery)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                        >
                          {delivery.status === "Assigned" ? "🔄 Reassign" : "🚚 Assign"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAssignDeliveryNew;
