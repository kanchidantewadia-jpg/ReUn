import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Search, Users, Heart, Shield, MapPin, Clock } from "lucide-react";
import heroImage from "@/assets/hero-reunion.jpg";

const Index = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Advanced search algorithms that connect information across our network to find people.",
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description: "Uses community-reported information and landmarks instead of GPS tracking.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is protected. We prioritize safety and confidentiality.",
    },
    {
      icon: Clock,
      title: "Quick Response",
      description: "Fast processing of reports with real-time updates on search progress.",
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "Powered by a caring community helping reunite families.",
    },
    {
      icon: Users,
      title: "Success Stories",
      description: "Thousands of successful reunions through our platform.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80 z-10" />
        <img 
          src={heroImage} 
          alt="People reuniting" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Reuniting People Through Information
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Search, locate, and reconnect with people without GPS tracking. 
              Our community-driven platform helps families find their loved ones safely and efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/report">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Report Missing Person
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Help</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines technology with human compassion to reunite families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-shadow">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-glow">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Search?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands who have successfully reunited with their loved ones
          </p>
          <Link to="/auth">
            <Button variant="secondary" size="lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
