import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SignedImage } from "@/components/SignedImage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, MapPin, Calendar, Info, Filter, ChevronDown, X, Loader2, List, Map, Eye, Navigation as NavIcon, Locate } from "lucide-react";
import { dummyMissingPersons } from "@/data/dummyMissingPersons";
import SearchResultsMap from "@/components/SearchResultsMap";
import ImageSearchUpload from "@/components/ImageSearchUpload";
import { toast } from "sonner";

interface MissingPerson {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  last_seen_location: string;
  last_seen_date: string;
  status: string;
  photo_url: string | null;
  height?: string | null;
  weight?: string | null;
  clothing_description?: string | null;
  distinguishing_features?: string | null;
  additional_info?: string | null;
  relevance?: number;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number | null;
  isDemo?: boolean;
}

interface SearchFilters {
  status: string;
  minAge: string;
  maxAge: string;
  dateFrom: string;
  dateTo: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchMode, setSearchMode] = useState<"text" | "image" | "nearby">("text");
  const [filters, setFilters] = useState<SearchFilters>({
    status: "",
    minAge: "",
    maxAge: "",
    dateFrom: "",
    dateTo: "",
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Geolocation state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50); // km
  const [locationError, setLocationError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.minAge || filters.maxAge) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    setActiveFilterCount(count);
  }, [filters]);

  // Search when query or filters change
  useEffect(() => {
    if (searchMode === "text") {
      searchMissingPersons();
    }
  }, [debouncedQuery, filters, searchMode]);

  // Search nearby when location changes
  useEffect(() => {
    if (searchMode === "nearby" && userLocation) {
      searchNearby();
    }
  }, [userLocation, searchRadius, filters.status, searchMode]);

  const searchMissingPersons = async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_missing_persons', {
        search_text: debouncedQuery || null,
        status_filter: filters.status || null,
        min_age: filters.minAge ? parseInt(filters.minAge) : null,
        max_age: filters.maxAge ? parseInt(filters.maxAge) : null,
        date_from: filters.dateFrom || null,
        date_to: filters.dateTo || null,
      });

      if (error) {
        console.error('Search error:', error);
        const demoPersons = filterDemoData(dummyMissingPersons);
        setMissingPersons(demoPersons.map(p => ({ ...p, isDemo: true })));
      } else {
        const realPersons: MissingPerson[] = (data || []).map((p: any) => ({ ...p, isDemo: false }));
        const demoPersons = filterDemoData(dummyMissingPersons).map(p => ({ ...p, isDemo: true }));
        setMissingPersons([...realPersons, ...demoPersons]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      const demoPersons = filterDemoData(dummyMissingPersons);
      setMissingPersons(demoPersons.map(p => ({ ...p, isDemo: true })));
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const searchNearby = async () => {
    if (!userLocation) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_missing_persons_nearby', {
        user_lat: userLocation.latitude,
        user_lng: userLocation.longitude,
        radius_km: searchRadius,
        status_filter: filters.status || null,
      });

      if (error) {
        console.error('Nearby search error:', error);
        toast.error('Failed to search nearby. Try again.');
        setMissingPersons([]);
      } else {
        const persons: MissingPerson[] = (data || []).map((p: any) => ({ 
          ...p, 
          isDemo: false,
          distance_km: p.distance_km 
        }));
        setMissingPersons(persons);
        
        if (persons.length === 0) {
          toast.info(`No missing persons found within ${searchRadius}km of your location.`);
        } else {
          toast.success(`Found ${persons.length} missing person(s) within ${searchRadius}km.`);
        }
      }
    } catch (error) {
      console.error('Error searching nearby:', error);
      toast.error('Failed to search nearby.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
        toast.success('Location found! Searching nearby...');
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const filterDemoData = (data: typeof dummyMissingPersons) => {
    return data.filter(person => {
      if (debouncedQuery) {
        const query = debouncedQuery.toLowerCase();
        const matchesText = 
          person.full_name.toLowerCase().includes(query) ||
          person.last_seen_location.toLowerCase().includes(query);
        if (!matchesText) return false;
      }
      if (filters.status && person.status !== filters.status) return false;
      if (filters.minAge && person.age < parseInt(filters.minAge)) return false;
      if (filters.maxAge && person.age > parseInt(filters.maxAge)) return false;
      if (filters.dateFrom && new Date(person.last_seen_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(person.last_seen_date) > new Date(filters.dateTo)) return false;
      return true;
    });
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      minAge: "",
      maxAge: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const handleReportSighting = (personId: string) => {
    navigate(`/person/${personId}#report-sighting`);
    toast.info("Scroll down to report a sighting");
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

  const formatDistance = (distance: number | null | undefined) => {
    if (distance === null || distance === undefined) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Search Missing Persons
            </h1>
            <p className="text-muted-foreground">
              Search by name, location, photo, or find missing persons near you
            </p>
          </div>

          {/* Search Mode Tabs */}
          <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as "text" | "image" | "nearby")} className="max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <SearchIcon className="w-4 h-4" />
                Text Search
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Image Search
              </TabsTrigger>
              <TabsTrigger value="nearby" className="flex items-center gap-2">
                <Locate className="w-4 h-4" />
                Near Me
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, location, description, clothing, features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-12 text-lg"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Advanced Filters */}
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Advanced Filters</span>
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFilterCount} active
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="missing">Missing</SelectItem>
                              <SelectItem value="found">Found</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Age Range</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filters.minAge}
                              onChange={(e) => setFilters(f => ({ ...f, minAge: e.target.value }))}
                              className="w-full"
                              min="0"
                              max="120"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filters.maxAge}
                              onChange={(e) => setFilters(f => ({ ...f, maxAge: e.target.value }))}
                              className="w-full"
                              min="0"
                              max="120"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Last Seen From</label>
                          <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Last Seen To</label>
                          <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                          />
                        </div>
                      </div>
                      {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                          <X className="h-4 w-4 mr-2" />
                          Clear all filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              <div className="text-center text-sm text-muted-foreground">
                <p>💡 Tip: Search handles typos! Try "scar on face", "blue jacket", or partial names.</p>
              </div>
            </TabsContent>

            <TabsContent value="image">
              <ImageSearchUpload 
                onMatchFound={(matches) => {
                  setViewMode("list");
                }}
              />
            </TabsContent>

            <TabsContent value="nearby" className="space-y-4">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <NavIcon className="w-5 h-5 text-primary" />
                    Find Missing Persons Near You
                  </CardTitle>
                  <CardDescription>
                    Use your current location to find missing persons reported nearby
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location Button */}
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      onClick={getUserLocation}
                      disabled={isLocating}
                      size="lg"
                      className="w-full max-w-xs"
                    >
                      {isLocating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Getting location...
                        </>
                      ) : (
                        <>
                          <Locate className="w-5 h-5 mr-2" />
                          {userLocation ? 'Update My Location' : 'Use My Location'}
                        </>
                      )}
                    </Button>

                    {userLocation && (
                      <p className="text-sm text-muted-foreground text-center">
                        📍 Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                      </p>
                    )}

                    {locationError && (
                      <p className="text-sm text-destructive text-center">{locationError}</p>
                    )}
                  </div>

                  {/* Radius Slider */}
                  {userLocation && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Search Radius</label>
                        <span className="text-sm font-semibold text-primary">{searchRadius} km</span>
                      </div>
                      <Slider
                        value={[searchRadius]}
                        onValueChange={([value]) => setSearchRadius(value)}
                        min={5}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 km</span>
                        <span>100 km</span>
                        <span>200 km</span>
                      </div>
                    </div>
                  )}

                  {/* Status Filter for Nearby */}
                  {userLocation && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Filter by Status</label>
                      <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="missing">Missing</SelectItem>
                          <SelectItem value="found">Found</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Results Section */}
          {(searchMode === "text" || searchMode === "nearby") && (
            <>
              {isLoading || (searchMode === "nearby" && !userLocation) ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    {searchMode === "nearby" && !userLocation ? (
                      <>
                        <Locate className="w-12 h-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Enable location to search nearby</p>
                      </>
                    ) : (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Searching missing persons database...</p>
                      </>
                    )}
                  </div>
                </div>
              ) : missingPersons.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <SearchIcon className="w-12 h-12 text-muted-foreground/50" />
                    <div>
                      <p className="text-lg font-medium">No results found</p>
                      <p className="text-muted-foreground">
                        {searchMode === "nearby" 
                          ? `No missing persons found within ${searchRadius}km of your location`
                          : debouncedQuery.trim() 
                            ? `No missing persons found matching "${debouncedQuery}"`
                            : "No missing persons reports match your filters"}
                      </p>
                      {activeFilterCount > 0 && (
                        <Button variant="link" onClick={clearFilters} className="mt-2">
                          Clear filters and try again
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Results Header with View Toggle */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <p className="text-sm text-muted-foreground">
                      Found {missingPersons.length} {missingPersons.length === 1 ? 'result' : 'results'}
                      {searchMode === "nearby" && ` within ${searchRadius}km`}
                      {debouncedQuery && ` for "${debouncedQuery}"`}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">View:</span>
                      <div className="flex border rounded-lg overflow-hidden">
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          className="rounded-none"
                          onClick={() => setViewMode("list")}
                        >
                          <List className="w-4 h-4 mr-1" />
                          List
                        </Button>
                        <Button
                          variant={viewMode === "map" ? "default" : "ghost"}
                          size="sm"
                          className="rounded-none"
                          onClick={() => setViewMode("map")}
                        >
                          <Map className="w-4 h-4 mr-1" />
                          Map
                        </Button>
                      </div>
                    </div>
                  </div>

                  {missingPersons.some(p => p.isDemo) && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Demo data shown for demonstration purposes. Report real missing persons to add to the database.
                      </p>
                    </div>
                  )}
                  
                  {/* Map View */}
                  {viewMode === "map" && (
                    <SearchResultsMap 
                      persons={missingPersons} 
                      onReportSighting={handleReportSighting}
                    />
                  )}

                  {/* List View */}
                  {viewMode === "list" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {missingPersons.map((person) => (
                        <Card 
                          key={person.id} 
                          className={`hover:shadow-lg transition-shadow h-full ${person.isDemo ? 'border-dashed border-blue-300 dark:border-blue-700' : ''}`}
                        >
                          <Link to={person.isDemo ? "#" : `/person/${person.id}`}>
                            {person.photo_url && !person.isDemo ? (
                              <div className="w-full h-48 overflow-hidden rounded-t-lg">
                                <SignedImage
                                  bucket="missing-persons-photos"
                                  path={person.photo_url}
                                  alt={person.full_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                                <span className="text-4xl font-bold text-muted-foreground/30">
                                  {person.full_name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <CardHeader>
                              <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-lg">{person.full_name}</CardTitle>
                                <div className="flex gap-1 flex-shrink-0">
                                  {person.isDemo && (
                                    <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">
                                      Demo
                                    </Badge>
                                  )}
                                  <Badge className={getStatusColor(person.status)}>
                                    {person.status}
                                  </Badge>
                                </div>
                              </div>
                              <CardDescription>
                                {person.age && `Age: ${person.age}`}
                                {person.gender && ` • ${person.gender}`}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{person.last_seen_location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{new Date(person.last_seen_date).toLocaleDateString()}</span>
                              </div>
                              {person.distance_km !== null && person.distance_km !== undefined && (
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                  <NavIcon className="w-4 h-4 flex-shrink-0" />
                                  <span>{formatDistance(person.distance_km)}</span>
                                </div>
                              )}
                              {person.distinguishing_features && (
                                <p className="text-xs text-muted-foreground truncate">
                                  Features: {person.distinguishing_features}
                                </p>
                              )}
                            </CardContent>
                          </Link>
                          
                          {/* Report Sighting Button */}
                          {!person.isDemo && (
                            <div className="px-6 pb-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleReportSighting(person.id);
                                }}
                              >
                                <MapPin className="w-4 h-4 mr-2" />
                                Report Sighting
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
