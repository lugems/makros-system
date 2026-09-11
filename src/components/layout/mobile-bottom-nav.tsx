"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  ClipboardList, 
  Plus, 
  MessageSquare, 
  Menu, 
  Car, 
  Users, 
  Calendar, 
  Wrench, 
  Warehouse, 
  Truck, 
  FileText, 
  CreditCard, 
  BarChart3, 
  FileClock, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Hammer,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  ChevronRight
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface MobileBottomNavProps {
  unreadCount?: number;
}

const allModules = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, category: 'Core' },
  { name: 'Job Cards', href: '/job-cards', icon: ClipboardList, category: 'Operations' },
  { name: 'Customers', href: '/customers', icon: Users, category: 'Operations' },
  { name: 'Vehicles', href: '/vehicles', icon: Car, category: 'Operations' },
  { name: 'Plant & Equipment', href: '/plants-equipment', icon: Hammer, category: 'Operations' },
  { name: 'Bookings', href: '/bookings', icon: Calendar, category: 'Operations' },
  { name: 'Services Catalog', href: '/services', icon: Wrench, category: 'Operations' },
  { name: 'Inventory Registry', href: '/inventory', icon: Warehouse, category: 'Inventory' },
  { name: 'Suppliers', href: '/suppliers', icon: Truck, category: 'Inventory' },
  { name: 'Invoices & Billing', href: '/invoices', icon: FileText, category: 'Financial' },
  { name: 'Payments', href: '/payments', icon: CreditCard, category: 'Financial' },
  { name: 'Intelligence & Reports', href: '/reports', icon: BarChart3, category: 'Analytics' },
  { name: 'Personnel & Staff', href: '/staff', icon: Users, category: 'Management' },
  { name: 'Communications Log', href: '/communications', icon: MessageSquare, category: 'Management' },
  { name: 'Audit Trail', href: '/audit-logs', icon: FileClock, category: 'Management' },
  { name: 'Global Settings', href: '/settings', icon: Settings, category: 'Management' },
]

