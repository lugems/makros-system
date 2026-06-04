"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  Home as HomeIcon, 
  Users as UsersIcon, 
  Car as CarIcon, 
  Book as BookIcon, 
  Wrench as WrenchIcon, 
  ClipboardList as ClipboardListIcon, 
  Warehouse as WarehouseIcon, 
  Truck as TruckIcon, 
  FileText as FileTextIcon, 
  CreditCard as CreditCardIcon, 
  FileClock as FileClockIcon, 
  Settings as SettingsIcon,
  BarChart3 as ChartBarIcon,
  LogOut, 
  Plus, 
  ShieldCheck, 
  MessageSquare
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Vehicles', href: '/vehicles', icon: CarIcon },
  { name: 'Bookings', href: '/bookings', icon: BookIcon },
  { name: 'Services', href: '/services', icon: WrenchIcon },
  { name: 'Job Cards', href: '/job-cards', icon: ClipboardListIcon },
  { name: 'Inventory', href: '/inventory', icon: WarehouseIcon },
  { name: 'Suppliers', href: '/suppliers', icon: TruckIcon },
  { name: 'Invoices', href: '/invoices', icon: FileTextIcon },
  { name: 'Payments', href: '/payments', icon: CreditCardIcon },
  { name: 'Intelligence', href: '/reports', icon: ChartBarIcon },
  { name: 'Personnel', href: '/staff', icon: UsersIcon },
  { name: 'Communications Log', href: '/communications', icon: MessageSquare },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileClockIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { setOpenMobile, isMobile, state } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLogout = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
    logout()
  }

  if (user?.role === 'Customer') return null;

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border/50 bg-card">
      <SidebarHeader className="p-6 group-data-[collapsible=icon]:p-3">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-3 mb-6 transition-all hover:opacity-80"
          onClick={handleLinkClick}
        >
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black font-headline tracking-tighter text-foreground group-data-[collapsible=icon]:hidden uppercase">
            Makros <span className="text-primary">System</span>
          </h1>
        </Link>
        
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 mb-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10 shadow-sm shrink-0">
              <AvatarImage 
                src={user?.photoUrl || `https://picsum.photos/seed/${user?.userId || 'user'}/100/100`} 
                alt={user?.fullName || 'Personnel'} 
              />
              <AvatarFallback className="font-black text-xs bg-primary/5 text-primary">
                {user?.fullName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black truncate uppercase tracking-tight">{user?.fullName || 'Personnel'}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest truncate">{user?.role || 'Guest'}</span>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive} 
                  tooltip={item.name}
                  className={cn(
                    "h-11 px-4 rounded-xl transition-all duration-300",
                    isActive 
                      ? "bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 scale-[1.02]" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground font-bold"
                  )}
                >
                  <Link 
                    href={item.href} 
                    className="flex items-center gap-4 group-data-[collapsible=icon]:justify-center"
                    onClick={handleLinkClick}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "opacity-100" : "opacity-50 group-hover:opacity-100")} />
                    <span className="group-data-[collapsible=icon]:hidden uppercase text-[11px] tracking-widest">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6 group-data-[collapsible=icon]:p-2 space-y-3">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <Link 
              href="/job-cards/new" 
              className="w-full"
              onClick={handleLinkClick}
            >
              <SidebarMenuButton 
                tooltip="New Job Card"
                className="w-full bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 justify-center h-12 font-black rounded-xl shadow-xl gap-3 transition-all hover:scale-[1.02] border-none">
                <Plus className="w-4 h-4 text-primary" />
                <span className="group-data-[collapsible=icon]:hidden uppercase text-[10px] tracking-[0.2em]">Bay Intake</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Settings" className="h-10 text-muted-foreground hover:text-foreground font-bold rounded-xl">
              <Link 
                href="/settings" 
                className="flex items-center gap-4 group-data-[collapsible=icon]:justify-center"
                onClick={handleLinkClick}
              >
                <SettingsIcon className="w-5 h-5 opacity-40" />
                <span className="group-data-[collapsible=icon]:hidden uppercase text-[10px] tracking-widest">Global Config</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Logout" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive flex items-center gap-4 w-full group-data-[collapsible=icon]:justify-center transition-all h-10 rounded-xl font-bold"
            >
              <LogOut className="w-5 h-5 opacity-40" />
              <span className="group-data-[collapsible=icon]:hidden uppercase text-[10px] tracking-widest">End Session</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {!isCollapsed && (
          <div className="pt-6 border-t border-border/50 text-center animate-in fade-in duration-700">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 leading-relaxed">
              Makros System Professional <br /> v2.4.0 Certified Stable
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
