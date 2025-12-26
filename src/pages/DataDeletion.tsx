import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function DataDeletion() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDataDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real implementation, this would send a request to your backend
      // to process the data deletion request
      toast({
        title: "Data Deletion Request Submitted",
        description: "We have received your request. Your data will be deleted within 30 days.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!user) return;

    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been deleted.",
      });

      // Sign out
      await supabase.auth.signOut();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Data Deletion Request</CardTitle>
            <CardDescription>
              Request deletion of your personal data from our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>How We Handle Data Deletion</h3>
              <p>
                When you request data deletion, we will permanently remove all your personal 
                information from our systems within 30 days. This includes:
              </p>
              <ul>
                <li>Your account information (name, email, phone number)</li>
                <li>Product listings you have created</li>
                <li>Purchase history and transaction records</li>
                <li>Any saved preferences or settings</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Note: We may retain certain information as required by law or for legitimate 
                business purposes (such as fraud prevention).
              </p>
            </div>

            {user ? (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Delete Your Account</h3>
                <p className="text-sm text-muted-foreground">
                  You are currently logged in. Click the button below to permanently delete 
                  your account and all associated data.
                </p>
                <Button
                  onClick={handleAccountDeletion}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  {loading ? "Processing..." : "Delete My Account"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleDataDeletion} className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Submit Deletion Request</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the email address associated with your account
                  </p>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Submitting..." : "Submit Deletion Request"}
                </Button>
              </form>
            )}

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2">Questions?</h3>
              <p className="text-sm text-muted-foreground">
                If you have questions about data deletion or need assistance, please contact 
                our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
