"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { LayoutDashboard, List, Plus, DollarSign, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "My Workflows",
    href: "/dashboard/workflows",
    icon: <List className="w-5 h-5" />,
  },
  {
    label: "Create Workflow",
    href: "/dashboard/create",
    icon: <Plus className="w-5 h-5" />,
  },
  {
    label: "Pricing",
    href: "/#pricing",
    icon: <DollarSign className="w-5 h-5" />,
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 