import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SignedImage } from "@/components/SignedImage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, MapPin, Calendar, Info, Filter, ChevronDown, X, Loader2 } from "lucide-react";
import { dummyMissingPersons } from "@/data/dummyMissingPersons";

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
  isDemo?: boolean;
}

interface SearchFilters {
  status: string;
  minAge: string;
  maxAge: string;
  dateFrom: string;
  dateTo: string;
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    status: "",
    minAge: "",
    maxAge: "",
    dateFrom: "",
    dateTo: "",
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);

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
    searchMissingPersons();
  }, [debouncedQuery, filters]);

  const searchMissingPersons = async () => {
    setIsSearching(true);
    try {
      // Call the database search function
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
        // Fallback to showing demo data on error
        const demoPersons = filterDemoData(dummyMissingPersons);
        setMissingPersons(demoPersons.map(p => ({ ...p, isDemo: true })));
      } else {
        // Combine real results with filtered demo data
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

  // Filter demo data based on current filters (client-side for demo data)
  const filterDemoData = (data: typeof dummyMissingPersons) => {
    return data.filter(person => {
      // Text search
      if (debouncedQuery) {
        const query = debouncedQuery.toLowerCase();
        const matchesText = 
          person.full_name.toLowerCase().includes(query) ||
          person.last_seen_location.toLowerCase().includes(query);
        if (!matchesText) return false;
      }
      
      // Status filter
      if (filters.status && person.status !== filters.status) return false;
      
      // Age filter
      if (filters.minAge && person.age < parseInt(filters.minAge)) return false;
      if (filters.maxAge && person.age > parseInt(filters.maxAge)) return false;
      
      // Date filter
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
              Search by name, location, physical description, or distinguishing features
            </p>
          </div>

          {/* Search Input */}
          <div className="relative max-w-2xl mx-auto">
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
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="max-w-2xl mx-auto">
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
                    {/* Status Filter */}
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

                    {/* Age Range */}
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

                    {/* Date From */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Seen From</label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                      />
                    </div>

                    {/* Date To */}
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

          {/* Search Tips */}
          <div className="max-w-2xl mx-auto text-center text-sm text-muted-foreground">
            <p>💡 Tip: Search handles typos! Try "scar on face", "blue jacket", or partial names.</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Searching missing persons database...</p>
              </div>
            </div>
          ) : missingPersons.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <SearchIcon className="w-12 h-12 text-muted-foreground/50" />
                <div>
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-muted-foreground">
                    {debouncedQuery.trim() 
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
              {/* Results count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {missingPersons.length} {missingPersons.length === 1 ? 'result' : 'results'}
                  {debouncedQuery && ` for "${debouncedQuery}"`}
                </p>
              </div>

              {missingPersons.some(p => p.isDemo) && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Demo data shown for demonstration purposes. Report real missing persons to add to the database.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missingPersons.map((person) => (
                  <Link key={person.id} to={person.isDemo ? "#" : `/person/${person.id}`}>
                    <Card className={`hover:shadow-lg transition-shadow cursor-pointer h-full ${person.isDemo ? 'border-dashed border-blue-300 dark:border-blue-700' : ''}`}>
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
                        {person.distinguishing_features && (
                          <p className="text-xs text-muted-foreground truncate">
                            Features: {person.distinguishing_features}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
