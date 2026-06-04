
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { 
    LayoutGrid, 
    Calendar, 
    Activity, 
    FileText, 
    LogOut, 
    ShieldCheck, 
    Menu,
    Car,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const customerNavItems = [
    { name: 'Dashboard', href: '/customer-portal', icon: LayoutGrid },
    { name: 'My Fleet', href: '/customer-portal/fleet', icon: Car },
    { name: 'Bookings', href: '/customer-portal/bookings', icon: Calendar },
    { name: 'Service Progress', href: '/customer-portal/job-status', icon: Activity },
    { name: 'Billing', href: '/customer-portal/invoices', icon: FileText },
    { name: 'Messages / Support', href: '/customer-portal/messages', icon: MessageSquare },
];

/**
 * @fileOverview Technical Portal Shell for customers.
 * Implements strict authorization gating to prevent unauthorized registry access.
 * Hardened against hydration mismatches by deferring state-dependent gates and animations.
 */
export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // TECHNICAL GATE: Suspend rendering if session is invalid or synchronizing
    // HYDRATION SAFE: Render loading UI consistently on server and first client pass by gating dynamic state
    if (!mounted || isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground",
                        mounted && "animate-pulse"
                    )}>
                        Authorizing Portal Access...
                    </p>
                </div>
            </div>
        );
    }

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-8">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-black font-headline tracking-tighter uppercase">
                            Makros <span className="text-primary">Portal</span>
                        </h1>
                    </div>
                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>
                </div>

                <nav className="space-y-2">
                    {customerNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                onClick={() => setIsMobileNavOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 h-12 rounded-xl transition-all duration-300",
                                    isActive 
                                        ? "bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20" 
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-bold"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "opacity-100" : "opacity-50")} />
                                <span className="uppercase text-[11px] tracking-widest">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 border-t border-border/50 space-y-4">
                <Link 
                    href="/customer-portal/profile"
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 transition-all hover:border-primary/30",
                        pathname === '/customer-portal/profile' && "border-primary/50 bg-primary/5"
                    )}
                >
                    <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                        <AvatarImage 
                            src={user?.photoUrl || `https://picsum.photos/seed/${user?.userId || 'user'}/100/100`} 
                            alt={user?.fullName || 'Customer'} 
                        />
                        <AvatarFallback className="font-black text-xs bg-primary/5 text-primary">
                            {user?.fullName?.[0] || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black truncate uppercase tracking-tight">{user?.fullName}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">My Profile</span>
                    </div>
                </Link>
                <Button 
                    variant="ghost" 
                    onClick={logout}
                    className="w-full justify-start h-12 rounded-xl text-muted-foreground hover:text-destructive font-black gap-4"
                >
                    <LogOut className="w-5 h-5 opacity-40" />
                    <span className="uppercase text-[10px] tracking-widest">End Session</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 border-r border-border/50 bg-card sticky top-0 h-screen overflow-y-auto">
                <NavContent />
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden glass-header h-16 flex items-center justify-between px-6 shrink-0 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <ShieldCheck className="text-white w-5 h-5" />
                    </div>
                    <span className="font-black uppercase tracking-tighter text-sm">Makros Portal</span>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <NavContent />
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
