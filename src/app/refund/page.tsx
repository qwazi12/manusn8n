export default function RefundPolicyPage() {
  return (
    <div className="bg-card text-card-foreground border container mx-auto my-8 p-8 shadow-lg rounded-lg">
      <div className="flex flex-col space-y-1.5 p-6 pb-0">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Refund Policy</h1>
      </div>

      <div className="p-6">
        <div>
          <p>Last updated: <strong>27/03/2025</strong></p>

          <p className="mt-4">
            Thank you for choosing n8nCraft. We value your satisfaction and want to ensure
            you have a positive experience with our services. This Refund Policy outlines our
            guidelines regarding refunds for our subscription plans.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Subscription Refunds</h2>

          <p>
            <strong>Monthly Subscriptions:</strong> For monthly subscriptions, we offer a 7-day money-back guarantee.
            If you are not satisfied with our service within the first 7 days of your initial subscription,
            you may request a full refund. After the initial 7-day period, monthly subscriptions are non-refundable.
          </p>

          <p className="mt-4">
            <strong>Annual Subscriptions:</strong> For annual subscriptions, we offer a 14-day money-back guarantee.
            If you are not satisfied with our service within the first 14 days of your initial subscription,
            you may request a full refund. After the initial 14-day period, annual subscriptions are eligible
            for a prorated refund based on the unused portion of your subscription.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">How to Request a Refund</h2>

          <p>
            To request a refund, please contact our support team at <strong>manalkaff@gmail.com</strong> with
            the following information:
          </p>

          <ul className="list-disc pl-6 my-4 space-y-1">
            <li>Your account email address</li>
            <li>Date of purchase</li>
            <li>Subscription type (Monthly or Annual)</li>
            <li>Reason for the refund request</li>
          </ul>

          <p>
            We aim to process all refund requests within 5-7 business days. Refunds will be issued to the
            original payment method used for the purchase.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Exceptions</h2>

          <p>We reserve the right to deny refund requests in the following cases:</p>

          <ul className="list-disc pl-6 my-4 space-y-1">
            <li>If the refund request is made after the specified refund period</li>
            <li>If we detect any fraudulent activity or abuse of our refund policy</li>
            <li>If the account has violated our Terms of Service</li>
            <li>If the account has consumed a significant portion of the allocated resources or credits</li>
          </ul>

          <h2 className="text-xl font-bold mt-6 mb-2">Changes to This Policy</h2>

          <p>
            We reserve the right to modify this refund policy at any time. Changes will be effective
            immediately upon posting to our website. It is your responsibility to review this policy
            periodically to stay informed about our refund terms.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">Contact Us</h2>

          <p>
            If you have any questions about our Refund Policy, please contact us at <strong>manalkaff@gmail.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
