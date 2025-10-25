import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, User, Phone, Mail, Upload, Video } from "lucide-react";
import { messageSchema, cctvUploadSchema, validateFile } from "@/lib/validationSchemas";
import DOMPurify from 'dompurify';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [person, setPerson] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cctvFile, setCctvFile] = useState<File | null>(null);
  const [cctvLocation, setCctvLocation] = useState("");
  const [cctvDescription, setCctvDescription] = useState("");
  const [isUploadingCctv, setIsUploadingCctv] = useState(false);

  useEffect(() => {
    fetchPersonDetails();
    checkUser();
    setupRealtimeSubscription();
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPersonDetails = async () => {
    try {
      const { data: personData, error: personError } = await supabase
        .from('public_missing_persons')
        .select('*')
        .eq('id', id)
        .single();

      if (personError) throw personError;
      setPerson(personData);

      // Fetch messages with display names using RPC function
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, message, created_at, sender_id')
        .eq('missing_person_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      
      // Fetch display names for each message
      if (messagesData) {
        const messagesWithNames = await Promise.all(
          messagesData.map(async (msg) => {
            const { data: displayName } = await supabase.rpc('get_display_name', {
              user_uuid: msg.sender_id
            });
            return {
              ...msg,
              sender_name: displayName || 'Anonymous User'
            };
          })
        );
        setMessages(messagesWithNames);
      }
    } catch (error) {
      console.error('Error fetching person details:', error);
      toast({
        title: "Error",
        description: "Failed to load person details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `missing_person_id=eq.${id}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          // Fetch display name for new message
          const { data: displayName } = await supabase.rpc('get_display_name', {
            user_uuid: newMessage.sender_id
          });
          setMessages((current) => [
            ...current,
            { ...newMessage, sender_name: displayName || 'Anonymous User' }
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check user authentication first
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send messages.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    if (!newMessage.trim()) return;

    try {
      // Validate message (no sender_name needed)
      const validationResult = messageSchema.safeParse({
        message: newMessage,
      });

      if (!validationResult.success) {
        toast({
          title: "Validation Error",
          description: validationResult.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          missing_person_id: id,
          sender_id: user.id,
          message: validationResult.data.message,
        });

      if (error) {
        console.error('Error sending message:', error);
        
        // Check for auth-specific errors
        if (error.code === 'PGRST301' || error.message.includes('row-level security')) {
          toast({
            title: "Authentication Required",
            description: "Your session may have expired. Please sign in again.",
            variant: "destructive",
          });
          navigate('/auth');
        } else {
          toast({
            title: "Error",
            description: "Failed to send message. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const handleCctvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check user authentication first
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload footage.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    if (!cctvFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingCctv(true);
    try {
      // Validate CCTV file
      try {
        validateFile(cctvFile, 100 * 1024 * 1024, ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']);
      } catch (error: any) {
        toast({
          title: "Invalid File",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Validate form data
      const validationResult = cctvUploadSchema.safeParse({
        location: cctvLocation || undefined,
        description: cctvDescription || undefined,
      });

      if (!validationResult.success) {
        toast({
          title: "Validation Error",
          description: validationResult.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      const fileExt = cctvFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('cctv-footage')
        .upload(fileName, cctvFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cctv-footage')
        .getPublicUrl(fileName);

      const { data: cctvData, error: insertError } = await supabase
        .from('cctv_footage')
        .insert({
          missing_person_id: id,
          uploaded_by: user.id,
          footage_url: publicUrl,
          location: validationResult.data.location || null,
          description: validationResult.data.description || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error saving footage metadata:', insertError);
        
        // Check for auth-specific errors
        if (insertError.code === 'PGRST301' || insertError.message.includes('row-level security')) {
          toast({
            title: "Authentication Required",
            description: "Your session may have expired. Please sign in again.",
            variant: "destructive",
          });
          navigate('/auth');
        } else {
          toast({
            title: "Error",
            description: "Failed to save footage metadata. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Process face recognition
      if (cctvData) {
        try {
          await supabase.functions.invoke("process-face-recognition", {
            body: {
              cctvFootageId: cctvData.id,
              cctvImageUrl: publicUrl,
              missingPersonId: id,
            },
          });
        } catch (faceError) {
          console.error("Face recognition processing error:", faceError);
          // Don't block the upload if face recognition fails
        }
      }

      toast({
        title: "Success",
        description: "CCTV footage uploaded successfully. Processing for face matches...",
      });

      setCctvFile(null);
      setCctvLocation("");
      setCctvDescription("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload CCTV footage.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingCctv(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Person Not Found</h1>
            <Button onClick={() => navigate('/search')}>Back to Search</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Button variant="outline" onClick={() => navigate('/search')}>
            ← Back to Search
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl">{person.full_name}</CardTitle>
                      <CardDescription className="text-lg mt-2">
                        {person.age && `Age: ${person.age}`}
                        {person.gender && ` • ${person.gender}`}
                      </CardDescription>
                    </div>
                    <Badge className={person.status === 'missing' ? 'bg-red-500' : 'bg-green-500'}>
                      {person.status}
                    </Badge>
                  </div>
                </CardHeader>
                {person.photo_url && (
                  <div className="px-6">
                    <img
                      src={person.photo_url}
                      alt={person.full_name}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                )}
                <CardContent className="space-y-4 mt-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span><strong>Last Seen:</strong> {person.last_seen_location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span><strong>Date:</strong> {new Date(person.last_seen_date).toLocaleDateString()}</span>
                  </div>
                  {person.height && (
                    <p><strong>Height:</strong> {person.height}</p>
                  )}
                  {person.weight && (
                    <p><strong>Weight:</strong> {person.weight}</p>
                  )}
                  {person.clothing_description && (
                    <p><strong>Clothing:</strong> {person.clothing_description}</p>
                  )}
                  {person.distinguishing_features && (
                    <p><strong>Distinguishing Features:</strong> {person.distinguishing_features}</p>
                  )}
                  {person.additional_info && (
                    <p><strong>Additional Info:</strong> {person.additional_info}</p>
                  )}
                </CardContent>
              </Card>

              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Upload CCTV Footage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCctvUpload} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cctvFile">Video File *</Label>
                        <Input
                          id="cctvFile"
                          type="file"
                          accept="video/*"
                          onChange={(e) => setCctvFile(e.target.files?.[0] || null)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cctvLocation">Location *</Label>
                        <Input
                          id="cctvLocation"
                          value={cctvLocation}
                          onChange={(e) => setCctvLocation(e.target.value)}
                          placeholder="Where was this recorded?"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cctvDescription">Description</Label>
                        <Textarea
                          id="cctvDescription"
                          value={cctvDescription}
                          onChange={(e) => setCctvDescription(e.target.value)}
                          placeholder="Any additional details about the footage..."
                        />
                      </div>
                      <Button type="submit" disabled={isUploadingCctv}>
                        {isUploadingCctv ? 'Uploading...' : 'Upload Footage'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{person.contact_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${person.contact_phone}`} className="hover:underline">
                          {person.contact_phone}
                        </a>
                      </div>
                      {person.contact_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a href={`mailto:${person.contact_email}`} className="hover:underline">
                            {person.contact_email}
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-secondary/50 rounded-lg text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Contact information is only visible to registered users.
                      </p>
                      <Button size="sm" onClick={() => navigate('/auth')}>
                        Sign in to view contact details
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Messages & Updates</CardTitle>
                  <CardDescription>
                    Community discussion about this case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {messages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No messages yet. Be the first to share information.
                        </p>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className="bg-secondary/50 rounded-lg p-3">
                            <p className="font-semibold text-sm">{msg.sender_name}</p>
                            <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                              {DOMPurify.sanitize(msg.message, { ALLOWED_TAGS: [] })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {user ? (
                      <form onSubmit={handleSendMessage} className="space-y-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Share any information you have..."
                          rows={3}
                        />
                        <Button type="submit" className="w-full">
                          Send Message
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Sign in to send messages
                        </p>
                        <Button onClick={() => navigate('/auth')}>
                          Sign In
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonDetail;
