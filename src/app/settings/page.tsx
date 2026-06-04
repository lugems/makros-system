'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { updateSettings } from '@/services/settings-service';
import { WorkshopSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/loading-state';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  User, 
  Clock, 
  FileText, 
  GitBranch, 
  Bell, 
  CreditCard, 
  Package, 
  ShieldCheck, 
  Monitor,
  ArrowRight,
  Info,
  ShieldAlert,
  Save,
  RotateCcw,
  Loader2
} from 'lucide-react';

import { SettingsSectionCard } from '@/components/settings/settings-section-card';
import { WorkshopProfileSettings } from '@/components/settings/workshop-profile-settings';
import { OperatingHoursSettings } from '@/components/settings/operating-hours-settings';
import { InvoiceSettings } from '@/components/settings/invoice-settings';
import { JobCardWorkflowSettings } from '@/components/settings/job-card-workflow-settings';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { PaymentSettings } from '@/components/settings/payment-settings';
import { InventoryAlertSettings } from '@/components/settings/inventory-alert-settings';
import { PermissionSettings } from '@/components/settings/permission-settings';
import { SystemPreferences } from '@/components/settings/system-preferences';
import { cn } from '@/lib/utils';

/**
 * Baseline configuration for new or sparse workshop registries.
 */
const defaultSettings: Partial<WorkshopSettings> = {
  settingsId: "workshop",
  workshopName: "Makros System Workshop",
  businessRegistrationName: "",
  tin: "",
  currency: "UGX",
  timezone: "Africa/Kampala",
  language: "English",
  taxEnabled: false,
  taxName: "VAT",
  taxRate: 18,
  defaultDiscount: 0,
  invoicePrefix: "INV",
  invoiceStartNumber: 1001,
  receiptPrefix: "REC",
  receiptFooterNote: "Thank you for trusting Makros System Workshop.",
  website: "",
  paymentMethods: {
    cash: true, mobileMoney: true, bankTransfer: true, card: false, credit: false
  },
  notifications: {
    sms: false, email: true, whatsapp: false, inApp: true,
    bookingReminders: true, jobStatusUpdates: true, paymentReminders: true, serviceReminders: true, lowStockAlerts: true
  },
  inventoryAlerts: {
    lowStockEnabled: true, notifyInventoryOfficer: true, notifyWorkshopManager: true
  },
  operatingHours: [
    { day: "Monday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Tuesday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Wednesday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Thursday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Friday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Saturday", open: true, openingTime: "09:00", closingTime: "15:00" },
    { day: "Sunday", open: false, openingTime: "00:00", closingTime: "00:00" },
  ]
};

/**
 * @fileOverview The Global Control Panel for the Makros System.
 * Orchestrates workshop-wide calibration and technical defaults.
 */
