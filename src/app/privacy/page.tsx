import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-card text-card-foreground border container mx-auto my-8 p-8 shadow-lg rounded-lg">
      <div className="flex flex-col space-y-1.5 p-6 pb-0">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Privacy Policy</h1>
      </div>

      <div className="p-6">
        <div>
          <p>Last updated: <strong>June 22, 2025</strong></p>

          <p className="mt-4">At NodePilot, we are committed to protecting your privacy and ensuring transparency about how we collect, use, and protect your information. This Privacy Policy explains our practices regarding the information we collect when you use our n8n workflow generation service.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>What NodePilot Does</strong></h2>

          <p>NodePilot is an AI-powered service that generates n8n workflow automation scripts. We use artificial intelligence to convert your natural language descriptions into ready-to-use n8n workflow JSON files.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Information We Collect</strong></h2>

          <p><strong>Account Information:</strong> When you create an account, we collect your email address, name, and any other information you provide during registration.</p>

          <p className="mt-4"><strong>Workflow Generation Data:</strong> We collect and process the text descriptions you provide to generate n8n workflows. This includes your automation requirements, desired integrations, and any specific instructions you provide.</p>

          <p className="mt-4"><strong>Generated Content:</strong> We store the n8n workflow JSON files we generate for you, along with explanations and documentation we provide.</p>

          <p className="mt-4"><strong>Credit Usage Data:</strong> We track your credit consumption, including when credits are used, for which workflow generations, and your remaining credit balance.</p>

          <p className="mt-4"><strong>Technical Data:</strong> We collect IP addresses, browser information, device information, and usage analytics to improve our service and ensure security.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>How We Use Your Information</strong></h2>

          <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>

          <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>

          <p>When you register for an account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>How We Use Your Information</strong></h2>

          <p><strong>Workflow Generation:</strong> We use your input descriptions to generate n8n workflows using AI models including OpenAI and Claude (Anthropic) services.</p>

          <p className="mt-4"><strong>Service Improvement:</strong> We analyze usage patterns to improve our AI models and service quality.</p>

          <p className="mt-4"><strong>Account Management:</strong> We use your information to manage your account, process payments, and provide customer support.</p>

          <p className="mt-4"><strong>Communication:</strong> We may send you service-related emails, updates about your account, and important notices about our service.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Third-Party AI Services</strong></h2>

          <p>NodePilot uses third-party AI services to generate workflows:</p>

          <p className="mt-4"><strong>OpenAI:</strong> We use OpenAI's models for conversation handling and intent classification. Your data may be processed by OpenAI according to their privacy policy.</p>

          <p className="mt-4"><strong>Anthropic (Claude):</strong> We use Claude models for n8n workflow generation. Your workflow descriptions may be processed by Anthropic according to their privacy policy.</p>

          <p className="mt-4"><strong>Data Sharing:</strong> We only share your workflow descriptions with these AI services for the purpose of generating your requested workflows. We do not share your personal information beyond what is necessary for service operation.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Data Retention</strong></h2>

          <p><strong>Account Data:</strong> We retain your account information as long as your account is active.</p>

          <p className="mt-4"><strong>Workflow Data:</strong> We retain your generated workflows and descriptions to provide ongoing service and support.</p>

          <p className="mt-4"><strong>Credit History:</strong> We maintain records of credit usage for billing and account management purposes.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Your Rights</strong></h2>

          <p><strong>Access:</strong> You can access your account information and generated workflows through your dashboard.</p>

          <p className="mt-4"><strong>Deletion:</strong> You can request deletion of your account and associated data by contacting us.</p>

          <p className="mt-4"><strong>Correction:</strong> You can update your account information at any time through your account settings.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Security</strong></h2>

          <p>We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Contact Us</strong></h2>

          <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:nodepilotdev@gmail.com" className="text-primary hover:underline">nodepilotdev@gmail.com</a>.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Changes to This Policy</strong></h2>

          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website.</p>
        </div>
      </div>
    </div>
  );
}
