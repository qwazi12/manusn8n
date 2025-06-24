"use client";

import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
            <p className="text-gray-600">
              Manage your account settings and preferences using Clerk's built-in functionality.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Email Preferences</h2>
            <p className="text-gray-600">
              You can manage your email preferences and notifications through your Clerk dashboard.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">API Usage</h2>
            <p className="text-gray-600">
              Monitor your API usage and manage your subscription settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 