import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

const Help = () => {
  const faqs = [
    {
      question: "How does ReUn locate people without GPS?",
      answer: "ReUn uses a combination of community-reported information, verified databases, public records, and collaborative networks. We collect details about last known locations, frequently visited places, and cross-reference this with reports from our trusted community partners to help locate individuals."
    },
    {
      question: "Is my information kept confidential?",
      answer: "Yes, absolutely. We take privacy very seriously. All personal information is encrypted and stored securely. We only share necessary details with verified partners and community members who are actively assisting in the search. You control what information is shared."
    },
    {
      question: "How long does the search process take?",
      answer: "The timeline varies depending on the amount of available information and circumstances. Some cases are resolved within days, while others may take weeks or months. We provide regular updates throughout the process and work tirelessly to reunite families as quickly as possible."
    },
    {
      question: "What information do I need to report a missing person?",
      answer: "The more information you provide, the better. Essential details include full name, age, physical description, last known location, date and time last seen, and circumstances of disappearance. Photos, clothing description, and distinguishing features are also very helpful."
    },
    {
      question: "Is there a cost for using ReUn?",
      answer: "Basic search services are free for all users. We believe that families shouldn't face financial barriers when searching for loved ones. Premium features and expedited services are available for those who need additional support, but our core mission is to help everyone."
    },
    {
      question: "Can I help in the search for others?",
      answer: "Yes! Our community volunteers are crucial to our success. You can sign up to be part of our network and help share information, provide local insights, or assist with verification efforts. Every contribution makes a difference."
    },
    {
      question: "What makes ReUn different from police reports?",
      answer: "ReUn works alongside, not in replacement of, official police reports. We encourage filing police reports for all missing persons. ReUn provides an additional layer of community support and uses our specialized network to supplement official investigations."
    },
    {
      question: "How do I update information on an existing report?",
      answer: "Log into your account, navigate to your active reports, and use the 'Update Information' button. You can add new details, photos, or change contact information at any time. Updates are immediately distributed to our network."
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      detail: "+1 (555) 123-4567",
      description: "Available 24/7 for urgent cases"
    },
    {
      icon: Mail,
      title: "Email Support",
      detail: "support@reun.com",
      description: "Response within 24 hours"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      detail: "Available on website",
      description: "Instant support during business hours"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <FileQuestion className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Center</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions and get the support you need
            </p>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
              
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact Methods Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-xl text-muted-foreground">
                Our support team is here for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {contactMethods.map((method, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-xl transition-shadow">
                  <method.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                  <p className="text-primary font-medium mb-2">{method.detail}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/feedback">
                <Button size="lg">Send Us Feedback</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Emergency Section */}
        <section className="py-16 bg-destructive/10 border-y border-destructive/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4 text-destructive">Emergency Situations</h3>
              <p className="text-lg mb-6">
                If you believe someone is in immediate danger, please contact emergency services first:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="destructive" size="lg">
                  Call 911 (Emergency)
                </Button>
                <Button variant="outline" size="lg">
                  Local Police Department
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Help;
