import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Heart, Users, Shield, Target } from "lucide-react";
import aboutImage from "@/assets/about-team.jpg";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We understand the emotional journey of searching for loved ones and provide support every step of the way.",
    },
    {
      icon: Shield,
      title: "Privacy & Safety",
      description: "Your information is protected with industry-leading security measures and strict confidentiality protocols.",
    },
    {
      icon: Users,
      title: "Community",
      description: "Our strength lies in our community of volunteers and partners who help reunite families.",
    },
    {
      icon: Target,
      title: "Accuracy",
      description: "We use verified information and multiple sources to ensure accurate and reliable results.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-10" />
          <img 
            src={aboutImage} 
            alt="Our team" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                About ReUn
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Dedicated to reconnecting families through innovation, compassion, and community collaboration
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                ReUn was founded with a simple but powerful mission: to help families find their loved ones 
                without invasive GPS tracking or expensive private investigators. We believe that by combining 
                technology with community support and verified information networks, we can make the process 
                of finding missing persons more accessible, affordable, and effective.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every day, thousands of people go missing, and families are left searching with limited resources. 
                Our platform bridges this gap by creating a trusted network where information can be shared safely 
                and efficiently, maximizing the chances of successful reunions.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {values.map((value, index) => (
                <Card key={index} className="p-8 hover:shadow-xl transition-shadow">
                  <value.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">How We Work</h2>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Report Submission</h3>
                    <p className="text-muted-foreground">
                      Families submit detailed information about their missing loved ones through our secure platform.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Information Verification</h3>
                    <p className="text-muted-foreground">
                      Our team verifies and cross-references information with trusted sources and community partners.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Network Distribution</h3>
                    <p className="text-muted-foreground">
                      Information is shared across our trusted network of volunteers, organizations, and community members.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Continuous Updates</h3>
                    <p className="text-muted-foreground">
                      Families receive regular updates as new information becomes available, maintaining hope throughout the process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary-glow">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
              <div>
                <div className="text-5xl font-bold mb-2">10,000+</div>
                <div className="text-xl text-white/90">Successful Reunions</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">50+</div>
                <div className="text-xl text-white/90">Partner Organizations</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">24/7</div>
                <div className="text-xl text-white/90">Support Available</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
