import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for pickup and drop locations
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

// Component to handle map clicks
function LocationMarker({ position, setPosition, icon, label, isActive }) {
  const map = useMapEvents({
    click(e) {
      if (isActive) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}>
      <Popup>{label}</Popup>
    </Marker>
  );
}

// Geocoding function using Nominatim (OpenStreetMap)
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Reverse geocoding
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

const MapLocationPicker = ({ 
  pickupLocation, 
  setPickupLocation, 
  dropLocation, 
  setDropLocation,
  showRoute = true 
}) => {
  const [pickupMarker, setPickupMarker] = useState(null);
  const [dropMarker, setDropMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("pickup"); // 'pickup' or 'drop'
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Initialize markers from props
  useEffect(() => {
    if (pickupLocation?.lat && pickupLocation?.lng) {
      setPickupMarker({ lat: pickupLocation.lat, lng: pickupLocation.lng });
    }
    if (dropLocation?.lat && dropLocation?.lng) {
      setDropMarker({ lat: dropLocation.lat, lng: dropLocation.lng });
    }
  }, []);

  // Update route when both markers are set
  useEffect(() => {
    if (pickupMarker && dropMarker && showRoute) {
      setRouteCoordinates([
        [pickupMarker.lat, pickupMarker.lng],
        [dropMarker.lat, dropMarker.lng]
      ]);
    } else {
      setRouteCoordinates([]);
    }
  }, [pickupMarker, dropMarker, showRoute]);

  // Handle pickup marker change
  useEffect(() => {
    if (pickupMarker) {
      reverseGeocode(pickupMarker.lat, pickupMarker.lng).then(address => {
        setPickupLocation({
          address,
          lat: pickupMarker.lat,
          lng: pickupMarker.lng
        });
      });
    }
  }, [pickupMarker]);

  // Handle drop marker change
  useEffect(() => {
    if (dropMarker) {
      reverseGeocode(dropMarker.lat, dropMarker.lng).then(address => {
        setDropLocation({
          address,
          lat: dropMarker.lat,
          lng: dropMarker.lng
        });
      });
    }
  }, [dropMarker]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a location to search");
      return;
    }

    setSearching(true);
    const result = await geocodeAddress(searchQuery);
    setSearching(false);

    if (result) {
      const location = { lat: result.lat, lng: result.lng };
      
      if (searchType === "pickup") {
        setPickupMarker(location);
        setPickupLocation({
          address: result.display_name,
          lat: result.lat,
          lng: result.lng
        });
      } else {
        setDropMarker(location);
        setDropLocation({
          address: result.display_name,
          lat: result.lat,
          lng: result.lng
        });
      }
      
      setMapCenter([result.lat, result.lng]);
      setSearchQuery("");
    } else {
      alert("Location not found. Please try a different search term.");
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          const address = await reverseGeocode(location.lat, location.lng);
          
          if (searchType === "pickup") {
            setPickupMarker(location);
            setPickupLocation({ ...location, address });
          } else {
            setDropMarker(location);
            setDropLocation({ ...location, address });
          }
          
          setMapCenter([location.lat, location.lng]);
        },
        (error) => {
          alert("Unable to get your location. Please enable location services.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const calculateDistance = () => {
    if (!pickupMarker || !dropMarker) return 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = (dropMarker.lat - pickupMarker.lat) * Math.PI / 180;
    const dLon = (dropMarker.lng - pickupMarker.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickupMarker.lat * Math.PI / 180) * Math.cos(dropMarker.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
  };

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
        <div className="flex gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="pickup">📍 Pickup Location</option>
            <option value="drop">🎯 Drop Location</option>
          </select>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for a location..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {searching ? "🔍 Searching..." : "🔍 Search"}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGetCurrentLocation}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            📍 Use Current Location
          </button>
          
          {pickupMarker && dropMarker && (
            <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold">
              📏 Distance: {calculateDistance()} km
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> Click on the map to set {searchType === "pickup" ? "pickup" : "drop"} location, or search for an address above.
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-lg overflow-hidden shadow-lg border-2 border-gray-200" style={{ height: "500px" }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <LocationMarker
            position={pickupMarker}
            setPosition={async (latlng) => {
              setPickupMarker(latlng);
              const address = await reverseGeocode(latlng.lat, latlng.lng);
              setPickupLocation({ lat: latlng.lat, lng: latlng.lng, address });
            }}
            icon={pickupIcon}
            label="📍 Pickup Location"
            isActive={searchType === "pickup"}
          />
          
          <LocationMarker
            position={dropMarker}
            setPosition={async (latlng) => {
              setDropMarker(latlng);
              const address = await reverseGeocode(latlng.lat, latlng.lng);
              setDropLocation({ lat: latlng.lat, lng: latlng.lng, address });
            }}
            icon={dropIcon}
            label="🎯 Drop Location"
            isActive={searchType === "drop"}
          />

          {routeCoordinates.length > 0 && (
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

      {/* Location Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-bold text-green-800 mb-2">📍 Pickup Location</h4>
          <p className="text-sm text-gray-700">
            {pickupLocation?.address || "Not set - Click on map or search"}
          </p>
          {pickupMarker && (
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {pickupMarker.lat.toFixed(6)}, {pickupMarker.lng.toFixed(6)}
            </p>
          )}
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-bold text-red-800 mb-2">🎯 Drop Location</h4>
          <p className="text-sm text-gray-700">
            {dropLocation?.address || "Not set - Click on map or search"}
          </p>
          {dropMarker && (
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {dropMarker.lat.toFixed(6)}, {dropMarker.lng.toFixed(6)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
