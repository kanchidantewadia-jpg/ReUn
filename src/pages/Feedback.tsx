import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { feedbackSchema } from "@/lib/validationSchemas";

const Feedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const formObject = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      type: formData.get('type') as string,
      rating: rating,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      suggestions: (formData.get('suggestions') as string) || undefined,
    };

    // Validate form data
    const validationResult = feedbackSchema.safeParse(formObject);
    
    if (!validationResult.success) {
      toast({
        title: "Validation Error",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Feedback submitted",
        description: "Thank you for helping us improve ReUn!",
      });
      setRating(0);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <Star className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">We Value Your Feedback</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us improve our services and better serve families in need
            </p>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>Share Your Experience</CardTitle>
                  <CardDescription>
                    Your feedback helps us create a better experience for everyone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" name="name" placeholder="Your name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                      </div>
                    </div>

                    {/* Feedback Type */}
                    <div className="space-y-2">
                      <Label htmlFor="type">Feedback Type *</Label>
                      <Select name="type" required>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select feedback type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="suggestion">Suggestion</SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="compliment">Compliment</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                      <Label>Overall Experience Rating *</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= rating
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rating === 0 && "Click to rate your experience"}
                        {rating === 1 && "Poor - We can do better"}
                        {rating === 2 && "Fair - Needs improvement"}
                        {rating === 3 && "Good - Meets expectations"}
                        {rating === 4 && "Very Good - Exceeded expectations"}
                        {rating === 5 && "Excellent - Outstanding service"}
                      </p>
                    </div>

                    {/* Feedback Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input id="subject" name="subject" placeholder="Brief summary of your feedback" required />
                    </div>

                    {/* Detailed Feedback */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Detailed Feedback *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Please provide detailed feedback. The more information you share, the better we can assist you."
                        rows={6}
                        required
                      />
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-2">
                      <Label htmlFor="suggestions">Suggestions for Improvement (Optional)</Label>
                      <Textarea
                        id="suggestions"
                        name="suggestions"
                        placeholder="How can we make ReUn better?"
                        rows={4}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg" 
                        disabled={isSubmitting || rating === 0}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                      </Button>
                      <p className="text-sm text-center text-muted-foreground mt-4">
                        We review all feedback and respond to inquiries within 48 hours
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Additional Contact Info */}
              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Prefer to reach out directly?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="mailto:feedback@reun.com" className="text-primary hover:underline">
                    feedback@reun.com
                  </a>
                  <span className="hidden sm:inline text-muted-foreground">|</span>
                  <a href="tel:+15551234567" className="text-primary hover:underline">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Feedback;
