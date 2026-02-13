import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScanFace, RefreshCw } from "lucide-react";
import { getSignedUrl } from "@/lib/storageHelpers";

interface FaceRecognitionResultsProps {
  personId: string;
  user: any;
}

export const FaceRecognitionResults = ({ personId, user }: FaceRecognitionResultsProps) => {
  const { toast } = useToast();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchResults();
  }, [user, personId]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("cctv_footage")
        .select("*")
        .eq("missing_person_id", personId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Generate signed URLs for footage
      const resultsWithUrls = await Promise.all(
        (data || []).map(async (item) => {
          const signedUrl = await getSignedUrl("cctv-footage", item.footage_url);
          return { ...item, signed_url: signedUrl };
        })
      );

      setResults(resultsWithUrls);
    } catch (error) {
      console.error("Error fetching face recognition results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReprocess = async (footageId: string, footageUrl: string) => {
    setProcessingId(footageId);
    try {
      const signedUrl = await getSignedUrl("cctv-footage", footageUrl, 3600);
      if (!signedUrl) throw new Error("Failed to generate signed URL");

      const { error } = await supabase.functions.invoke("process-face-recognition", {
        body: {
          cctvFootageId: footageId,
          cctvImageUrl: signedUrl,
          missingPersonId: personId,
        },
      });

      if (error) throw error;

      toast({
        title: "Reprocessing Started",
        description: "Face recognition is being reprocessed. Results will update shortly.",
      });

      // Refresh after a delay
      setTimeout(fetchResults, 3000);
    } catch (error: any) {
      console.error("Reprocess error:", error);
      toast({
        title: "Error",
        description: "Failed to reprocess footage.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (!user || isLoading) return null;
  if (results.length === 0) return null;

  const getConfidenceBadge = (confidence: number | null) => {
    if (confidence === null) return <Badge variant="outline">Pending</Badge>;
    if (confidence >= 70)
      return <Badge className="bg-green-500 text-white">{confidence.toFixed(1)}% Match</Badge>;
    if (confidence >= 40)
      return <Badge className="bg-yellow-500 text-white">{confidence.toFixed(1)}% Possible</Badge>;
    return <Badge variant="secondary">{confidence.toFixed(1)}% Low</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanFace className="w-5 h-5" />
          Face Recognition Results
        </CardTitle>
        <CardDescription>
          AI-powered face comparison results from uploaded CCTV footage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getConfidenceBadge(result.face_match_confidence)}
                  {result.matched_person_id && (
                    <Badge variant="destructive">Match Found</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.location ? `📍 ${result.location}` : "Location not specified"}
                </p>
                {result.description && (
                  <p className="text-xs text-muted-foreground">{result.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Uploaded {new Date(result.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {result.signed_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(result.signed_url, "_blank")}
                  >
                    View
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={processingId === result.id}
                  onClick={() => handleReprocess(result.id, result.footage_url)}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${processingId === result.id ? "animate-spin" : ""}`} />
                  {processingId === result.id ? "..." : "Rerun"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
