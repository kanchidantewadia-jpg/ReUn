import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Sighting {
  id: string;
  sighting_location: string;
  sighting_description: string;
  sighting_date: string;
  latitude: number | null;
  longitude: number | null;
  reporter_name: string | null;
  verified: boolean;
}

interface PredictiveMapProps {
  lastSeenLocation: string;
  sightings: Sighting[];
}

const PredictiveMap = ({ lastSeenLocation, sightings }: PredictiveMapProps) => {
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    // If we have sightings with coordinates, center on the first one
    const sightingWithCoords = sightings.find(s => s.latitude && s.longitude);
    if (sightingWithCoords && sightingWithCoords.latitude && sightingWithCoords.longitude) {
      setCenter([sightingWithCoords.latitude, sightingWithCoords.longitude]);
      setZoom(10);
    }
  }, [sightings]);

  // Create custom icons for different marker types
  const lastSeenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const sightingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const verifiedSightingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Predictive search area circle */}
        {sightings.length === 0 && (
          <Circle
            center={center}
            radius={300000} // 300km radius
            pathOptions={{
              color: 'hsl(var(--primary))',
              fillColor: 'hsl(var(--primary) / 0.1)',
              fillOpacity: 0.2,
            }}
          />
        )}

        {/* Sighting markers */}
        {sightings.map((sighting) => {
          if (!sighting.latitude || !sighting.longitude) return null;
          
          return (
            <Marker
              key={sighting.id}
              position={[sighting.latitude, sighting.longitude]}
              icon={sighting.verified ? verifiedSightingIcon : sightingIcon}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <h3 className="font-semibold text-sm">
                    {sighting.verified ? '✓ Verified Sighting' : 'Community Sighting'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    <strong>Location:</strong> {sighting.sighting_location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Date:</strong> {new Date(sighting.sighting_date).toLocaleDateString()}
                  </p>
                  {sighting.sighting_description && (
                    <p className="text-xs">
                      <strong>Details:</strong> {sighting.sighting_description}
                    </p>
                  )}
                  {sighting.reporter_name && (
                    <p className="text-xs text-muted-foreground">
                      Reported by: {sighting.reporter_name}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PredictiveMap;
