import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Report = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Report submitted successfully",
        description: "We've received your report and will begin the search process.",
      });
    }, 1500);
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
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Personal Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" placeholder="Enter full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input id="age" type="number" placeholder="Age" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input id="height" type="number" placeholder="Height in cm" />
                    </div>
                  </div>
                </div>

                {/* Last Known Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Last Known Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastLocation">Last Known Location *</Label>
                    <Input id="lastLocation" placeholder="City, area, or landmark" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastSeen">Last Seen Date & Time *</Label>
                    <Input id="lastSeen" type="datetime-local" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clothing">Clothing Description</Label>
                    <Textarea 
                      id="clothing" 
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
                      placeholder="Scars, tattoos, birthmarks, or other identifying features"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="circumstances">Circumstances of Disappearance *</Label>
                    <Textarea 
                      id="circumstances" 
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
                      <Input id="reporterName" placeholder="Your full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship *</Label>
                      <Input id="relationship" placeholder="Your relationship to person" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" placeholder="Your phone number" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="Your email" required />
                    </div>
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
