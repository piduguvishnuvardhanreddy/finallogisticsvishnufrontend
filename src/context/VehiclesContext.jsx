import React, { createContext, useState, useEffect, useContext } from "react";
import { vehicleAPI } from "../services/api";

export const VehiclesContext = createContext();

export const VehiclesProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const response = await vehicleAPI.getAll();
      setVehicles(response.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err.response?.data?.message || "Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const addVehicle = async (vehicleData) => {
    try {
      const response = await vehicleAPI.create(vehicleData);
      setVehicles([...vehicles, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to add vehicle" };
    }
  };

  const updateVehicle = async (id, vehicleData) => {
    try {
      const response = await vehicleAPI.update(id, vehicleData);
      setVehicles(vehicles.map(v => v._id === id ? response.data : v));
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to update vehicle" };
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await vehicleAPI.delete(id);
      setVehicles(vehicles.filter(v => v._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to delete vehicle" };
    }
  };

  const refreshVehicles = () => {
    fetchVehicles();
  };

  return (
    <VehiclesContext.Provider 
      value={{ 
        vehicles, 
        loading, 
        error, 
        refreshVehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle
      }}
    >
      {children}
    </VehiclesContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehiclesContext);
  if (!context) {
    throw new Error("useVehicles must be used within a VehiclesProvider");
  }
  return context;
};
