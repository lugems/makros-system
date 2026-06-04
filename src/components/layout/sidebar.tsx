'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  Users,
  Wrench,
  Calendar,
  Settings,
  BarChart3,
  LogOut,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/job-cards', label: 'Job Cards', icon: Wrench },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-16 flex-col bg-[#182235] text-white fixed">
      <div className="flex items-center justify-center p-4 border-b border-gray-700">
        <Link href="/dashboard">
          <Image
            src="/images/logo.png"
            alt="Makros Logo"
            width={32}
            height={32}
          />
        </Link>
      </div>
      <nav className="flex-grow mt-4">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.label} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-center p-4 my-2 transition-colors duration-200 hover:bg-[#2d3748] w-full',
                    pathname === item.href && 'bg-[#2d3748]'
                  )}
                >
                  <item.icon size={22} />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#182235] text-white border-none"
              >
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      <div className="border-t border-gray-700">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className="flex items-center justify-center p-4 hover:bg-[#2d3748] w-full"
              >
                <Settings size={22} />
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-[#182235] text-white border-none"
            >
              Settings
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button className="w-full flex items-center justify-center p-4 hover:bg-[#2d3748]">
                <LogOut size={22} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-[#182235] text-white border-none"
            >
              Logout
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
};
