"use client";

import { SubscriptionDashboard } from "@/components/billing/SubscriptionDashboard";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your NodePilot subscription, view payment history, and update billing information.
        </p>
      </div>
      
      <SubscriptionDashboard />
    </div>
  );
}
