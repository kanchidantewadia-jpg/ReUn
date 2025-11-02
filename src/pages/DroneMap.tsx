import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Satellite, MapPin, Clock, Radio, Battery } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DroneUnit {
  id: string;
  name: string;
  status: "active" | "idle" | "charging";
  battery: number;
  location: { lat: number; lng: number };
  coverage: number;
  lastUpdate: string;
}

interface SatelliteData {
  id: string;
  name: string;
  coverage: string;
  lastPass: string;
  nextPass: string;
  resolution: string;
}

const DroneMap = () => {
  const { toast } = useToast();
  const [drones, setDrones] = useState<DroneUnit[]>([
    {
      id: "D1",
      name: "Drone Alpha",
      status: "active",
      battery: 78,
      location: { lat: 40.7128, lng: -74.006 },
      coverage: 5.2,
      lastUpdate: new Date().toISOString(),
    },
    {
      id: "D2",
      name: "Drone Beta",
      status: "idle",
      battery: 95,
      location: { lat: 40.7589, lng: -73.9851 },
      coverage: 0,
      lastUpdate: new Date(Date.now() - 300000).toISOString(),
    },
  ]);

  const [satellites] = useState<SatelliteData[]>([
    {
      id: "S1",
      name: "Sentinel-2",
      coverage: "Global",
      lastPass: new Date(Date.now() - 7200000).toISOString(),
      nextPass: new Date(Date.now() + 14400000).toISOString(),
      resolution: "10m",
    },
    {
      id: "S2",
      name: "Landsat-8",
      coverage: "North America",
      lastPass: new Date(Date.now() - 10800000).toISOString(),
      nextPass: new Date(Date.now() + 21600000).toISOString(),
      resolution: "30m",
    },
  ]);

  const deployDrone = (droneId: string) => {
    setDrones((prev) =>
      prev.map((d) =>
        d.id === droneId
          ? { ...d, status: "active" as const, lastUpdate: new Date().toISOString() }
          : d
      )
    );
    toast({
      title: "Drone Deployed",
      description: `${droneId} is now searching the area.`,
    });
  };

  const recallDrone = (droneId: string) => {
    setDrones((prev) =>
      prev.map((d) =>
        d.id === droneId
          ? { ...d, status: "idle" as const, coverage: 0 }
          : d
      )
    );
    toast({
      title: "Drone Recalled",
      description: `${droneId} is returning to base.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "charging":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-7xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Aerial Search Operations
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real-time drone deployment and satellite imagery analysis for enhanced search coverage
            </p>
          </div>

          <Tabs defaultValue="drones" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="drones" className="flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Drone Operations
              </TabsTrigger>
              <TabsTrigger value="satellite" className="flex items-center gap-2">
                <Satellite className="w-4 h-4" />
                Satellite Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drones" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="w-5 h-5" />
                    Live Drone Coverage Map
                  </CardTitle>
                  <CardDescription>
                    Active drones are shown with their current search radius
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <MapPin className="w-12 h-12 mx-auto text-primary/40" />
                        <p className="text-sm text-muted-foreground">Live drone tracking map</p>
                        <p className="text-xs text-muted-foreground">
                          {drones.filter(d => d.status === 'active').length} active drones
                        </p>
                      </div>
                    </div>
                    {/* Simulated drone markers */}
                    {drones.map((drone, idx) => (
                      <div
                        key={drone.id}
                        className={`absolute w-3 h-3 rounded-full ${
                          drone.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`}
                        style={{
                          left: `${20 + idx * 30}%`,
                          top: `${30 + idx * 20}%`,
                        }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                          {drone.name}
                        </div>
                        {drone.status === 'active' && (
                          <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                {drones.map((drone) => (
                  <Card key={drone.id} className="border-2 hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            <Plane className="w-5 h-5" />
                            {drone.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {drone.location.lat.toFixed(4)}, {drone.location.lng.toFixed(4)}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(drone.status)} text-white border-none`}
                        >
                          {drone.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Battery className="w-4 h-4 text-muted-foreground" />
                          <span>Battery: {drone.battery}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{formatTime(drone.lastUpdate)}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="text-sm text-muted-foreground mb-2">
                          Coverage Area: {drone.coverage} km²
                        </div>
                        <div className="flex gap-2">
                          {drone.status === "idle" ? (
                            <Button
                              onClick={() => deployDrone(drone.id)}
                              className="flex-1"
                              size="sm"
                            >
                              Deploy
                            </Button>
                          ) : (
                            <Button
                              onClick={() => recallDrone(drone.id)}
                              variant="outline"
                              className="flex-1"
                              size="sm"
                            >
                              Recall
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="satellite" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Satellite className="w-5 h-5" />
                    Satellite Imagery Analysis
                  </CardTitle>
                  <CardDescription>
                    Access to satellite data for comprehensive area surveillance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {satellites.map((sat) => (
                      <div
                        key={sat.id}
                        className="border rounded-lg p-4 space-y-3 hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{sat.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Coverage: {sat.coverage}
                            </p>
                          </div>
                          <Badge variant="outline">Resolution: {sat.resolution}</Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Last Pass:</span>
                            <p className="font-medium">{formatTime(sat.lastPass)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Pass:</span>
                            <p className="font-medium">
                              {new Date(sat.nextPass).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full" size="sm">
                          Request Imagery
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">How Satellite Data Helps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Wide area coverage for large-scale searches</p>
                  <p>• Historical imagery to track movement patterns</p>
                  <p>• Thermal imaging for night operations</p>
                  <p>• Change detection to identify new activities</p>
                  <p>• Weather-independent monitoring capabilities</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DroneMap;