export default function SettingsPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();
  
  // Real-time Settings Stream (Memoized)
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'workshop') as DocumentReference<WorkshopSettings>, [db]);
  const { data: remoteSettings, loading: settingsLoading } = useDoc<WorkshopSettings>(settingsRef);

  const [activeTab, setActiveTab] = useState('summary');
  const [currentSettings, setCurrentSettings] = useState<Partial<WorkshopSettings> | null>(null);
  const [baseSettings, setBaseSettings] = useState<Partial<WorkshopSettings> | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize remote settings to local buffer for staged calibration
  useEffect(() => {
    if (settingsLoading) return;

    // Correct hydration logic: Update form state only if not yet initialized or if the remote source has data
    const hydrated = remoteSettings 
      ? { ...defaultSettings, ...remoteSettings } 
      : defaultSettings;
    
    setBaseSettings(hydrated);
    
    // Only auto-initialize currentSettings if the user hasn't started editing or it's the first data arrival
    if (!hasInitialized) {
      setCurrentSettings(hydrated);
      setHasInitialized(true);
    }
  }, [remoteSettings, settingsLoading, hasInitialized]);

  const handleUpdate = (field: keyof WorkshopSettings, value: any) => {
    setCurrentSettings(prev => prev ? { ...prev, [field]: value } : { [field]: value });
  };

  const handleDeepUpdate = (category: string, field: string, value: any) => {
    setCurrentSettings(prev => {
        if (!prev) return null;
        const catData = (prev as any)[category] || {};
        return {
            ...prev,
            [category]: {
                ...catData,
                [field]: value
            }
        };
    });
  };

  const isOwner = currentUser?.role === 'Makros System Owner';
  const canCommitChanges = useMemo(() => isOwner, [isOwner]);

  const handleSave = async () => {
    if (!currentUser || !currentSettings) return;
    
    if (!canCommitChanges) {
        toast({ 
            variant: "destructive", 
            title: "Access Denied", 
            description: "You do not have the required clearance to modify the master registry." 
        });
        return;
    }

    setIsSaving(true);
    try {
      // Mutations are non-blocking; UI reflects local state immediately
      await updateSettings(currentSettings, currentUser.userId);
      toast({ title: "Configuration Applied", description: "Workshop parameters have been synchronized with the master registry." });
      setBaseSettings(currentSettings);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setCurrentSettings(baseSettings || null);
    toast({ title: "Buffer Cleared", description: "Unsaved calibration data has been reverted." });
  };
  
  const hasUnsavedChanges = useMemo(() => {
    if (!baseSettings || !currentSettings) return false;
    // Deep comparison of strings to detect property shifts
    return JSON.stringify(baseSettings) !== JSON.stringify(currentSettings);
  }, [baseSettings, currentSettings]);

  if (authLoading || (settingsLoading && !hasInitialized)) return <LoadingState />;

  const settingsSections = [
    { id: 'profile', title: 'Workshop Profile', description: 'Legal identity, contact authority and localization.', status: 'Configured', icon: User },
    { id: 'hours', title: 'Operating Hours', description: 'Weekly technical availability and intake windows.', status: 'Configured', icon: Clock },
    { id: 'invoicing', title: 'Fiscal & Tax', description: 'Invoice sequences, VAT rules, document footers and discounts.', status: 'Configured', icon: FileText },
    { id: 'workflow', title: 'Operational States', description: 'Dossier transitions and job card lifecycle logic.', status: 'Configured', icon: GitBranch },
    { id: 'notifications', title: 'Alert Pipeline', description: 'Multi-channel communication and trigger logic.', status: 'Configured', icon: Bell },
    { id: 'payments', title: 'Settlement Methods', description: 'Authorized treasury channels and digital gateways.', status: 'Configured', icon: CreditCard },
    { id: 'inventory', title: 'Logistics Alerts', description: 'SKU thresholds and reorder notification logic.', status: 'Configured', icon: Package },
    { id: 'permissions', title: 'Access Matrix', description: 'Role-based technical clearance and authority.', status: 'Configured', icon: ShieldCheck },
    { id: 'system', title: 'System Engine', description: 'Backups, exports, and platform telemetry.', status: 'Configured', icon: Monitor },
  ] as const;

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-primary/10 rounded-[1.25rem] flex items-center justify-center border border-primary/20 shadow-sm">
            <Settings className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter font-headline leading-none">Global Control Panel</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60 mt-1">Master Workshop Calibration active</p>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-card border border-border/50 rounded-2xl p-1.5 mb-10 overflow-x-auto shadow-sm">
          <TabsList className="bg-transparent h-auto gap-1 p-0 flex justify-start lg:justify-between w-full min-w-max">
            <TabsTrigger 
              value="summary"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Master Hub
            </TabsTrigger>
            {settingsSections.map(section => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {section.title.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="summary" className="space-y-10 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsSections.map((section) => (
              <SettingsSectionCard
                key={section.id}
                title={section.title}
                description={section.description}
                status={section.status as any}
                icon={<section.icon className="h-5 w-5" />}
                onManage={() => setActiveTab(section.id)}
              />
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                <ShieldCheck className="h-32 w-32" />
            </div>
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
              <h4 className="font-black uppercase tracking-tight text-lg">Platform Recalibration Protocol</h4>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed mt-1">Changes made in this panel instantly propagate across all technician terminals, fiscal dossiers, and client outreach pipelines. Ensure all legal data matches your registration documents.</p>
            </div>
            <Button variant="outline" className="font-black uppercase tracking-widest text-[10px] gap-2 rounded-xl h-12 px-8 relative z-10" asChild>
              <a href="/audit-logs">Audit Log Registry <ArrowRight className="h-3.5 w-3.5" /></a>
            </Button>
          </div>
        </TabsContent>

        <div className="mt-0">
          <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
            <WorkshopProfileSettings 
              data={currentSettings} 
              onUpdate={handleUpdate} 
            />
          </TabsContent>
          <TabsContent value="hours" className="mt-0 focus-visible:outline-none">
            <OperatingHoursSettings 
              data={currentSettings?.operatingHours} 
              onUpdate={(val) => handleUpdate('operatingHours', val)} 
            />
          </TabsContent>
          <TabsContent value="invoicing" className="mt-0 focus-visible:outline-none">
            <InvoiceSettings 
              data={currentSettings} 
              onUpdate={handleUpdate} 
            />
          </TabsContent>
          <TabsContent value="workflow" className="mt-0 focus-visible:outline-none">
            <JobCardWorkflowSettings />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
            <NotificationSettings 
                data={currentSettings?.notifications} 
                onUpdate={(f, v) => handleDeepUpdate('notifications', f, v)} 
            />
          </TabsContent>
          <TabsContent value="payments" className="mt-0 focus-visible:outline-none">
            <PaymentSettings 
                data={currentSettings?.paymentMethods} 
                onUpdate={(f, v) => handleDeepUpdate('paymentMethods', f, v)} 
            />
          </TabsContent>
          <TabsContent value="inventory" className="mt-0 focus-visible:outline-none">
            <InventoryAlertSettings 
                data={currentSettings?.inventoryAlerts} 
                onUpdate={(f, v) => handleDeepUpdate('inventoryAlerts', f, v)} 
            />
          </TabsContent>
          <TabsContent value="permissions" className="mt-0 focus-visible:outline-none">
            <PermissionSettings />
          </TabsContent>
          <TabsContent value="system" className="mt-0 focus-visible:outline-none">
            <SystemPreferences 
              data={currentSettings} 
              onUpdate={handleUpdate} 
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Floating Action Bar for Unsaved Buffer */}
      {activeTab !== 'summary' && (
        <div className="fixed bottom-8 left-0 right-0 z-50 px-6 pointer-events-none lg:pl-72">
          <div className={cn(
            "max-w-[1200px] mx-auto p-5 rounded-[1.5rem] border border-primary/20 bg-background/80 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-6 pointer-events-auto transition-all duration-500 transform",
            hasUnsavedChanges ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95 pointer-events-none"
          )}>
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              <div className="space-y-0.5">
                <p className="text-xs font-black uppercase tracking-tight">Unsaved Calibration Buffer Active</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending Master Registry Synchronization</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="ghost" 
                onClick={handleReset} 
                className="flex-1 sm:flex-none h-11 font-black uppercase tracking-widest text-[10px] gap-2 rounded-xl"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Discard
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !canCommitChanges}
                className="flex-1 sm:flex-none h-11 px-8 font-black uppercase tracking-widest text-[10px] gap-2 rounded-xl shadow-lg shadow-primary/20"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Commit to Registry</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
