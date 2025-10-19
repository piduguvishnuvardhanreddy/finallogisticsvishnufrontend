import React, { useContext, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { SocketContext } from "../context/SocketContext";
import axios from "axios";

const RealtimeMap = ({ deliveryIds, driverOnly = false }) => {
  const { socket } = useContext(SocketContext);
  const [deliveries, setDeliveries] = useState([]);
  const [driverLocation, setDriverLocation] = useState({ lat: 20, lng: 78 });

  // Fetch delivery details
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://finallogisticsvishnubackend.onrender.com/api/deliveries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = res.data.filter((d) => deliveryIds.includes(d._id));
        setDeliveries(filtered);
      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
      }
    };
    fetchDeliveries();
  }, [deliveryIds]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    deliveryIds.forEach((id) => {
      socket.on(`deliveryLocation_${id}`, (data) => {
        setDeliveries((prev) =>
          prev.map((d) =>
            d._id === id ? { ...d, currentLocation: { lat: data.lat, lng: data.lng } } : d
          )
        );
      });
    });

    return () => {
      deliveryIds.forEach((id) => socket.off(`deliveryLocation_${id}`));
    };
  }, [socket, deliveryIds]);

  // Driver geolocation (only if driver view)
  useEffect(() => {
    if (!driverOnly || !navigator.geolocation) return;

    const updateLocation = (position) => {
      const { latitude, longitude } = position.coords;
      setDriverLocation({ lat: latitude, lng: longitude });

      // Send to backend for all deliveries assigned to driver
      deliveries.forEach((delivery) => {
        socket.emit("driverLocationUpdate", {
          driverId: delivery.driver,
          vehicleId: delivery.vehicle,
          deliveryId: delivery._id,
          lat: latitude,
          lng: longitude,
        });
      });
    };

    const watchId = navigator.geolocation.watchPosition(updateLocation);
    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverOnly, socket, deliveries]);

  return (
    <MapContainer center={[driverLocation.lat, driverLocation.lng]} zoom={5} className="h-[600px] w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Driver location marker (if driverOnly) */}
      {driverOnly && (
        <Marker position={[driverLocation.lat, driverLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Delivery markers */}
      {deliveries.map((delivery) => {
        const loc = delivery.currentLocation || delivery.dropLocation || { lat: 0, lng: 0 };
        return (
          <Marker key={delivery._id} position={[loc.lat, loc.lng]}>
            <Popup>
              <strong>Delivery ID:</strong> {delivery._id} <br />
              <strong>Status:</strong> {delivery.status} <br />
              <strong>Driver:</strong> {delivery.driver} <br />
              <strong>Vehicle:</strong> {delivery.vehicle}
            </Popup>
          </Marker>
        );
      })}

      {/* Optional lines from driver to drop locations */}
      {driverOnly &&
        deliveries.map((delivery) => {
          const loc = delivery.dropLocation || { lat: 0, lng: 0 };
          return (
            <Polyline
              key={delivery._id}
              positions={[
                [driverLocation.lat, driverLocation.lng],
                [loc.lat, loc.lng],
              ]}
              color="blue"
            />
          );
        })}
    </MapContainer>
  );
};

export default RealtimeMap;

