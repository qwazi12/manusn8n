"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, List, Plus, DollarSign, LogOut } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/clerk-react';

const navigationItems = [
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

const SidebarLink = ({ link, isCollapsed }: { link: typeof navigationItems[0], isCollapsed: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === link.href;
  
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
        isActive 
          ? "bg-white/5 text-gray-900" 
          : "text-gray-500 hover:text-gray-900"
      )}
    >
      {link.icon}
      <span className={cn(
        "text-sm font-medium transition-opacity duration-200",
        isCollapsed ? "opacity-0 w-0" : "opacity-100"
      )}>
        {link.label}
      </span>
    </Link>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isCollapsed ? "80px" : "240px",
          opacity: 1 
        }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className="hidden md:flex flex-col h-screen bg-gray-50 border-r border-gray-200"
      >
        <div className={cn(
          "p-4 transition-all duration-200",
          isCollapsed ? "px-4" : "px-4"
        )}>
          <Link 
            href="/" 
            className="flex items-center gap-2"
          >
            <div className="bg-rose-500 rounded-lg p-2 text-white font-medium">NP</div>
            <span className={cn(
              "font-bold text-xl text-gray-900 transition-opacity duration-200",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              NodePilot
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map((item) => (
            <SidebarLink key={item.label} link={item} isCollapsed={isCollapsed} />
          ))}
        </nav>

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

                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarLink key={item.label} link={item} isCollapsed={false} />
                  ))}
                </nav>

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