export function MobileBottomNav({ unreadCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isQuickActionsOpen, setIsQuickActionsOpen] = React.useState(false)

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10)
      } catch {
        // Safe fallback
      }
    }
  }

  // Hide mobile bottom nav for customers or if unauthenticated
  if (!user || user.role === 'Customer') return null;

  const isDashboardActive = pathname === '/dashboard'
  const isJobCardsActive = pathname === '/job-cards' || (pathname?.startsWith('/job-cards') && pathname !== '/job-cards/new')
  const isCommsActive = pathname?.startsWith('/communications')

  return (
    <>
      {/* 1. FIXED ERGONOMIC BOTTOM NAVIGATION BAR */}
      <nav 
        aria-label="Mobile Navigation" 
        className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-bottom-nav transition-all duration-300 select-none pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] pt-1.5 px-3"
      >
        <div className="grid grid-cols-5 items-center justify-items-center relative max-w-lg mx-auto">
          
          {/* TAB 1: Dashboard */}
          <Link
            href="/dashboard"
            onClick={triggerHaptic}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1 rounded-2xl transition-all duration-200 active:scale-95",
              isDashboardActive 
                ? "text-primary font-black" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "relative p-1.5 rounded-xl transition-colors",
              isDashboardActive && "bg-primary/10"
            )}>
              <Home className={cn("h-5 w-5 transition-transform", isDashboardActive && "scale-110")} />
              {isDashboardActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">Home</span>
          </Link>

          {/* TAB 2: Job Cards */}
          <Link
            href="/job-cards"
            onClick={triggerHaptic}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1 rounded-2xl transition-all duration-200 active:scale-95",
              isJobCardsActive 
                ? "text-primary font-black" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "relative p-1.5 rounded-xl transition-colors",
              isJobCardsActive && "bg-primary/10"
            )}>
              <ClipboardList className={cn("h-5 w-5 transition-transform", isJobCardsActive && "scale-110")} />
              {isJobCardsActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">Job Cards</span>
          </Link>

          {/* TAB 3: CENTER QUICK-ACTION (+) BUTTON */}
          <div className="flex flex-col items-center justify-center w-full relative">
            <button
              onClick={() => {
                triggerHaptic()
                setIsQuickActionsOpen(true)
              }}
              aria-label="Quick Workshop Intake & Actions"
              className="relative -top-3.5 h-12 w-12 rounded-full bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-background transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
            <span className="text-[9px] uppercase tracking-wider font-black -mt-2.5 text-foreground/80">Intake</span>
          </div>

          {/* TAB 4: Communications & Notifications */}
          <Link
            href="/communications"
            onClick={triggerHaptic}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1 rounded-2xl transition-all duration-200 active:scale-95 relative",
              isCommsActive 
                ? "text-primary font-black" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "relative p-1.5 rounded-xl transition-colors",
              isCommsActive && "bg-primary/10"
            )}>
              <MessageSquare className={cn("h-5 w-5 transition-transform", isCommsActive && "scale-110")} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-[8px] font-black text-white flex items-center justify-center ring-2 ring-background animate-in zoom-in duration-300">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {isCommsActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">Comms</span>
          </Link>

          {/* TAB 5: MORE / HUB MENU */}
          <button
            onClick={() => {
              triggerHaptic()
              setIsMenuOpen(true)
            }}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1 rounded-2xl transition-all duration-200 active:scale-95",
              isMenuOpen 
                ? "text-primary font-black" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "relative p-1.5 rounded-xl transition-colors",
              isMenuOpen && "bg-primary/10"
            )}>
              <Menu className="h-5 w-5" />
            </div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">Menu</span>
          </button>

        </div>
      </nav>

      {/* 2. QUICK-ACTION BOTTOM SHEET */}
      <Sheet open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
        <SheetContent side="bottom" className="rounded-t-[2.5rem] border-t border-border/60 bg-background/95 backdrop-blur-2xl p-6 pb-[max(env(safe-area-inset-bottom,0px),1.5rem)] max-w-xl mx-auto">
          <SheetHeader className="text-left pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Plus className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <SheetTitle className="text-base font-black uppercase tracking-tight">Rapid Workshop Intake</SheetTitle>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Execute workflow actions</p>
              </div>
            </div>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            <Link
              href="/job-cards/new"
              onClick={() => setIsQuickActionsOpen(false)}
              className="flex flex-col p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all active:scale-[0.98]"
            >
              <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 mb-2">
                <ClipboardList className="h-4 w-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-tight text-foreground">New Job Card</span>
              <span className="text-[9px] text-muted-foreground font-semibold mt-0.5">Intake vehicle to bay</span>
            </Link>

            <Link
              href="/bookings"
              onClick={() => setIsQuickActionsOpen(false)}
              className="flex flex-col p-4 rounded-2xl bg-muted/40 border border-border/60 hover:border-primary/30 transition-all active:scale-[0.98]"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-tight text-foreground">New Booking</span>
              <span className="text-[9px] text-muted-foreground font-semibold mt-0.5">Reserve maintenance slot</span>
            </Link>

            <Link
              href="/customers"
              onClick={() => setIsQuickActionsOpen(false)}
              className="flex flex-col p-4 rounded-2xl bg-muted/40 border border-border/60 hover:border-primary/30 transition-all active:scale-[0.98]"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-tight text-foreground">Customers</span>
              <span className="text-[9px] text-muted-foreground font-semibold mt-0.5">Registry & onboarding</span>
            </Link>

            <Link
              href="/payments"
              onClick={() => setIsQuickActionsOpen(false)}
              className="flex flex-col p-4 rounded-2xl bg-muted/40 border border-border/60 hover:border-primary/30 transition-all active:scale-[0.98]"
            >
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-tight text-foreground">Record Payment</span>
              <span className="text-[9px] text-muted-foreground font-semibold mt-0.5">Settle invoice or intake</span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* 3. FULL APP HUB DRAWER */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-[88vw] max-w-sm p-0 bg-background flex flex-col border-l border-border/60">
          
          {/* Header & User identity */}
          <div className="p-6 border-b border-border/50 bg-card/60 pt-[max(env(safe-area-inset-top,0px),1.5rem)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <ShieldCheck className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black font-headline tracking-tight uppercase">
                    Makros <span className="text-primary">System</span>
                  </h2>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mobile Suite</span>
                </div>
              </div>
            </div>

            {/* Profile pill */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage 
                  src={user?.photoUrl || `https://picsum.photos/seed/${user?.userId || 'user'}/100/100`} 
                  alt={user?.fullName || 'Personnel'} 
                />
                <AvatarFallback className="font-black text-xs bg-primary/10 text-primary">
                  {user?.fullName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-black truncate uppercase tracking-tight">{user?.fullName || 'Personnel'}</span>
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider truncate">{user?.role || 'Staff'}</span>
              </div>
            </div>
          </div>

          {/* Theme Quick Switcher in Menu */}
          <div className="px-6 py-3 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Appearance</span>
              <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme('light')}
                  className={cn("h-7 px-2.5 rounded-lg text-xs font-bold gap-1.5", theme === 'light' && "bg-primary text-white shadow-sm hover:bg-primary hover:text-white")}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span className="text-[10px]">Light</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className={cn("h-7 px-2.5 rounded-lg text-xs font-bold gap-1.5", theme === 'dark' && "bg-primary text-white shadow-sm hover:bg-primary hover:text-white")}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span className="text-[10px]">Dark</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme('system')}
                  className={cn("h-7 px-2.5 rounded-lg text-xs font-bold gap-1.5", theme === 'system' && "bg-primary text-white shadow-sm hover:bg-primary hover:text-white")}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  <span className="text-[10px]">Auto</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable module catalog */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 custom-scrollbar">
            {allModules.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 h-11 rounded-xl transition-all duration-200 text-xs font-bold",
                    isActive
                      ? "bg-primary text-primary-foreground font-black shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-60")} />
                    <span className="uppercase text-[11px] tracking-wider">{item.name}</span>
                  </div>
                  {isActive ? (
                    <CheckCircle2 className="h-3.5 w-3.5 opacity-90" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 opacity-30" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Footer with logout */}
          <div className="p-4 border-t border-border/50 bg-card/60 pb-[max(env(safe-area-inset-bottom,0px),1rem)]">
            <Button
              variant="outline"
              onClick={() => {
                setIsMenuOpen(false)
                logout()
              }}
              className="w-full h-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 font-black uppercase text-[10px] tracking-widest gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>End Workshop Session</span>
            </Button>
          </div>

        </SheetContent>
      </Sheet>
    </>
  )
}
