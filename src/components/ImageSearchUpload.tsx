import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignedImage } from './SignedImage';

interface MatchedPerson {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  last_seen_location: string;
  last_seen_date: string;
  status: string;
  photo_url: string | null;
  match_confidence: number;
  match_reason: string;
}

interface ImageSearchUploadProps {
  onMatchFound?: (matches: MatchedPerson[]) => void;
}

const ImageSearchUpload = ({ onMatchFound }: ImageSearchUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<MatchedPerson[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [searchProgress, setSearchProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setMatches([]);
      setAnalysis('');
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    if (!selectedImage) return;

    setIsSearching(true);
    setSearchProgress(0);
    setMatches([]);
    setAnalysis('');

    // Simulate progress
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('search-by-image', {
        body: { imageBase64: selectedImage }
      });

      clearInterval(progressInterval);
      setSearchProgress(100);

      if (error) {
        console.error('Search error:', error);
        toast.error('Failed to search by image. Please try again.');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setMatches(data.matches || []);
      setAnalysis(data.analysis || '');
      
      if (data.matches?.length > 0) {
        toast.success(`Found ${data.matches.length} potential match(es)!`);
        onMatchFound?.(data.matches);
      } else {
        toast.info(`No matches found. Compared against ${data.total_compared || 0} records.`);
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('An error occurred during search');
    } finally {
      clearInterval(progressInterval);
      setIsSearching(false);
      setSearchProgress(0);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setMatches([]);
    setAnalysis('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Search by Image
        </CardTitle>
        <CardDescription>
          Upload a photo to find potential matches using AI face recognition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        {!selectedImage ? (
          <div 
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Click to upload an image</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              JPG, PNG up to 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="w-full max-h-64 object-contain rounded-lg border"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={clearImage}
                disabled={isSearching}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isSearching && (
              <div className="space-y-2">
                <Progress value={searchProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Analyzing image and comparing with database...
                </p>
              </div>
            )}

            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Search for Matches
                </>
              )}
            </Button>
          </div>
        )}

        {/* Analysis Result */}
        {analysis && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">
              <strong>AI Analysis:</strong> {analysis}
            </p>
          </div>
        )}

        {/* Match Results */}
        {matches.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              Potential Matches Found
            </h4>
            {matches.map((match) => (
              <Link key={match.id} to={`/person/${match.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {match.photo_url ? (
                          <SignedImage
                            bucket="missing-persons-photos"
                            path={match.photo_url}
                            alt={match.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xl font-bold">
                            {match.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">{match.full_name}</h5>
                          <Badge className={getConfidenceColor(match.match_confidence)}>
                            {Math.round(match.match_confidence * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {match.age && `Age: ${match.age}`}
                          {match.gender && ` • ${match.gender}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last seen: {match.last_seen_location}
                        </p>
                        {match.match_reason && (
                          <p className="text-xs text-primary/80 italic">
                            {match.match_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageSearchUpload;
