export default function TermsOfServicePage() {
  return (
    <div className="bg-card text-card-foreground border container mx-auto my-8 p-8 shadow-lg rounded-lg">
      <div className="flex flex-col space-y-1.5 p-6 pb-0">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Terms of Service</h1>
      </div>

      <div className="p-6">
        <div>
          <p>Last updated: <strong>27/03/2025</strong></p>

          <p className="mt-4">
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the
            https://nodepilot.com website operated by NodePilot.
          </p>

          <p className="mt-4">
            Your access to and use of the Service is conditioned on your acceptance of and compliance with
            these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
          </p>

          <p className="mt-4">
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree
            with any part of the terms, then you may not access the Service.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Accounts</h2>

          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times.
            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>

          <p className="mt-4">
            You are responsible for safeguarding the password that you use to access the Service and for any activities
            or actions under your password, whether your password is with our Service or a third-party service.
          </p>

          <p className="mt-4">
            You agree not to disclose your password to any third party. You must notify us immediately upon
            becoming aware of any breach of security or unauthorized use of your account.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Content</h2>

          <p>
            Our Service allows you to post, link, store, share, and otherwise make available certain information,
            text, graphics, videos, or other material ("Content"). You are responsible for the Content that you
            post on or through the Service, including its legality, reliability, and appropriateness.
          </p>

          <p className="mt-4">
            By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours
            (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms,
            and (ii) the posting of your Content on or through the Service does not violate the privacy rights,
            publicity rights, copyrights, contract rights or any other rights of any person.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Service Usage</h2>

          <p>
            You may not use the NodePilot service for any illegal or unauthorized purpose nor may you, in the
            use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).
          </p>

          <p className="mt-4">
            You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service,
            use of the Service, or access to the Service without express written permission from us.
          </p>

          {/* More sections would go here */}

          <p className="mt-6">
            <strong>Note:</strong> This is a simplified version of the terms of service. For the complete version,
            please visit the actual website.
          </p>
        </div>
      </div>
    </div>
  );
}
