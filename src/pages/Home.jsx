import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const vehiclesRes = await axios.get("https://finallogisticsvishnubackend.onrender.com/api/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(vehiclesRes.data);

        const deliveriesRes = await axios.get("https://finallogisticsvishnubackend.onrender.com/api/deliveries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeliveries(deliveriesRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />

      <main className="w-full px-6 py-6">
        <motion.div
          className="grid lg:grid-cols-4 gap-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Section */}
          <motion.aside
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile</h2>
            <div className="space-y-3 text-sm">
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <strong className="text-gray-700">Name:</strong>
                <div className="text-gray-900 font-medium mt-1">{user?.name}</div>
              </motion.div>
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <strong className="text-gray-700">Email:</strong>
                <div className="text-gray-900 font-medium mt-1">{user?.email}</div>
              </motion.div>
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <strong className="text-gray-700">Role:</strong>
                <div className="text-gray-900 font-medium mt-1">{user?.role || "Customer"}</div>
              </motion.div>
            </div>
          </motion.aside>

          {/* Dashboard */}
          <motion.section
            className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>

            {loading ? (
              <motion.div
                className="flex items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-gray-600 font-medium">Loading data...</p>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Vehicles */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-bold text-lg mb-3 text-gray-800">🚚 Vehicles</h3>
                  {vehicles.length === 0 ? (
                    <motion.p
                      className="text-gray-500 italic p-4 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      No vehicles available.
                    </motion.p>
                  ) : (
                    <motion.ul className="space-y-2">
                      {vehicles.map((v, idx) => (
                        <motion.li
                          key={v._id}
                          className="p-4 border border-gray-200 rounded-xl flex justify-between items-center bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          whileHover={{ scale: 1.02, x: 4 }}
                        >
                          <span className="font-medium text-gray-800">{v.name} <span className="text-gray-500">({v.type})</span></span>
                          <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">{v.status}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </motion.div>

                {/* Deliveries */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-bold text-lg mb-3 text-gray-800">📦 Deliveries</h3>
                  {deliveries.length === 0 ? (
                    <motion.p
                      className="text-gray-500 italic p-4 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      No deliveries assigned.
                    </motion.p>
                  ) : (
                    <motion.ul className="space-y-2">
                      {deliveries.map((d, idx) => (
                        <motion.li
                          key={d._id}
                          className="p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          whileHover={{ scale: 1.02, x: 4 }}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-gray-800">
                              <span className="font-semibold">Pickup:</span> {d.pickupAddress} <span className="text-gray-400">→</span> <span className="font-semibold">Drop:</span> {d.dropAddress}
                            </span>
                            <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium ml-2">{d.status}</span>
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </motion.div>
              </>
            )}
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
