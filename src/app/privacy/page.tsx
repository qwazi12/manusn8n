import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-card text-card-foreground border container mx-auto my-8 p-8 shadow-lg rounded-lg">
      <div className="flex flex-col space-y-1.5 p-6 pb-0">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Privacy Policy</h1>
      </div>

      <div className="p-6">
        <div>
          <p>Our Privacy Policy was last updated on <strong>27/03/2025</strong>.</p>

          <p>At <strong>NodePilot</strong>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by <strong>NodePilot</strong> and how we use it.</p>

          <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:nodepilotdev@gmail.com" className="text-primary hover:underline">nodepilotdev@gmail.com</a>.</p>

          <p>This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collected on <a href="https://nodepilot.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://nodepilot.com</a>. This policy is not applicable to any information collected offline or via channels other than this website.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Consent</strong></h2>

          <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Information We Collect</strong></h2>

          <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>

          <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>

          <p>When you register for an account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</p>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>How We Use Your Information</strong></h2>

          <p>We use the information we collect in various ways, including to:</p>

          <ul className="list-disc pl-6 my-4 space-y-1">
            <li>Provide, operate, and maintain our website.</li>
            <li>Improve, personalize, and expand our website.</li>
            <li>Understand and analyze how you use our website.</li>
            <li>Develop new products, services, features, and functionality.</li>
            <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
            <li>Send you emails.</li>
            <li>Find and prevent fraud.</li>
          </ul>

          <h2 className="text-xl font-bold mt-6 mb-2"><strong>Log Files</strong></h2>

          <p><strong>NodePilot</strong> follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics.</p>

          <p>The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>

          {/* More sections would go here */}

          <p className="mt-6">
            <strong>Note:</strong> This is a simplified version of the privacy policy. For the complete version, please visit the actual website.
          </p>
        </div>
      </div>
    </div>
  );
}
