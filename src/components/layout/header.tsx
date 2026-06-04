import React from 'react';
import { MobileNav } from '@/components/layout/mobile-nav';
import { UserMenu } from '@/components/layout/user-menu';

interface HeaderProps {
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 shadow-sm sm:px-6">
      <MobileNav />
      <h1 className="hidden text-lg font-semibold tracking-tight md:block md:text-xl">{currentPage}</h1>
      <div className="flex items-center gap-4 ml-auto">
        <UserMenu />
      </div>
    </header>
  );
};