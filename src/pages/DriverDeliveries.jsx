import React, { useEffect, useState } from "react";
import axios from "axios";

const DriverDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://finallogisticsvishnubackend.onrender.com/api/deliveries/driver", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(res.data);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://finallogisticsvishnubackend.onrender.com/api/deliveries/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeliveries((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status } : d))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Deliveries</h2>

      <div className="space-y-4">
        {deliveries.map((d) => (
          <div
            key={d._id}
            className="p-4 bg-white shadow rounded flex justify-between items-center"
          >
            <div>
              <p><strong>Delivery ID:</strong> {d._id}</p>
              <p><strong>Customer:</strong> {d.customer}</p>
              <p><strong>Status:</strong> {d.status}</p>
            </div>

            <div className="flex gap-2">
              {d.status === "Pending" && (
                <button
                  onClick={() => updateStatus(d._id, "On Route")}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Delivery
                </button>
              )}

              {d.status === "On Route" && (
                <button
                  onClick={() => updateStatus(d._id, "Delivered")}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverDeliveries;
