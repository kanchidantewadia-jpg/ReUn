import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <CardDescription>Last updated: January 2025</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none dark:prose-invert">
              <h2>1. Introduction</h2>
              <p>
                ReUn ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>

              <h2>2. Information We Collect</h2>
              
              <h3>2.1 Information You Provide</h3>
              <p>When you use ReUn, you may provide us with:</p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, phone number, display name</li>
                <li><strong>Missing Person Reports:</strong> Name, age, physical description, last known location, photographs, contact information</li>
                <li><strong>Emergency Contacts:</strong> Names, phone numbers, and relationships of emergency contacts</li>
                <li><strong>Sighting Reports:</strong> Location, description, timestamps, photographs</li>
                <li><strong>Messages:</strong> Communication between users regarding cases</li>
                <li><strong>CCTV Footage:</strong> Video or image files uploaded for analysis</li>
              </ul>

              <h3>2.2 Automatically Collected Information</h3>
              <ul>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                <li><strong>Location Data:</strong> When you report sightings or use location-based features</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies to maintain sessions and improve user experience</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul>
                <li>Operate and maintain the ReUn platform</li>
                <li>Process and verify missing person reports</li>
                <li>Facilitate community collaboration in locating missing persons</li>
                <li>Enable face recognition matching (with your consent)</li>
                <li>Coordinate with law enforcement when necessary</li>
                <li>Send important notifications and updates</li>
                <li>Improve our services and develop new features</li>
                <li>Prevent fraud, abuse, and illegal activities</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>4. Information Sharing and Disclosure</h2>
              
              <h3>4.1 Public Information</h3>
              <p>
                Missing person reports are <strong>publicly visible</strong> to help maximize search efforts. This includes:
              </p>
              <ul>
                <li>Missing person's name, age, physical description</li>
                <li>Last known location and date</li>
                <li>Photographs (if provided)</li>
                <li>Public community sightings</li>
              </ul>

              <h3>4.2 Contact Information Protection</h3>
              <p>
                Your contact information (phone number, email) is <strong>NOT publicly visible</strong>. We restrict access to:
              </p>
              <ul>
                <li>The original reporter (you)</li>
                <li>Platform administrators and moderators</li>
                <li>Law enforcement officials (when legally required)</li>
              </ul>
              <p>
                <strong>Note:</strong> Authenticated users who sign in can view contact information to facilitate legitimate search efforts. If you have privacy concerns, consider using alternative contact methods or our internal messaging system.
              </p>

              <h3>4.3 Third-Party Sharing</h3>
              <p>We may share information with:</p>
              <ul>
                <li><strong>Law Enforcement:</strong> When legally required or when we believe disclosure is necessary to protect safety</li>
                <li><strong>Service Providers:</strong> Companies that help us operate the platform (cloud hosting, email services, face recognition APIs)</li>
                <li><strong>Legal Requirements:</strong> To comply with court orders, subpoenas, or legal processes</li>
              </ul>
              <p>
                We do <strong>NOT</strong> sell your personal information to third parties.
              </p>

              <h2>5. Face Recognition and Biometric Data</h2>
              <p>
                Our platform uses face recognition technology to help identify missing persons in uploaded CCTV footage and community sightings.
              </p>

              <h3>5.1 How It Works</h3>
              <ul>
                <li>Photos you upload are processed by AI algorithms to create facial templates</li>
                <li>These templates are compared against CCTV footage and sighting reports</li>
                <li>Matches are probabilistic and require human verification</li>
                <li>No facial data is used for any purpose other than finding missing persons</li>
              </ul>

              <h3>5.2 Your Biometric Rights</h3>
              <ul>
                <li>You have the right to know how biometric data is used</li>
                <li>You can request deletion of facial templates at any time</li>
                <li>We comply with state biometric privacy laws (BIPA, CCPA, etc.)</li>
                <li>We retain biometric data only as long as the case is active</li>
              </ul>

              <h2>6. Children's Privacy</h2>
              <p>
                When a missing person report involves a minor (under 18), we take extra precautions:
              </p>
              <ul>
                <li>Additional verification is required from the reporter</li>
                <li>We may require proof of relationship or guardianship</li>
                <li>Cases involving minors may be automatically shared with law enforcement</li>
                <li>Special handling procedures apply under COPPA and similar laws</li>
              </ul>

              <h2>7. Data Security</h2>
              <p>
                We implement industry-standard security measures including:
              </p>
              <ul>
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Secure authentication with JWT tokens</li>
                <li>Row-level security on database tables</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and role-based permissions</li>
              </ul>
              <p>
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>

              <h2>8. Data Retention</h2>
              <ul>
                <li><strong>Active Cases:</strong> Data retained as long as the case is open</li>
                <li><strong>Resolved Cases:</strong> Archived for 7 years for statistical and legal purposes</li>
                <li><strong>Account Data:</strong> Retained until account deletion is requested</li>
                <li><strong>CCTV Footage:</strong> Retained for 90 days unless matched to a case</li>
                <li><strong>Biometric Data:</strong> Deleted within 30 days of case resolution (unless legally required to retain)</li>
              </ul>

              <h2>9. Your Rights and Choices</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p>
                To exercise these rights, contact us at privacy@reun.com
              </p>

              <h2>10. California Privacy Rights (CCPA)</h2>
              <p>
                California residents have additional rights under the California Consumer Privacy Act:
              </p>
              <ul>
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of sale (we don't sell your data)</li>
                <li>Right to deletion</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>

              <h2>11. European Privacy Rights (GDPR)</h2>
              <p>
                If you are in the European Economic Area (EEA), you have rights under GDPR including:
              </p>
              <ul>
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>

              <h2>12. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers.
              </p>

              <h2>13. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul>
                <li>Posting the new policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending an email notification (for significant changes)</li>
              </ul>

              <h2>14. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices:
              </p>
              <ul>
                <li><strong>Email:</strong> privacy@reun.com</li>
                <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                <li><strong>Address:</strong> 123 Reunion Street, Hope City</li>
                <li><strong>Data Protection Officer:</strong> dpo@reun.com</li>
              </ul>

              <h2>15. Consent</h2>
              <p>
                By using ReUn, you consent to the collection and use of information in accordance with this Privacy Policy. For sensitive processing (like biometric data), we obtain explicit consent before processing.
              </p>

              <p className="text-sm text-muted-foreground mt-8">
                This privacy policy is designed to help you understand how we protect your information while operating a platform dedicated to reuniting families.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;