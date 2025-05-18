"use client";

import React from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/layout/Sidebar";
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
    <div className="flex min-h-screen bg-background">
      <Sidebar>
        <SidebarBody className="pt-8">
          <div className="flex flex-col gap-2">
            {sidebarLinks.map((link) => (
              <SidebarLink key={link.href} link={link} />
            ))}
          </div>
          <div className="mt-auto pt-8">
            <button
              className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm w-full px-2 py-2"
              onClick={() => router.push("/logout")}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 px-4 py-8 md:px-8 md:py-12">{children}</main>
    </div>
  );
} 