import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('th-TH')}</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you create an account, 
              make a purchase, or communicate with us. This includes:
            </p>
            <ul>
              <li>Name and email address</li>
              <li>Phone number</li>
              <li>Payment information</li>
              <li>Product listings and preferences</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process your transactions and manage your orders</li>
              <li>Communicate with you about products and services</li>
              <li>Improve our platform and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul>
              <li>Service providers who help us operate our platform</li>
              <li>Payment processors to complete transactions</li>
              <li>Law enforcement when required by law</li>
            </ul>

            <h2>4. Social Login</h2>
            <p>
              When you sign in using Google or Facebook, we receive your basic profile information 
              including your name and email address. We use this information solely for authentication 
              and account management purposes.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from 
              unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our 
              contact form or email.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
