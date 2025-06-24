"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, List, Settings, LogOut, User, CreditCard } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Clerk } from '@clerk/types';
import { UserButton } from "@clerk/nextjs";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isLink: boolean;
  onClick?: (clerk: Clerk) => void;
}

const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  const pathname = usePathname();
  const { openUserProfile } = useClerk();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="flex-1 px-2 py-1 mt-0">
      <div className="space-y-0.5">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
            pathname === "/dashboard"
              ? "bg-primary/10 text-primary"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <LayoutDashboard className={cn("w-5 h-5", pathname === "/dashboard" ? "text-primary" : "")}/>
          <span className={cn(
            "text-sm font-medium transition-opacity duration-200",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            Dashboard
          </span>
        </Link>
        <Link
          href="/dashboard/workflows"
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
            pathname === "/dashboard/workflows"
              ? "bg-primary/10 text-primary"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <List className={cn("w-5 h-5", pathname === "/dashboard/workflows" ? "text-primary" : "")}/>
          <span className={cn(
            "text-sm font-medium transition-opacity duration-200",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            My Workflows
          </span>
        </Link>
        <button
          type="button"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            openUserProfile();
          }}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50",
          )}
        >
          <User className="w-5 h-5" />
          <span className={cn(
            "text-sm font-medium transition-opacity duration-200",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            Profile
          </span>
        </button>
        <Link
          href="/dashboard/billing"
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
            pathname === "/dashboard/billing"
              ? "bg-primary/10 text-primary"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <CreditCard className={cn("w-5 h-5", pathname === "/dashboard/billing" ? "text-primary" : "")}/>
          <span className={cn(
            "text-sm font-medium transition-opacity duration-200",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            Billing
          </span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-primary hover:text-accent-salmon hover:bg-gray-50",
          )}
        >
          <LogOut className="w-5 h-5" />
          <span className={cn(
            "text-sm font-medium transition-opacity duration-200",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </nav>
  );
};

const SidebarFooter = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  const { user } = useUser();
  
  return null;
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isCollapsed ? "80px" : "280px",
          opacity: 1 
        }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className="hidden md:flex flex-col h-screen bg-gray-50 border-r border-gray-200 relative"
      >
        <div className="flex-1">
          <SidebarContent isCollapsed={isCollapsed} />
        </div>

        <div className="overflow-y-auto">
          <SidebarFooter isCollapsed={isCollapsed} />
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg text-gray-600 shadow-sm border border-gray-200"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4">
                  <button onClick={() => setIsOpen(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="flex-1">
                  <SidebarContent />
                </div>

                <div className="overflow-y-auto">
                  <SidebarFooter />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar; 