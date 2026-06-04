'use client';
import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

/**
 * @fileOverview Technical User Terminal for the global header.
 * Provides rapid access to personnel profile, system settings, and session termination.
 */
export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/5 hover:ring-primary/20 transition-all p-0 overflow-hidden">
          <Avatar className="h-full w-full">
            <AvatarImage 
              src={user?.photoUrl || `https://picsum.photos/seed/${user?.userId || 'user'}/100/100`} 
              alt={user?.fullName || 'Personnel'} 
            />
            <AvatarFallback className="font-black text-[10px] bg-primary/10 text-primary uppercase">
              {user?.fullName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-2xl p-2 shadow-2xl border-border/50" align="end">
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black uppercase tracking-tight leading-none text-foreground">
              {user?.fullName || 'Personnel Registry'}
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[9px] leading-none text-muted-foreground font-black uppercase tracking-widest">
                {user?.role || 'Guest Access'}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="mx-2 opacity-50" />
        
        <div className="p-1 space-y-1">
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
            <Link href={user?.userId ? `/staff/${user.userId}` : '#'} className="flex items-center gap-3">
              <UserIcon className="h-4 w-4 text-primary opacity-70" />
              <span className="text-[11px] font-black uppercase tracking-widest">My Profile</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
            <Link href="/settings" className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-primary opacity-70" />
              <span className="text-[11px] font-black uppercase tracking-widest">Global Config</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="mx-2 opacity-50" />
        
        <div className="p-1">
          <DropdownMenuItem 
            onClick={() => logout()}
            className="rounded-xl cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">End Session</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
