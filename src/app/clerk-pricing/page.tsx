import { PricingTable } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ClerkPricingPage() {
  const { userId } = await auth();
  
  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Choose Your Plan</h1>
            <a 
              href="/dashboard" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </a>
          </div>
          <p className="text-muted-foreground mt-2">
            Select the perfect plan for your n8n workflow automation needs
          </p>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <PricingTable />
        </div>
      </div>

      {/* Additional Information */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">What's Included</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">🤖 AI-Powered Workflow Generation</h4>
                <p className="text-sm text-muted-foreground">
                  Generate complete n8n workflows using advanced AI with access to comprehensive documentation
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔗 4000+ Integrations</h4>
                <p className="text-sm text-muted-foreground">
                  Connect with Gmail, Slack, Airtable, and thousands of other services
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">📚 Expert Guidance</h4>
                <p className="text-sm text-muted-foreground">
                  Get help with complex automations, troubleshooting, and best practices
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚡ Instant Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export generated workflows directly to your n8n instance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
