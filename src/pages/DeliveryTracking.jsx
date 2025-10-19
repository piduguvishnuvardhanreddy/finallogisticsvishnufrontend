import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { SocketContext } from "../context/SocketContext"; // use existing context

const DeliveryTracking = () => {
  const { deliveryId } = useParams();
  const { socket } = useContext(SocketContext);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [driverInfo, setDriverInfo] = useState({});

  useEffect(() => {
    if (!socket) return;

    // Subscribe to live location updates for this delivery
    socket.on(`deliveryLocation_${deliveryId}`, (data) => {
      setLocation({ lat: data.lat, lng: data.lng });
      setDriverInfo({ driverId: data.driverId, vehicleId: data.vehicleId });
    });

    return () => socket.off(`deliveryLocation_${deliveryId}`);
  }, [socket, deliveryId]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Delivery Tracking</h2>

      <div className="h-[500px]">
        <MapContainer center={[location.lat, location.lng]} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              Driver: {driverInfo.driverId} <br />
              Vehicle: {driverInfo.vehicleId}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default DeliveryTracking;

