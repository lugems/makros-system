'use client';

import React, { useMemo, useState } from 'react';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
    Car, 
    User, 
    Wrench, 
    History, 
    Fingerprint, 
    ShieldCheck, 
    ArrowLeft, 
    Calendar,
    Activity,
    ClipboardList,
    Gauge,
    Fuel,
    AlertCircle,
    Info,
    ChevronRight,
    Camera,
    MessageSquare,
    Plus
} from 'lucide-react';
import { FormattedDate } from '@/components/shared/formatted-date';
import { JobStatusBadge } from '@/components/job-cards/job-status-badge';
import { LoadingState } from '@/components/shared/loading-state';
import { Vehicle } from '@/types/vehicle';
import { Customer } from '@/types/customer';
import { JobCard } from '@/types/job-card';
import { VehiclePhotoUpload } from './vehicle-photo-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatedCommunications } from '@/components/communications/related-communications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CommunicationForm } from '@/components/communications/communication-form';
import { createCommunicationLog } from '@/services/communications-service';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview High-fidelity Vehicle Dossier.
 * Features a responsive tab system for technical specs, history, and forensic communication traces.
 */
export function VehicleDetails({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  // 1. Technical Data Streams (Stabilized)
  const vehicleRef = useMemoFirebase(() => doc(db, 'vehicles', vehicleId), [db, vehicleId]);
  const { data: vehicle, loading: vehLoading } = useDoc<Vehicle>(vehicleRef as any);

  const customerRef = useMemoFirebase(() => vehicle ? doc(db, 'customers', vehicle.customerId) : null, [db, vehicle]);
  const { data: customer, loading: custLoading } = useDoc<Customer>(customerRef as any);

  const repairQuery = useMemoFirebase(() => query(
    collection(db, 'jobCards'), 
    where('vehicleId', '==', vehicleId),
    orderBy('createdAt', 'desc')
  ), [db, vehicleId]);
  const { data: repairHistory, loading: jobLoading } = useCollection<JobCard>(repairQuery as any);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = vehLoading || custLoading || jobLoading;

  const handleLogInteraction = async (data: any) => {
    if (!vehicle || !customer) return;
    setIsSubmitting(true);
    try {
        await createCommunicationLog({
            ...data,
            vehicleId: vehicle.vehicleId,
            customerId: vehicle.customerId,
        }, vehicle.vehicleId); // Using vehicleId as placeholder for current user ID context
        setIsFormOpen(false);
        toast({ title: "Interaction Logged", description: "Technical trace registered for this unit." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Operation Failed", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;

  if (!vehicle) {
    return (
        <div className="p-20 text-center border-2 border-dashed rounded-3xl opacity-40">
            <Car className="h-12 w-12 mx-auto mb-4" />
            <p className="text-sm font-medium italic">Asset not found in technical registry.</p>
            <Button variant="link" onClick={() => router.back()} className="mt-4">Return to Fleet</Button>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      {/* Dossier Header */}
      <div className="bg-muted/30 px-8 py-12 border-b relative overflow-hidden rounded-[2.5rem]">
        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
            <Car className="h-64 w-64" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-32 w-32 rounded-[2rem] bg-primary/10 border-4 border-background flex items-center justify-center shadow-2xl ring-8 ring-primary/5">
                    <Car className="h-16 w-16 text-primary" />
                </div>
                <div className="space-y-3 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Fingerprint className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground">
                            UID: {vehicle.vehicleId.toUpperCase()}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase font-headline leading-none">
                        {vehicle.make} {vehicle.model}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
                        <Badge variant="outline" className="h-8 text-sm font-mono font-black text-primary bg-primary/5 px-4 border-primary/20 rounded-lg shadow-sm">
                            {vehicle.numberPlate}
                        </Badge>
                        <Badge variant={vehicle.status === 'Inactive' ? 'destructive' : 'success'} className="h-8 text-[10px] font-black uppercase tracking-widest px-4 shadow-sm border-none">
                            {vehicle.status || 'Active Duty'}
                        </Badge>
                    </div>
                </div>
            </div>

            <Card className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden border-none min-w-[240px]">
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl" />
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Registration Maturity</p>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xl font-black tracking-tight"><FormattedDate date={vehicle.createdAt} formatString="dd MMM yyyy" /></p>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Enrolled in Fleet</p>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start px-4 sm:px-8">
          <div className="lg:col-span-8 space-y-8">
              <Tabs defaultValue="overview" className="w-full">
                  <div className="bg-card border border-border/50 rounded-2xl p-1.5 mb-8 shadow-sm overflow-x-auto custom-scrollbar">
                      <TabsList className="bg-transparent h-auto gap-1 p-0 flex justify-start w-full min-w-max">
                          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Technical Overview</TabsTrigger>
                          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Maintenance Ledger</TabsTrigger>
                          <TabsTrigger value="communications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Related Communication</TabsTrigger>
                      </TabsList>
                  </div>

                  <TabsContent value="overview" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                      {/* Technical Specifications */}
                      <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                              <div className="flex items-center gap-3 text-muted-foreground">
                                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                      <ShieldCheck className="h-4 w-4" />
                                  </div>
                                  <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Registry Parameters</h3>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest gap-2">
                                  <ArrowLeft className="h-3 w-3" /> Back to registry
                              </Button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6 bg-muted/10 p-8 rounded-[2.5rem] border border-border/50">
                              <div className="space-y-6">
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">VIN / Chassis Number</label>
                                      <p className="text-sm font-mono font-bold flex items-center gap-2">
                                          <Fingerprint className="h-4 w-4 text-primary" />
                                          {vehicle.vin?.toUpperCase() || vehicle.chassisNumber?.toUpperCase() || 'UNRECORDED_TELEMETRY'}
                                      </p>
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Odometer Telemetry</label>
                                      <p className="text-sm font-bold flex items-center gap-2">
                                          <Gauge className="h-4 w-4 text-primary" />
                                          {vehicle.mileage?.toLocaleString() || 0} KM
                                      </p>
                                  </div>
                              </div>
                              <div className="space-y-6">
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fuel Configuration</label>
                                      <p className="text-sm font-bold flex items-center gap-2">
                                          <Fuel className="h-4 w-4 text-primary" />
                                          {vehicle.fuelLevel || 'Not Calibrated'}
                                      </p>
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manufacturing Cycle</label>
                                      <p className="text-sm font-bold flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-indigo-500" />
                                          Year {vehicle.year || 'N/A'}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Technical Imagery */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-muted-foreground px-2">
                            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                <Camera className="h-4 w-4" />
                            </div>
                            <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Technical Imagery Registry</h3>
                        </div>
                        <VehiclePhotoUpload vehicleId={vehicleId} />
                      </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-muted-foreground px-2">
                            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                <History className="h-4 w-4" />
                            </div>
                            <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Maintenance History</h3>
                        </div>
                        
                        <div className="space-y-3">
                            {repairHistory && repairHistory.length > 0 ? (
                                repairHistory.map((job) => (
                                    <div 
                                        key={job.jobCardId} 
                                        className="group relative flex items-center justify-between p-5 rounded-2xl border border-border/50 hover:border-primary/40 bg-card transition-all cursor-pointer shadow-sm"
                                        onClick={() => router.push(`/job-cards/${job.jobCardId}`)}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
                                                <Wrench className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-md">
                                                    {job.reportedIssue}
                                                </p>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> <FormattedDate date={job.createdAt} formatString="dd MMM yyyy" /></span>
                                                    <span>•</span>
                                                    <span>ID: {job.jobCardId.slice(-6)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <JobStatusBadge status={job.status} className="text-[8px]" />
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-40">
                                    <ClipboardList className="h-10 w-10 mx-auto mb-3" />
                                    <p className="text-sm font-medium italic">No certified repair cycles detected for this unit.</p>
                                </div>
                            )}
                        </div>
                      </div>
                  </TabsContent>

                  <TabsContent value="communications" className="space-y-10 focus-visible:outline-none animate-in fade-in duration-500">
                      <RelatedCommunications 
                        vehicleId={vehicleId} 
                        onLogInteraction={() => setIsFormOpen(true)}
                      />
                  </TabsContent>
              </Tabs>
          </div>

          {/* Operational Context Sidebar */}
          <div className="lg:col-span-4 space-y-8">
              {/* Owner Card */}
              <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card premium-shadow">
                  <CardHeader className="bg-muted/30 border-b py-6 px-8">
                      <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Certified Ownership</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                      <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 ring-4 ring-primary/5">
                              <AvatarFallback className="font-black text-xl bg-primary/10 text-primary uppercase">
                                  {customer?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                              <p className="text-base font-black uppercase tracking-tight">{customer?.fullName || 'Registry Void'}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                  <ShieldCheck className="h-3 w-3 text-green-500" /> Verified Client
                              </p>
                          </div>
                      </div>
                      
                      <div className="space-y-4 pt-2">
                          <div className="space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Contact Authority</p>
                              <p className="text-sm font-bold">{customer?.phone || 'NO_CONTACT_DATA'}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Billing Reach</p>
                              <p className="text-sm font-bold truncate">{customer?.email || 'NO_DIGITAL_ADDRESS'}</p>
                          </div>
                      </div>
                      
                      <Separator className="opacity-50" />
                      
                      <Button 
                        variant="outline" 
                        className="w-full h-11 font-black uppercase tracking-widest text-[10px] rounded-xl bg-background"
                        onClick={() => customer && router.push(`/customers/${customer.customerId}`)}
                        disabled={!customer}
                      >
                          View Owner Profile
                      </Button>
                  </CardContent>
              </Card>

              {/* Physical Condition */}
              {vehicle.conditionNotes && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground px-2">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-foreground">Condition Alerts</h3>
                    </div>
                    <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-[2rem] relative overflow-hidden">
                        <p className="text-xs font-medium leading-relaxed italic text-orange-900/70 relative z-10">
                            &quot;{vehicle.conditionNotes}&quot;
                        </p>
                        <AlertCircle className="absolute -right-4 -bottom-4 h-16 w-16 text-orange-500/5" />
                    </div>
                </div>
              )}

              <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl relative overflow-hidden group">
                  <Activity className="absolute -right-4 -bottom-4 h-16 w-16 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                      <Activity className="h-3 w-3" /> Technical Pulse
                  </h4>
                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                      Telemetry data active. Last maintenance cycle synced successfully with the workshop Os.
                  </p>
              </div>
          </div>
      </div>
      
      <div className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center">
          <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] text-center">Makros System Technical Directory • Vehicle Reference Classified</p>
      </div>

      {/* Interaction Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[640px] p-0 border-border/50 overflow-hidden rounded-3xl shadow-2xl">
              <DialogHeader className="p-8 border-b bg-muted/30">
                  <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                          <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Log Interaction</DialogTitle>
                          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Record a technical conversation trace for this vehicle.</DialogDescription>
                      </div>
                  </div>
              </DialogHeader>
              <CommunicationForm 
                  onSubmit={handleLogInteraction} 
                  isSubmitting={isSubmitting} 
                  initialData={{
                      vehicleId: vehicle.vehicleId,
                      customerId: vehicle.customerId,
                      direction: 'Internal',
                      channel: 'Internal Note',
                      subject: `Technical note for ${vehicle.numberPlate}`,
                      module: 'Job Card'
                  } as any}
              />
          </DialogContent>
      </Dialog>
    </div>
  );
}