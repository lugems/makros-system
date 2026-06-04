'use client';

import React from 'react';
import Link from 'next/link';
import { 
    Car, 
    Calendar, 
    ClipboardList, 
    Package, 
    FileText, 
    FileClock,
    ChevronRight,
    Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';

const shortcuts = [
    { name: 'Vehicle Registry', href: '/vehicles', icon: Car, id: 'VH-NAV', color: 'text-blue-500', bg: 'bg-blue-500/5' },
    { name: 'Service Queue', href: '/bookings', icon: Calendar, id: 'BK-NAV', color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
    { name: 'Job Card Bay', href: '/job-cards', icon: ClipboardList, id: 'JC-NAV', color: 'text-primary', bg: 'bg-primary/5' },
    { name: 'Stock Logistics', href: '/inventory', icon: Package, id: 'IV-NAV', color: 'text-orange-500', bg: 'bg-orange-500/5' },
    { name: 'Revenue Ledger', href: '/invoices', icon: FileText, id: 'FN-NAV', color: 'text-green-500', bg: 'bg-green-500/5' },
    { name: 'System Traces', href: '/audit-logs', icon: FileClock, id: 'AL-NAV', color: 'text-slate-500', bg: 'bg-slate-500/5' },
];

export function QuickShortcuts() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {shortcuts.map((item) => {
                const Icon = item.icon;
                return (
                    <Link 
                        key={item.href} 
                        href={item.href}
                        className="group relative bg-card border border-border/50 p-4 rounded-2xl hover:border-primary/40 transition-all duration-300 premium-shadow hover:translate-y-[-2px]"
                    >
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                                item.bg,
                                item.color
                            )}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                                    {item.name}
                                </p>
                                <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Fingerprint className="h-2.5 w-2.5" />
                                    <span className="text-[8px] font-mono font-bold uppercase tracking-widest">{item.id}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Interactive Accent */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <ChevronRight className="h-3 w-3 text-primary" />
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}