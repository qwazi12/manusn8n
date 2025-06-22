"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Testing...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('users').select('count');
        if (error) throw error;
        setConnectionStatus("✅ Connected to Supabase!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to connect to Supabase");
        setConnectionStatus("❌ Connection failed");
      }
    }

    testConnection();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
        <p className="text-lg">{connectionStatus}</p>
        {error && (
          <p className="text-sm text-destructive">
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
} 