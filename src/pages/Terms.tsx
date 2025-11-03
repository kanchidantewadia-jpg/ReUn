import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
              <CardDescription>Last updated: January 2025</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none dark:prose-invert">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using ReUn ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                ReUn is a platform designed to help families and communities locate missing persons through crowdsourced information sharing and technology-assisted search operations. Our services include:
              </p>
              <ul>
                <li>Missing person report submission and management</li>
                <li>Community sighting reporting</li>
                <li>Secure messaging between community members</li>
                <li>Integration with law enforcement (where applicable)</li>
              </ul>

              <h2>3. User Responsibilities</h2>
              <h3>3.1 Accurate Information</h3>
              <p>
                Users must provide accurate, current, and complete information when reporting missing persons. False reports or intentionally misleading information may result in account termination and legal action.
              </p>

              <h3>3.2 Proper Use</h3>
              <p>Users agree NOT to:</p>
              <ul>
                <li>Submit false or fraudulent reports</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use the service for stalking or malicious purposes</li>
                <li>Violate any local, state, national, or international law</li>
                <li>Collect or harvest personal information of other users</li>
              </ul>

              <h2>4. Report Verification</h2>
              <p>
                All reports submitted to ReUn undergo a verification process by our moderation team. We reserve the right to:
              </p>
              <ul>
                <li>Request additional documentation or proof of identity</li>
                <li>Reject reports that don't meet our verification standards</li>
                <li>Remove reports that violate our terms or policies</li>
                <li>Contact law enforcement when necessary</li>
              </ul>

              <h2>5. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
              </p>

              <h2>6. Age Verification for Minor Cases</h2>
              <p>
                Cases involving missing children (under 18) are subject to additional verification and may be prioritized. We may require:
              </p>
              <ul>
                <li>Proof of relationship to the missing child</li>
                <li>Police report number</li>
                <li>Additional contact information for emergency services</li>
              </ul>

              <h2>7. Content Ownership and Rights</h2>
              <h3>7.1 User Content</h3>
              <p>
                You retain ownership of content you submit (photos, descriptions, messages). However, by submitting content, you grant ReUn a worldwide, non-exclusive, royalty-free license to use, reproduce, and display that content for the purpose of operating the service.
              </p>

              <h3>7.2 Content Removal</h3>
              <p>
                Report owners may mark cases as "resolved" or request removal of their reports. Upon resolution, we may archive rather than delete reports for statistical and law enforcement purposes.
              </p>

              <h2>8. Technology-Assisted Features</h2>
              <h3>8.1 Face Recognition</h3>
              <p>
                Our platform may use automated face recognition technology to assist in matching CCTV footage with missing person reports. This technology:
              </p>
              <ul>
                <li>Is not 100% accurate and should not be solely relied upon</li>
                <li>Requires human verification before any action is taken</li>
                <li>Complies with applicable biometric privacy laws</li>
                <li>Only processes images submitted for missing persons cases</li>
              </ul>

              <h3>8.2 Aerial Search Operations</h3>
              <p>
                Drone and satellite imagery features are subject to:
              </p>
              <ul>
                <li>Availability in your geographic region</li>
                <li>Weather and technical conditions</li>
                <li>Regulatory approval and airspace restrictions</li>
                <li>Additional fees (where applicable)</li>
              </ul>

              <h2>9. Limitation of Liability</h2>
              <p>
                ReUn is a tool to assist in locating missing persons but is not a replacement for law enforcement. We:
              </p>
              <ul>
                <li>Make no guarantees about finding missing persons</li>
                <li>Are not responsible for user-submitted content</li>
                <li>Are not liable for damages resulting from use of the service</li>
                <li>Encourage all users to contact local authorities immediately when reporting a missing person</li>
              </ul>

              <h2>10. Emergency Services</h2>
              <p>
                <strong>IN CASE OF EMERGENCY, ALWAYS CONTACT LOCAL LAW ENFORCEMENT IMMEDIATELY.</strong> ReUn is a supplementary tool and should not delay contacting police, emergency services, or relevant authorities.
              </p>

              <h2>11. Account Termination</h2>
              <p>
                We reserve the right to terminate or suspend accounts that:
              </p>
              <ul>
                <li>Violate these terms</li>
                <li>Submit false reports</li>
                <li>Abuse or harass other users</li>
                <li>Use the service for illegal activities</li>
              </ul>

              <h2>12. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.
              </p>

              <h2>13. Governing Law</h2>
              <p>
                These terms are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>

              <h2>14. Contact Information</h2>
              <p>
                For questions about these terms, please contact us at:
              </p>
              <ul>
                <li>Email: legal@reun.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Reunion Street, Hope City</li>
              </ul>

              <p className="text-sm text-muted-foreground mt-8">
                By using ReUn, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;