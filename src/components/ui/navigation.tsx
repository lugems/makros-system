import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Dashboard', path: '/' },
  { name: 'Customers', path: '/customers' },
  { name: 'Job Cards', path: '/job-cards' },
  { name: 'Invoices', path: '/invoices' },
  { name: 'Inventory', path: '/inventory' },
];

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-[#0F172A] p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-white font-bold text-xl font-headline uppercase tracking-tighter">Makros System</div>
        <div className="hidden md:flex space-x-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? 'bg-[#1E293B] text-white' 
                    : 'text-gray-300 hover:bg-[#1E293B] hover:text-white'
                )}
              >
                {link.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  );
};
