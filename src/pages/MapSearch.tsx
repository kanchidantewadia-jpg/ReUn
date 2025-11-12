import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MissingPerson {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  last_seen_location: string;
  last_seen_date: string;
  status: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function MapSearch() {
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");

  useEffect(() => {
    fetchMissingPersons();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [missingPersons, statusFilter, ageFilter]);

  const fetchMissingPersons = async () => {
    try {
      const { data, error } = await supabase
        .from("missing_persons")
        .select("id, full_name, age, gender, last_seen_location, last_seen_date, status, photo_url, latitude, longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("last_seen_date", { ascending: false });

      if (error) throw error;
      setMissingPersons(data || []);
    } catch (error) {
      console.error("Error fetching missing persons:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...missingPersons];

    if (statusFilter !== "all") {
      filtered = filtered.filter(person => person.status === statusFilter);
    }

    if (ageFilter === "minor") {
      filtered = filtered.filter(person => person.age < 18);
    } else if (ageFilter === "adult") {
      filtered = filtered.filter(person => person.age >= 18);
    }

    setFilteredPersons(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "missing": return "destructive";
      case "found": return "default";
      case "closed": return "secondary";
      default: return "outline";
    }
  };

  const defaultCenter: [number, number] = [39.8283, -98.5795]; // Center of USA

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Map Search</h1>
          <p className="text-muted-foreground mb-6">
            Explore missing persons cases by location
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="found">Found</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="minor">Minors Only</SelectItem>
                <SelectItem value="adult">Adults Only</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto">
              <Badge variant="outline">{filteredPersons.length} cases shown</Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <MapContainer
              center={defaultCenter}
              zoom={4}
              style={{ height: "600px", width: "100%" }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredPersons.map((person) => {
                if (!person.latitude || !person.longitude) return null;
                
                return (
                  <Marker
                    key={person.id}
                    position={[person.latitude, person.longitude]}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          {person.photo_url && (
                            <img
                              src={person.photo_url}
                              alt={person.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold">{person.full_name}</h3>
                            <Badge variant={getStatusColor(person.status)} className="text-xs">
                              {person.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm mb-3">
                          <p><strong>Age:</strong> {person.age}</p>
                          <p><strong>Gender:</strong> {person.gender}</p>
                          <p><strong>Last Seen:</strong> {person.last_seen_location}</p>
                          <p><strong>Date:</strong> {new Date(person.last_seen_date).toLocaleDateString()}</p>
                        </div>
                        <Link to={`/person/${person.id}`}>
                          <Button size="sm" className="w-full">View Details</Button>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}