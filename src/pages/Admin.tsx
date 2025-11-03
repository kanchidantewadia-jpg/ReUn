import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, FileText, Video, TrendingUp, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [cctvFootage, setCctvFootage] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    activeReports: 0,
    foundReports: 0,
    cctvUploads: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access the admin dashboard.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchAdminData();
    } catch (error: any) {
      console.error("Error checking admin access:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin access.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch all reports (not just public ones)
      const { data: reportsData, error: reportsError } = await supabase
        .from("missing_persons")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      // Fetch CCTV footage
      const { data: cctvData, error: cctvError } = await supabase
        .from("cctv_footage")
        .select(`
          *,
          missing_persons!cctv_footage_missing_person_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (cctvError) throw cctvError;
      setCctvFootage(cctvData || []);

      // Calculate stats
      const totalReports = reportsData?.length || 0;
      const activeReports = reportsData?.filter((r) => r.status === "missing").length || 0;
      const foundReports = reportsData?.filter((r) => r.status === "found").length || 0;
      const cctvUploads = cctvData?.length || 0;

      setStats({ totalReports, activeReports, foundReports, cctvUploads });
    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data.",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: "missing" | "found" | "closed") => {
    try {
      const { error } = await supabase
        .from("missing_persons")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;

      // Fetch the report details to send email update
      const report = reports.find((r) => r.id === reportId);
      if (report && report.contact_email) {
        await supabase.functions.invoke("send-email-update", {
          body: {
            email: report.contact_email,
            missingPersonName: report.full_name,
            updateMessage: `Status updated to: ${newStatus}`,
          },
        });
      }

      toast({
        title: "Status Updated",
        description: `Report status changed to ${newStatus}. SMS notification sent.`,
      });

      await fetchAdminData();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-24 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage missing person reports</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReports}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.activeReports}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Found</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.foundReports}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CCTV Footage</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cctvUploads}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="reports" className="space-y-4">
            <TabsList>
              <TabsTrigger value="reports">All Reports</TabsTrigger>
              <TabsTrigger value="cctv">CCTV Footage</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Missing Person Reports</CardTitle>
                  <CardDescription>View and manage all reports in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Filed Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            <Button
                              variant="link"
                              onClick={() => navigate(`/person/${report.id}`)}
                              className="p-0"
                            >
                              {report.full_name}
                            </Button>
                          </TableCell>
                          <TableCell>{report.age || "N/A"}</TableCell>
                          <TableCell>{report.last_seen_location}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                report.status === "missing"
                                  ? "bg-red-500"
                                  : report.status === "found"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{report.contact_name}</div>
                              <div className="text-muted-foreground">{report.contact_phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(report.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {report.status === "missing" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(report.id, "found")}
                                >
                                  Mark Found
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cctv" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>CCTV Footage Submissions</CardTitle>
                  <CardDescription>Review uploaded CCTV footage and face match results</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Related Person</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Match Confidence</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cctvFootage.map((footage) => (
                        <TableRow key={footage.id}>
                          <TableCell className="font-medium">
                            {footage.missing_persons?.full_name || "Unknown"}
                          </TableCell>
                          <TableCell>{footage.location || "Not specified"}</TableCell>
                          <TableCell>
                            {footage.face_match_confidence ? (
                              <Badge
                                className={
                                  footage.face_match_confidence > 70
                                    ? "bg-green-500"
                                    : footage.face_match_confidence > 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }
                              >
                                {footage.face_match_confidence.toFixed(1)}%
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not processed</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(footage.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(footage.footage_url, "_blank")}
                            >
                              View Footage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

export default Admin;
