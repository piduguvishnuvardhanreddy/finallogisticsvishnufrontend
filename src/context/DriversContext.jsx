import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const DriversContext = createContext();

export const DriversProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDrivers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://finallogisticsvishnubackend.onrender.com/api/auth/drivers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(response.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError(err.response?.data?.message || "Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const refreshDrivers = () => {
    fetchDrivers();
  };

  return (
    <DriversContext.Provider value={{ drivers, loading, error, refreshDrivers }}>
      {children}
    </DriversContext.Provider>
  );
};

export const useDrivers = () => {
  const context = useContext(DriversContext);
  if (!context) {
    throw new Error("useDrivers must be used within a DriversProvider");
  }
  return context;
};
