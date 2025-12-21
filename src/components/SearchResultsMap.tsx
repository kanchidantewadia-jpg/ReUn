import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Eye, MapPin } from 'lucide-react';

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

interface MissingPerson {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  last_seen_location: string;
  last_seen_date: string;
  status: string;
  photo_url: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDemo?: boolean;
}

interface SearchResultsMapProps {
  persons: MissingPerson[];
  onReportSighting: (personId: string) => void;
}

const SearchResultsMap = ({ persons, onReportSighting }: SearchResultsMapProps) => {
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center
  const [zoom, setZoom] = useState(5);

  // Create custom icons for different statuses
  const missingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const foundIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const closedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const getIcon = (status: string) => {
    switch (status) {
      case 'missing':
        return missingIcon;
      case 'found':
        return foundIcon;
      default:
        return closedIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'missing':
        return 'bg-red-500';
      case 'found':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // Filter persons with coordinates
  const personsWithCoords = persons.filter(p => p.latitude && p.longitude);

  useEffect(() => {
    if (personsWithCoords.length > 0) {
      const first = personsWithCoords[0];
      if (first.latitude && first.longitude) {
        setCenter([first.latitude, first.longitude]);
        setZoom(8);
      }
    }
  }, [persons]);

  if (personsWithCoords.length === 0) {
    return (
      <div className="w-full h-[500px] rounded-lg border border-border bg-muted/50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground">No location data available for current results</p>
          <p className="text-sm text-muted-foreground/70">
            Results with coordinates will appear on the map
          </p>
        </div>
      </div>
    );
  }

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
        
        {personsWithCoords.map((person) => (
          <Marker
            key={person.id}
            position={[person.latitude!, person.longitude!]}
            icon={getIcon(person.status)}
          >
            <Popup>
              <div className="p-2 space-y-2 min-w-[200px]">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">{person.full_name}</h3>
                  <Badge className={`${getStatusColor(person.status)} text-xs`}>
                    {person.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {person.age && `Age: ${person.age}`}
                  {person.gender && ` • ${person.gender}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Location:</strong> {person.last_seen_location}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Last Seen:</strong> {new Date(person.last_seen_date).toLocaleDateString()}
                </p>
                <div className="flex gap-2 pt-2">
                  {!person.isDemo && (
                    <>
                      <Link to={`/person/${person.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="flex-1 text-xs"
                        onClick={() => onReportSighting(person.id)}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Report
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SearchResultsMap;
