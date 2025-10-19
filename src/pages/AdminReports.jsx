import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminReports = () => {
  const [driverReports, setDriverReports] = useState([]);
  const [vehicleReports, setVehicleReports] = useState([]);

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get("https://finallogisticsvishnubackend.onrender.com/api/reports/drivers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://finallogisticsvishnubackend.onrender.com/api/reports/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDriverReports(driversRes.data);
      setVehicleReports(vehiclesRes.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Historical Reports</h2>

      {/* Driver Reports */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Driver Performance</h3>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Driver</th>
              <th className="border p-2">Completed Deliveries</th>
              <th className="border p-2">Average Delivery Time (mins)</th>
            </tr>
          </thead>
          <tbody>
            {driverReports.map((d) => (
              <tr key={d.driverId}>
                <td className="border p-2">{d.name}</td>
                <td className="border p-2">{d.completedDeliveries}</td>
                <td className="border p-2">{d.avgDeliveryTime.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Vehicle Reports */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Vehicle Utilization</h3>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Vehicle</th>
              <th className="border p-2">Deliveries Assigned</th>
              <th className="border p-2">Active Hours</th>
            </tr>
          </thead>
          <tbody>
            {vehicleReports.map((v) => (
              <tr key={v.vehicleId}>
                <td className="border p-2">{v.name}</td>
                <td className="border p-2">{v.deliveriesAssigned}</td>
                <td className="border p-2">{v.activeHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminReports;
