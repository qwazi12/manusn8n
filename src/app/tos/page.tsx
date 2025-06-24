export default function TermsOfServicePage() {
  return (
    <div className="bg-card text-card-foreground border container mx-auto my-8 p-8 shadow-lg rounded-lg">
      <div className="flex flex-col space-y-1.5 p-6 pb-0">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Terms of Service</h1>
      </div>

      <div className="p-6">
        <div>
          <p>Last updated: <strong>June 22, 2025</strong></p>

          <p className="mt-4">
            Please read these Terms of Service carefully before using NodePilot. By accessing or using our service, you agree to be bound by these terms.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">About NodePilot</h2>

          <p>
            NodePilot is an AI-powered service that generates n8n workflow automation scripts. We convert your natural language descriptions into ready-to-use n8n workflow JSON files using advanced artificial intelligence.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Service Description</h2>

          <p>
            <strong>Workflow Generation:</strong> NodePilot generates n8n workflow JSON files based on your text descriptions. These workflows are designed to be imported directly into your n8n instance.
          </p>

          <p className="mt-4">
            <strong>AI-Powered:</strong> Our service uses multiple AI models including OpenAI and Claude (Anthropic) to understand your requirements and generate appropriate workflows.
          </p>

          <p className="mt-4">
            <strong>Credit System:</strong> NodePilot operates on a credit-based system. Each workflow generation consumes credits from your account balance.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Account Terms</h2>

          <p>
            <strong>Registration:</strong> You must provide accurate and complete information when creating your account.
          </p>

          <p className="mt-4">
            <strong>Account Security:</strong> You are responsible for maintaining the security of your account credentials.
          </p>

          <p className="mt-4">
            <strong>Age Requirement:</strong> You must be at least 18 years old to use NodePilot.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Credit System and Billing</h2>

          <p>
            <strong>Credit Purchase:</strong> You purchase credits to generate workflows. Credits are consumed when you successfully generate a workflow.
          </p>

          <p className="mt-4">
            <strong>Credit Expiration:</strong> Credits do not expire unless your account is inactive for more than 12 months.
          </p>

          <p className="mt-4">
            <strong>Billing:</strong> All credit purchases are final and non-refundable.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Usage Policies</h2>

          <p>
            <strong>Acceptable Use:</strong> You may use NodePilot only for legitimate automation purposes. You may not use our service for illegal activities or to generate harmful content.
          </p>

          <p className="mt-4">
            <strong>Generated Content:</strong> You own the n8n workflows we generate for you. However, you are responsible for ensuring they meet your specific requirements and testing them before use in production.
          </p>

          <p className="mt-4">
            <strong>Service Limitations:</strong> NodePilot generates workflows based on AI interpretation of your descriptions. We do not guarantee that generated workflows will meet all your specific requirements or work perfectly in all environments.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">AI-Generated Content Disclaimers</h2>

          <p>
            <strong>No Warranty:</strong> Generated workflows are provided "as is" without warranty. You should review and test all generated workflows before using them in production.
          </p>

          <p className="mt-4">
            <strong>Accuracy:</strong> While we strive for accuracy, AI-generated content may contain errors or may not perfectly match your requirements.
          </p>

          <p className="mt-4">
            <strong>Responsibility:</strong> You are responsible for reviewing, testing, and validating all generated workflows before implementation.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Intellectual Property</h2>

          <p>
            <strong>Your Content:</strong> You retain ownership of the descriptions and requirements you provide to NodePilot.
          </p>

          <p className="mt-4">
            <strong>Generated Workflows:</strong> You own the n8n workflows we generate for you, subject to these terms.
          </p>

          <p className="mt-4">
            <strong>NodePilot Service:</strong> NodePilot's underlying technology, algorithms, and service remain our intellectual property.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Service Availability</h2>

          <p>
            <strong>Uptime:</strong> We strive to maintain high service availability but do not guarantee 100% uptime.
          </p>

          <p className="mt-4">
            <strong>Maintenance:</strong> We may perform scheduled maintenance that temporarily affects service availability.
          </p>

          <p className="mt-4">
            <strong>Modifications:</strong> We reserve the right to modify or discontinue features with reasonable notice.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Limitation of Liability</h2>

          <p>
            NodePilot is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of generated workflows or our service.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Termination</h2>

          <p>
            <strong>By You:</strong> You may terminate your account at any time. Unused credits are forfeited upon account termination.
          </p>

          <p className="mt-4">
            <strong>By Us:</strong> We may terminate accounts that violate these terms or engage in fraudulent activity.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Governing Law</h2>

          <p>
            These terms are governed by the laws of the jurisdiction where NodePilot operates.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Contact Information</h2>

          <p>
            For questions about these Terms of Service, contact us at <a href="mailto:nodepilotdev@gmail.com" className="text-primary hover:underline">nodepilotdev@gmail.com</a>.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Changes to Terms</h2>

          <p>
            We may update these terms from time to time. Continued use of NodePilot after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
}
