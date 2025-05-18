"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, List, Settings, LogOut, User } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/clerk-react';
import { Clerk } from '@clerk/types';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  onClick?: (clerk: Clerk) => void;
}

const navigationItems: NavigationItem[] = [
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
    label: "Profile",
    href: "/dashboard/user-profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  const pathname = usePathname();
  
  return (
    <>
      <nav className="flex-1 px-2 py-4 mt-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
                pathname === item.href 
                  ? "bg-rose-50 text-rose-500" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {item.icon}
              <span className={cn(
                "text-sm font-medium transition-opacity duration-200",
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

const SidebarFooter = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  const { user } = useUser();
  
  return (
    <div className={cn(
      "space-y-6 text-sm px-2",
      isCollapsed ? "absolute bottom-16 left-0 right-0 opacity-0" : "opacity-100",
      "transition-all duration-200"
    )}>
      <div className="border-t border-gray-200 pt-4">
        <div className="font-semibold text-gray-900">Current Plan: Free Trial</div>
        <p className="text-xs text-gray-500">Free Trial</p>
        <Link 
          href="/#pricing" 
          className="mt-2 block w-full rounded-md border border-gray-300 text-center py-2 text-sm hover:bg-gray-50 transition"
        >
          Upgrade Plan
        </Link>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="font-semibold text-gray-900">Available Credits</div>
        <p className="text-xs text-gray-500">You have 100 credits remaining on your Free Trial plan</p>
        <div className="relative mt-2 h-2 w-full bg-gray-100 rounded-full">
          <div className="absolute top-0 left-0 h-2 rounded-full bg-rose-500" style={{ width: '100%' }} />
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-500">
          <span>0</span>
          <span>100 credits</span>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

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
        <div className="flex-1 overflow-y-auto">
          <SidebarContent isCollapsed={isCollapsed} />
        </div>

        <div className="overflow-y-auto">
          <SidebarFooter isCollapsed={isCollapsed} />
        </div>

        <div className={cn(
          "p-4 border-t border-gray-200 transition-all duration-200",
          isCollapsed ? "px-2" : "px-4"
        )}>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn(
              "w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-gray-100",
              isCollapsed ? "px-2" : "px-4"
            )}
          >
            <LogOut className="w-5 h-5" />
            <span className={cn(
              "ml-2 transition-opacity duration-200",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              Logout
            </span>
          </Button>
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
                  <Link href="/" className="flex items-center gap-2">
                    <div className="bg-rose-500 rounded-lg p-2 text-white font-medium">NP</div>
                    <span className="font-bold text-xl text-gray-900">NodePilot</span>
                  </Link>
                  <button onClick={() => setIsOpen(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <SidebarContent />
                </div>

                <div className="overflow-y-auto">
                  <SidebarFooter />
                </div>

                <div className="p-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </Button>
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