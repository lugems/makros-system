
"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { usePathname, useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Bell, Search, Mail, MessageSquare, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { UserMenu } from "./user-menu"
import { useAuth } from "@/contexts/auth-context"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { CommunicationLog } from "@/types/communication"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Main application shell providing sidebar navigation and header services.
 * Implements strict authorization gating for internal command center routes.
 * Hardened against hydration mismatches by deferring state-dependent gates and animations.
 */
export function SidebarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()
  const db = useFirestore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Real-time notification count for staff follow-ups
  const actionableQuery = useMemoFirebase(() => {
    if (!db || !user || user.role === 'Customer') return null;
    return query(
      collection(db, 'communicationLogs'),
      where('requiresFollowUp', '==', true),
      where('status', 'in', ['Open', 'Pending Response'])
    );
  }, [db, user]);

  const { data: actionableLogs } = useCollection<CommunicationLog>(actionableQuery as any);
  const unreadCount = actionableLogs?.length || 0;

  // Routes that bypass the command center shell (Portal, Login, and Print Previews)
  const isPortal = pathname?.startsWith('/customer-portal')
  const isLogin = pathname === '/login'
  const isPreview = pathname?.includes('/preview')
  const isRoot = pathname === '/'
  
  // Bypass shell rendering for non-staff contexts
  if (isPortal || isLogin || isPreview) {
    return <main className="min-h-screen bg-background">{children}</main>
  }

  // TECHNICAL GATE: Suspend rendering if session is invalid or synchronizing
  // HYDRATION SAFE: Render loading UI consistently on server and first client pass by gating dynamic state
  if (!mounted || isLoading || (!isAuthenticated && !isRoot)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className={cn(
            "text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground",
            mounted && "animate-pulse"
          )}>
            Synchronizing Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="glass-header h-16 flex items-center gap-4 px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            
            <div className="hidden md:flex items-center max-w-md w-full ml-2">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Technical search..." 
                  className="pl-10 bg-muted/30 h-10 w-full focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl border-none" 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground hover:bg-muted transition-colors" asChild>
                <Link href="/communications">
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground hover:bg-muted transition-colors" asChild>
                <Link href="/communications">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary text-[8px] font-black text-white flex items-center justify-center ring-2 ring-background animate-in zoom-in duration-300">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <ThemeToggle />
            </div>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <div className="flex items-center gap-3 pl-2">
              <UserMenu />
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 bg-background/95 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
