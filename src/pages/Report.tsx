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
import { Upload, AlertCircle } from "lucide-react";
import { reportSchema, validateFile } from "@/lib/validationSchemas";

const Report = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
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
      <div className="min-h-screen flex items-center justify-center">
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

      const formData = new FormData(e.currentTarget);
      
      // Validate form data
      const formObject = {
        full_name: formData.get('fullName') as string,
        age: formData.get('age') ? parseInt(formData.get('age') as string) : undefined,
        gender: gender || undefined,
        height: formData.get('height') as string || undefined,
        weight: formData.get('weight') as string || undefined,
        last_seen_location: formData.get('lastLocation') as string,
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
      
      // Validate photo if provided
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

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('missing-persons-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;
        
        // Store the file path instead of public URL (buckets are now private)
        photoUrl = fileName;
      }

      // Insert report into database with validated data and default public visibility
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
          visibility: 'public', // Default to public for community awareness
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send confirmation email
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
          // Don't block the submission if email fails
        }
      }

      toast({
        title: "Report Submitted",
        description: "Your report has been successfully submitted. Check your email for confirmation.",
      });
      
      navigate('/search');
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 py-24 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Report a Missing Person</h1>
            <p className="text-xl text-muted-foreground">
              Provide as much information as possible to help us locate your loved one
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Missing Person Information</CardTitle>
              <CardDescription>All fields are important for the search process</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Photo of Missing Person
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="photo">Upload Photo *</Label>
                    <Input 
                      id="photo" 
                      name="photo" 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="cursor-pointer"
                    />
                    {photoPreview && (
                      <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border">
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
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
                      <Input id="height" name="height" placeholder="e.g., 5 feet 8 inches or 173cm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input id="weight" name="weight" placeholder="e.g., 150 lbs or 68 kg" />
                  </div>
                </div>

                {/* Last Known Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Last Known Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastLocation">Last Known Location *</Label>
                    <Input id="lastLocation" name="lastLocation" placeholder="City, area, or landmark" required />
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
                      placeholder="Describe what they were wearing when last seen"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="distinguishing">Distinguishing Features</Label>
                    <Textarea 
                      id="distinguishing"
                      name="distinguishing"
                      placeholder="Scars, tattoos, birthmarks, or other identifying features"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="circumstances">Circumstances of Disappearance *</Label>
                    <Textarea 
                      id="circumstances"
                      name="circumstances"
                      placeholder="Describe the circumstances surrounding their disappearance"
                      rows={4}
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reporterName">Your Name *</Label>
                      <Input id="reporterName" name="reporterName" placeholder="Your full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="Your phone number" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="Your email" required />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting Report..." : "Submit Report"}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    Your report will be processed immediately and shared with our network
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Report;
