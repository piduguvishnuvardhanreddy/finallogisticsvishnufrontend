import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const vehicleIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DeliveryMap = ({ delivery, currentLocation }) => {
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default India center
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    if (delivery?.pickupLocation?.lat && delivery?.pickupLocation?.lng) {
      setCenter([delivery.pickupLocation.lat, delivery.pickupLocation.lng]);
    }

    // Build route coordinates
    const coords = [];
    if (delivery?.pickupLocation?.lat && delivery?.pickupLocation?.lng) {
      coords.push([delivery.pickupLocation.lat, delivery.pickupLocation.lng]);
    }
    if (currentLocation?.lat && currentLocation?.lng) {
      coords.push([currentLocation.lat, currentLocation.lng]);
    }
    if (delivery?.dropLocation?.lat && delivery?.dropLocation?.lng) {
      coords.push([delivery.dropLocation.lat, delivery.dropLocation.lng]);
    }
    setRouteCoordinates(coords);
  }, [delivery, currentLocation]);

  if (!delivery) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No delivery data available</p>
      </div>
    );
  }

  const hasPickup = delivery.pickupLocation?.lat && delivery.pickupLocation?.lng;
  const hasDrop = delivery.dropLocation?.lat && delivery.dropLocation?.lng;
  const hasCurrentLocation = currentLocation?.lat && currentLocation?.lng;

  if (!hasPickup && !hasDrop) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No location data available for this delivery</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Location Marker */}
        {hasPickup && (
          <Marker
            position={[delivery.pickupLocation.lat, delivery.pickupLocation.lng]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-green-800">📍 Pickup Location</h3>
                <p className="text-sm">{delivery.pickupLocation.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drop Location Marker */}
        {hasDrop && (
          <Marker
            position={[delivery.dropLocation.lat, delivery.dropLocation.lng]}
            icon={dropIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-red-800">🎯 Drop Location</h3>
                <p className="text-sm">{delivery.dropLocation.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current Vehicle Location Marker */}
        {hasCurrentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={vehicleIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-blue-800">🚚 Current Location</h3>
                <p className="text-sm">Driver: {delivery.assignedDriver?.name || "Unknown"}</p>
                <p className="text-xs text-gray-600">
                  Last updated: {currentLocation.lastUpdated 
                    ? new Date(currentLocation.lastUpdated).toLocaleTimeString() 
                    : "N/A"}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="blue"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
