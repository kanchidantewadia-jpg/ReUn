import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertCircle, MapPin, Loader2 } from "lucide-react";
import { reportSchema, validateFile } from "@/lib/validationSchemas";
import { geocodeAddress } from "@/lib/geocoding";

const Report = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("");
  const [geocodedLocation, setGeocodedLocation] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to report a missing person.",
          variant: "destructive",
        });
        navigate("/auth");
      } else {
        setIsLoading(false);
      }
    });
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const location = e.target.value.trim();
    if (location.length > 3) {
      setIsGeocoding(true);
      setGeocodedLocation(null);
      const result = await geocodeAddress(location);
      if (result) {
        setGeocodedLocation(`📍 ${result.displayName}`);
      }
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Capture form data immediately before any async operations
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report.",
          variant: "destructive",
        });
        return;
      }
      const lastLocation = formData.get('lastLocation') as string;
      
      // Geocode the address
      let latitude: number | null = null;
      let longitude: number | null = null;
      
      const geoResult = await geocodeAddress(lastLocation);
      if (geoResult) {
        latitude = geoResult.latitude;
        longitude = geoResult.longitude;
      }

      const formObject = {
        full_name: formData.get('fullName') as string,
        age: formData.get('age') ? parseInt(formData.get('age') as string) : undefined,
        gender: gender || undefined,
        height: formData.get('height') as string || undefined,
        weight: formData.get('weight') as string || undefined,
        last_seen_location: lastLocation,
        last_seen_date: formData.get('lastSeen') as string,
        clothing_description: formData.get('clothing') as string || undefined,
        distinguishing_features: formData.get('distinguishing') as string || undefined,
        additional_info: formData.get('circumstances') as string || undefined,
        contact_name: formData.get('reporterName') as string,
        contact_phone: formData.get('phone') as string,
        contact_email: formData.get('email') as string || undefined,
      };

      const validationResult = reportSchema.safeParse(formObject);
      
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }
      
      if (photoFile) {
        try {
          validateFile(photoFile, 10 * 1024 * 1024, ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);
        } catch (error: any) {
          toast({
            title: "Invalid File",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }

      let photoUrl = null;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('missing-persons-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;
        photoUrl = fileName;
      }

      const { data: reportData, error: insertError } = await supabase
        .from('missing_persons')
        .insert({
          user_id: user.id,
          full_name: validationResult.data.full_name,
          age: validationResult.data.age || null,
          gender: validationResult.data.gender || null,
          height: validationResult.data.height || null,
          weight: validationResult.data.weight || null,
          last_seen_location: validationResult.data.last_seen_location,
          last_seen_date: validationResult.data.last_seen_date,
          clothing_description: validationResult.data.clothing_description || null,
          distinguishing_features: validationResult.data.distinguishing_features || null,
          additional_info: validationResult.data.additional_info || null,
          contact_name: validationResult.data.contact_name,
          contact_phone: validationResult.data.contact_phone,
          contact_email: validationResult.data.contact_email || null,
          photo_url: photoUrl,
          visibility: 'public',
          is_minor: formData.get('isMinor') === 'on',
          emergency_contact_name: formData.get('emergencyName') as string || null,
          emergency_contact_phone: formData.get('emergencyPhone') as string || null,
          emergency_contact_relation: formData.get('emergencyRelation') as string || null,
          latitude,
          longitude,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (reportData && validationResult.data.contact_email) {
        try {
          await supabase.functions.invoke("send-report-confirmation", {
            body: {
              reporterName: validationResult.data.contact_name,
              reporterEmail: validationResult.data.contact_email,
              missingPersonName: validationResult.data.full_name,
              reportId: reportData.id,
            },
          });
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }

      toast({
        title: "Report Submitted",
        description: latitude && longitude 
          ? "Your report has been submitted and will appear on the map."
          : "Your report has been submitted successfully.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Report a Missing Person</h1>
            <p className="text-muted-foreground">
              Provide details to help locate your loved one
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Missing Person Information</CardTitle>
              <CardDescription>Fields marked with * are required</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Photo Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" />
                    Photo
                  </Label>
                  <Input 
                    id="photo" 
                    name="photo" 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="cursor-pointer"
                  />
                  {photoPreview && (
                    <div className="w-full h-48 rounded-lg overflow-hidden border bg-muted">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    Personal Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" name="fullName" placeholder="Enter full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" name="age" type="number" placeholder="Age" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height</Label>
                      <Input id="height" name="height" placeholder="e.g., 5'8&quot; or 173cm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input id="weight" name="weight" placeholder="e.g., 150 lbs or 68 kg" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isMinor"
                      name="isMinor"
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="isMinor" className="text-sm font-normal cursor-pointer">
                      This person is under 18 years old
                    </Label>
                  </div>
                </div>

                {/* Last Known Location */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Last Known Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastLocation">Last Known Location *</Label>
                    <div className="relative">
                      <Input 
                        id="lastLocation" 
                        name="lastLocation" 
                        placeholder="City, area, or address" 
                        required 
                        onBlur={handleLocationBlur}
                      />
                      {isGeocoding && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    {geocodedLocation && (
                      <p className="text-xs text-green-600">{geocodedLocation}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Location will be automatically mapped for search visibility
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastSeen">Last Seen Date *</Label>
                    <Input id="lastSeen" name="lastSeen" type="date" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clothing">Clothing Description</Label>
                    <Textarea 
                      id="clothing"
                      name="clothing"
                      placeholder="What they were wearing when last seen"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Additional Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="distinguishing">Distinguishing Features</Label>
                    <Textarea 
                      id="distinguishing"
                      name="distinguishing"
                      placeholder="Scars, tattoos, birthmarks..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="circumstances">Circumstances *</Label>
                    <Textarea 
                      id="circumstances"
                      name="circumstances"
                      placeholder="Describe the circumstances of disappearance"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Your Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reporterName">Your Name *</Label>
                      <Input id="reporterName" name="reporterName" placeholder="Your full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+1234567890" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="your@email.com" required />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-base font-medium">Emergency Contact (Optional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Name</Label>
                      <Input id="emergencyName" name="emergencyName" placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Phone</Label>
                      <Input id="emergencyPhone" name="emergencyPhone" type="tel" placeholder="Phone number" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation">Relationship</Label>
                    <Input id="emergencyRelation" name="emergencyRelation" placeholder="e.g., Mother, Friend" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Report;
