import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Plus,
  MapPin,
  Calendar
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Report {
  id: string;
  full_name: string;
  status: string;
  last_seen_location: string;
  last_seen_date: string;
  photo_url: string | null;
  created_at: string;
  is_resolved: boolean;
  is_minor: boolean;
}

interface MessageCount {
  missing_person_id: string;
  count: number;
}

const Dashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your dashboard.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    await fetchReports(session.user.id);
    setIsLoading(false);
  };

  const fetchReports = async (userId: string) => {
    const { data, error } = await supabase
      .from("missing_persons")
      .select("id, full_name, status, last_seen_location, last_seen_date, photo_url, created_at, is_resolved, is_minor")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your reports.",
        variant: "destructive",
      });
      return;
    }

    setReports(data || []);

    // Fetch message counts for each report
    if (data && data.length > 0) {
      const reportIds = data.map(r => r.id);
      const { data: messages } = await supabase
        .from("messages")
        .select("missing_person_id")
        .in("missing_person_id", reportIds);

      if (messages) {
        const counts: Record<string, number> = {};
        messages.forEach(m => {
          counts[m.missing_person_id] = (counts[m.missing_person_id] || 0) + 1;
        });
        setMessageCounts(counts);
      }
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedReport) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from("missing_persons")
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes,
        status: "found",
      })
      .eq("id", selectedReport.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update report status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Report Updated",
        description: "The case has been marked as resolved.",
      });
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, is_resolved: true, status: "found" } 
          : r
      ));
    }

    setSelectedReport(null);
    setResolutionNotes("");
    setIsUpdating(false);
  };

  const getStatusBadge = (report: Report) => {
    if (report.is_resolved || report.status === "found") {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Found</Badge>;
    }
    if (report.status === "closed") {
      return <Badge variant="secondary">Closed</Badge>;
    }
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Active</Badge>;
  };

  const getPhotoUrl = (photoPath: string | null) => {
    if (!photoPath) return null;
    const { data } = supabase.storage
      .from("missing-persons-photos")
      .getPublicUrl(photoPath);
    return data.publicUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeReports = reports.filter(r => !r.is_resolved && r.status !== "found");
  const resolvedReports = reports.filter(r => r.is_resolved || r.status === "found");
  const totalMessages = Object.values(messageCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your missing person reports</p>
            </div>
            <Link to="/report">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Report
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reports.length}</p>
                    <p className="text-xs text-muted-foreground">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeReports.length}</p>
                    <p className="text-xs text-muted-foreground">Active Cases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{resolvedReports.length}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalMessages}</p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          {reports.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't created any missing person reports yet.
                </p>
                <Link to="/report">
                  <Button>Create Your First Report</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Reports</h2>
              <div className="grid gap-4">
                {reports.map((report) => (
                  <Card key={report.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Photo */}
                        <div className="w-full md:w-24 h-32 md:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {report.photo_url ? (
                            <img
                              src={getPhotoUrl(report.photo_url) || ""}
                              alt={report.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{report.full_name}</h3>
                              {report.is_minor && (
                                <Badge variant="outline" className="text-xs border-red-500/30 text-red-600">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Minor
                                </Badge>
                              )}
                            </div>
                            {getStatusBadge(report)}
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {report.last_seen_location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(report.last_seen_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {messageCounts[report.id] || 0} messages
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/person/${report.id}`}>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Eye className="w-4 h-4" />
                                View Details
                              </Button>
                            </Link>
                            {!report.is_resolved && report.status !== "found" && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1 text-green-600 border-green-500/30 hover:bg-green-500/10"
                                onClick={() => setSelectedReport(report)}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Found
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Resolution Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Found</DialogTitle>
            <DialogDescription>
              Great news! Please provide any details about how {selectedReport?.full_name} was found.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Resolution Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Describe the circumstances of reunion..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>
            <Button onClick={handleMarkResolved} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Confirm Found"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
