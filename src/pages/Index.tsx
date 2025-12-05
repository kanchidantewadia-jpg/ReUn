import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Search, MapPin, Shield, Heart, ArrowRight, Users } from "lucide-react";
import heroImage from "@/assets/hero-reunion.jpg";

const Index = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Connect information across our network to find people quickly.",
    },
    {
      icon: MapPin,
      title: "Map-Based Discovery",
      description: "Visualize cases geographically and search by area.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays protected with enterprise-grade security.",
    },
    {
      icon: Heart,
      title: "Community Powered",
      description: "A caring community helping reunite families every day.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      {/* Hero Section - Full viewport, dramatic */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="People reuniting" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in-up">
              <Users className="w-4 h-4" />
              Trusted by thousands of families
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Reunite with
              <span className="block text-primary">your loved ones</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              A community-driven platform that helps families find missing persons safely, efficiently, and with complete privacy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/report">
                <Button size="lg" className="h-14 px-8 text-lg gap-2 w-full sm:w-auto">
                  Report Missing Person
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/search">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                  Search Database
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-8 right-8 hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-border/50">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">2,500+</p>
                <p className="text-sm text-muted-foreground">Reunions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">98%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Help</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Simple yet powerful tools designed to reunite families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal and impactful */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Every moment matters
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Start your search today and join thousands who have reunited with their loved ones.
          </p>
          <Link to="/auth">
            <Button variant="secondary" size="lg" className="h-14 px-8 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
