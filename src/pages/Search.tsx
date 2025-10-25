import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, MapPin, Calendar } from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [missingPersons, setMissingPersons] = useState<any[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMissingPersons();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = missingPersons.filter((person) =>
        person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.last_seen_location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPersons(filtered);
    } else {
      setFilteredPersons(missingPersons);
    }
  }, [searchQuery, missingPersons]);

  const fetchMissingPersons = async () => {
    try {
      const { data, error } = await supabase
        .from('public_missing_persons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissingPersons(data || []);
      setFilteredPersons(data || []);
    } catch (error) {
      console.error('Error fetching missing persons:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Search Missing Persons
            </h1>
            <p className="text-muted-foreground">
              Search through reported missing persons by name or location
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : filteredPersons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No missing persons found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersons.map((person) => (
                <Link key={person.id} to={`/person/${person.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {person.photo_url && (
                      <div className="w-full h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={person.photo_url}
                          alt={person.full_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{person.full_name}</CardTitle>
                        <Badge className={getStatusColor(person.status)}>
                          {person.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {person.age && `Age: ${person.age}`}
                        {person.gender && ` • ${person.gender}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{person.last_seen_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(person.last_seen_date).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
