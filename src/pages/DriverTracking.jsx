import React, { useEffect, useContext, useState } from "react";
import { SocketContext } from "../context/SocketContext";

const DriverTracking = ({ deliveryId, vehicleId, driverId }) => {
  const { socket } = useContext(SocketContext);
  const [tracking, setTracking] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setTracking({ lat: latitude, lng: longitude });

        if (socket) {
          socket.emit("driverLocationUpdate", {
            driverId,
            vehicleId,
            deliveryId,
            lat: latitude,
            lng: longitude,
          });
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, driverId, vehicleId, deliveryId]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Driver Live Tracking</h2>
      <p>Current Coordinates:</p>
      <p>Latitude: {tracking.lat}</p>
      <p>Longitude: {tracking.lng}</p>
      <p className="text-green-600 mt-2">Sending location updates in real-time...</p>
    </div>
  );
};

export default DriverTracking;
