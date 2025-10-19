import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useDeliveries } from "../context/DeliveriesContext";

const AdminDeliveryList = () => {
  const navigate = useNavigate();
  const { deliveries, loading, refreshDeliveries, deleteDelivery } = useDeliveries();
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    refreshDeliveries();
  }, []);

  useEffect(() => {
    filterAndSortDeliveries();
  }, [deliveries, searchQuery, statusFilter, sortBy, sortOrder]);

  const filterAndSortDeliveries = () => {
    let filtered = [...deliveries];

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.deliveryId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.assignedDriver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.pickupLocation?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.dropLocation?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case "createdAt":
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "customer":
          aVal = a.customer?.name || "";
          bVal = b.customer?.name || "";
          break;
        case "driver":
          aVal = a.assignedDriver?.name || "";
          bVal = b.assignedDriver?.name || "";
          break;
        case "price":
          aVal = a.pricing?.totalPrice || 0;
          bVal = b.pricing?.totalPrice || 0;
          break;
        default:
          aVal = a.createdAt;
          bVal = b.createdAt;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredDeliveries(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    
    const result = await deleteDelivery(id);
    if (result.success) {
      alert("✅ Delivery deleted successfully");
    } else {
      alert("❌ " + (result.error || "Failed to delete delivery"));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Approved: "bg-green-100 text-green-800 border-green-200",
      Assigned: "bg-blue-100 text-blue-800 border-blue-200",
      Accepted: "bg-indigo-100 text-indigo-800 border-indigo-200",
      "On Route": "bg-orange-100 text-orange-800 border-orange-200",
      Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === "Pending").length,
    approved: deliveries.filter(d => d.status === "Approved").length,
    assigned: deliveries.filter(d => d.status === "Assigned").length,
    onRoute: deliveries.filter(d => d.status === "On Route").length,
    delivered: deliveries.filter(d => d.status === "Delivered").length,
    cancelled: deliveries.filter(d => d.status === "Cancelled").length,
    totalRevenue: deliveries
      .filter(d => d.status === "Delivered")
      .reduce((sum, d) => sum + (d.pricing?.totalPrice || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📦 Complete Delivery List</h1>
          <p className="text-gray-600">Comprehensive view of all deliveries in the system</p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-gray-600">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-600">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-600">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-600">
            <p className="text-sm text-gray-600 mb-1">Assigned</p>
            <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-orange-600">
            <p className="text-sm text-gray-600 mb-1">On Route</p>
            <p className="text-2xl font-bold text-orange-600">{stats.onRoute}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-emerald-600">
            <p className="text-sm text-gray-600 mb-1">Delivered</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.delivered}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-600">
            <p className="text-sm text-gray-600 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-600">
            <p className="text-sm text-gray-600 mb-1">Revenue</p>
            <p className="text-xl font-bold text-purple-600">₹{stats.totalRevenue.toFixed(0)}</p>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search deliveries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Assigned">Assigned</option>
                <option value="Accepted">Accepted</option>
                <option value="On Route">On Route</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="status">Status</option>
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="price">Price</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={refreshDeliveries}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => navigate("/admin/assign")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              ➕ Assign Delivery
            </button>
          </div>
        </motion.div>

        {/* Deliveries Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No deliveries found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Route</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Package</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDeliveries.map((delivery, index) => (
                    <motion.tr
                      key={delivery._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-800">
                        {delivery.deliveryId?.substring(0, 12)}...
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <div>{delivery.customer?.name || "N/A"}</div>
                        <div className="text-xs text-gray-500">{delivery.customer?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {delivery.assignedDriver?.name || "Unassigned"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="max-w-xs">
                          <div className="truncate">📍 {delivery.pickupLocation?.address?.substring(0, 30)}...</div>
                          <div className="truncate">🎯 {delivery.dropLocation?.address?.substring(0, 30)}...</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>{delivery.packageDetails?.packageType || "N/A"}</div>
                        <div className="text-xs text-gray-500">{delivery.packageDetails?.weight || 0} kg</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        ₹{delivery.pricing?.totalPrice?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/track/${delivery._id}`)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDelete(delivery._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {filteredDeliveries.length} of {deliveries.length} deliveries
        </div>
      </div>
    </div>
  );
};

export default AdminDeliveryList;
