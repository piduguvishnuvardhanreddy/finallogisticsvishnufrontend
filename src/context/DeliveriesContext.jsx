import React, { createContext, useState, useEffect, useContext } from "react";
import { deliveryAPI } from "../services/api";

export const DeliveriesContext = createContext();

export const DeliveriesProvider = ({ children }) => {
  // Initialize from localStorage if available
  const [deliveries, setDeliveries] = useState(() => {
    const cached = localStorage.getItem("deliveries");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save to localStorage whenever deliveries change
  useEffect(() => {
    if (deliveries.length > 0) {
      localStorage.setItem("deliveries", JSON.stringify(deliveries));
      console.log("Saved deliveries to localStorage:", deliveries.length);
    }
  }, [deliveries]);

  const fetchDeliveries = async () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      // Load from cache if no token
      const cached = localStorage.getItem("deliveries");
      if (cached) {
        setDeliveries(JSON.parse(cached));
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(userStr);
      let response;
      
      if (user?.role === "Driver") {
        response = await deliveryAPI.getAssigned();
      } else if (user?.role === "Customer") {
        response = await deliveryAPI.getMyBookings();
      } else {
        response = await deliveryAPI.getAll();
      }
      
      console.log("Fetched deliveries from API:", response.data.length);
      setDeliveries(response.data);
      // Save to localStorage
      localStorage.setItem("deliveries", JSON.stringify(response.data));
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError(err.response?.data?.message || "Failed to fetch deliveries");
      // Try to load from cache on error
      const cached = localStorage.getItem("deliveries");
      if (cached) {
        setDeliveries(JSON.parse(cached));
      } else {
        setDeliveries([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchDeliveries();
    } else {
      // Load from cache if not logged in
      const cached = localStorage.getItem("deliveries");
      if (cached) {
        setDeliveries(JSON.parse(cached));
      }
    }
  }, []);

  const createBooking = async (bookingData) => {
    try {
      const response = await deliveryAPI.createBooking(bookingData);
      await fetchDeliveries();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to create booking" };
    }
  };

  const updateDeliveryStatus = async (id, status) => {
    try {
      const response = await deliveryAPI.updateStatus(id, status);
      setDeliveries(deliveries.map(d => d._id === id ? response.data : d));
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to update status" };
    }
  };

  const approveDelivery = async (id) => {
    try {
      const response = await deliveryAPI.approve(id);
      await fetchDeliveries();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to approve delivery" };
    }
  };

  const assignDelivery = async (id, assignData) => {
    try {
      const response = await deliveryAPI.assign(id, assignData);
      await fetchDeliveries();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to assign delivery" };
    }
  };

  const acceptDelivery = async (id) => {
    try {
      const response = await deliveryAPI.accept(id);
      await fetchDeliveries();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to accept delivery" };
    }
  };

  const rejectDelivery = async (id, reason) => {
    try {
      const response = await deliveryAPI.reject(id, reason);
      await fetchDeliveries();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to reject delivery" };
    }
  };

  const cancelBooking = async (id) => {
    try {
      const response = await deliveryAPI.cancelBooking(id);
      // Update local state and localStorage immediately
      const updatedDeliveries = deliveries.map(d => 
        d._id === id ? { ...d, status: "Cancelled" } : d
      );
      setDeliveries(updatedDeliveries);
      localStorage.setItem("deliveries", JSON.stringify(updatedDeliveries));
      // Also fetch from server to ensure sync
      await fetchDeliveries();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to cancel booking" };
    }
  };

  const deleteDelivery = async (id) => {
    try {
      await deliveryAPI.delete(id);
      const updatedDeliveries = deliveries.filter(d => d._id !== id);
      setDeliveries(updatedDeliveries);
      // Update localStorage
      localStorage.setItem("deliveries", JSON.stringify(updatedDeliveries));
      console.log("Deleted delivery from localStorage, remaining:", updatedDeliveries.length);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to delete delivery" };
    }
  };

  const refreshDeliveries = () => {
    fetchDeliveries();
  };

  const getStats = () => {
    return {
      total: deliveries.length,
      pending: deliveries.filter(d => d.status === "Pending").length,
      approved: deliveries.filter(d => d.status === "Approved").length,
      assigned: deliveries.filter(d => d.status === "Assigned").length,
      accepted: deliveries.filter(d => d.status === "Accepted").length,
      onRoute: deliveries.filter(d => d.status === "On Route").length,
      delivered: deliveries.filter(d => d.status === "Delivered").length,
      cancelled: deliveries.filter(d => d.status === "Cancelled").length,
      rejected: deliveries.filter(d => d.status === "Rejected").length,
    };
  };

  return (
    <DeliveriesContext.Provider 
      value={{ 
        deliveries, 
        loading, 
        error, 
        refreshDeliveries,
        createBooking,
        updateDeliveryStatus,
        approveDelivery,
        assignDelivery,
        acceptDelivery,
        rejectDelivery,
        cancelBooking,
        deleteDelivery,
        getStats
      }}
    >
      {children}
    </DeliveriesContext.Provider>
  );
};

export const useDeliveries = () => {
  const context = useContext(DeliveriesContext);
  if (!context) {
    throw new Error("useDeliveries must be used within a DeliveriesProvider");
  }
  return context;
};
