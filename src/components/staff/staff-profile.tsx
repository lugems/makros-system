'use client';

import React, { useMemo, useState, useRef } from 'react';
import { StaffMember } from "@/types/staff";
import { JobCard, JobCardStatus } from "@/types/job-card";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Query, doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RoleBadge } from "./role-badge";
import { FormattedDate } from "@/components/shared/formatted-date";
import { 
    Activity, 
    Zap, 
    Wrench, 
    ShieldCheck, 
    Fingerprint, 
    TrendingUp,
    ArrowLeft,
    Mail as MailIcon,
    Phone as PhoneIcon,
    Clock,
    ClipboardList,
    Plus,
    History,
    ChevronRight,
    CheckCircle2,
    Pencil,
    Loader2,
    Key,
    Lock,
    Eye,
    EyeOff,
    AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { LoadingState } from '@/components/shared/loading-state';
import { JobStatusBadge } from '@/components/job-cards/job-status-badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { uploadStaffPhoto } from '@/lib/storage-service';
import { updateStaffRecord } from '@/services/users-service';
import { updatePassword } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StaffProfileProps {
  staff: StaffMember;
}

/**
 * @fileOverview High-fidelity Personnel Dossier & Workflow Terminal.
 * Features Real-time Bay Load monitoring, Credential Management, and Profile Imagery.
 */
export function StaffProfile({ staff }: StaffProfileProps) {
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser, firebaseUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for Imagery Sync
  const [isUploading, setIsUploading] = useState(false);

  // State for Credential Sync
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // 1. Technical Output Stream (Stabilized)
  const jobsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
        collection(db, 'jobCards'), 
        where('assignedMechanicId', '==', staff.userId),
        orderBy('createdAt', 'desc')
    ) as Query<JobCard>;
  }, [db, staff.userId]);
  
  const { data: jobHistory, loading: jobsLoading } = useCollection<JobCard>(jobsQuery);

  const activeJobs = useMemo(() => {
    if (!jobHistory) return [];
    return jobHistory.filter(j => !['Completed', 'Cancelled', 'Delivered', 'Paid', 'Invoiced'].includes(j.status));
  }, [jobHistory]);

  const completedJobs = useMemo(() => {
    if (!jobHistory) return [];
    return jobHistory.filter(j => ['Completed', 'Invoiced', 'Paid', 'Delivered'].includes(j.status));
  }, [jobHistory]);

  const isMechanic = staff.role === 'Mechanic';
  const MAX_CAPACITY = 5; 
  const workloadPercentage = isMechanic ? Math.min((activeJobs.length / MAX_CAPACITY) * 100, 100) : 0;

  const getCapacityStatus = (pct: number) => {
      if (pct === 0) return { label: 'AVAILABLE', color: 'bg-green-500' };
      if (pct <= 40) return { label: 'OPTIMAL', color: 'bg-green-500' };
      if (pct <= 80) return { label: 'BUSY', color: 'bg-orange-500' };
      return { label: 'CRITICAL', color: 'bg-red-500' };
  };

  const status = getCapacityStatus(workloadPercentage);

  const canEditProfile = useMemo(() => {
    return currentUser?.userId === staff.userId || ['Makros System Owner', 'Workshop Manager'].includes(currentUser?.role || '');
  }, [currentUser, staff.userId]);

  const isSelf = currentUser?.userId === staff.userId;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    try {
        const downloadUrl = await uploadStaffPhoto(staff.userId, file);
        await updateStaffRecord(staff.userId, { photoUrl: downloadUrl }, currentUser.userId);
        toast({ title: "Registry Updated", description: "Personnel profile imagery synchronized successfully." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Sync Failed", description: error.message || "Failed to update profile imagery." });
    } finally {
        setIsUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !isSelf) return;

    if (newPassword !== confirmPassword) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "The provided access tokens do not match.",
        });
        return;
    }

    if (newPassword.length < 6) {
        toast({
            variant: "destructive",
            title: "Security Violation",
            description: "Access token must be at least 6 characters in length.",
        });
        return;
    }

    setIsPasswordLoading(true);
    try {
        await updatePassword(firebaseUser, newPassword);
        toast({
            title: "Credentials Synchronized",
            description: "Your master access token has been updated successfully.",
        });
        setNewPassword('');
        setConfirmPassword('');
    } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            toast({
                variant: "destructive",
                title: "Session Matured",
                description: "For security, this action requires a fresh login session. Please re-authenticate.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Sync Failed",
                description: error.message || "An unexpected error occurred during credential update.",
            });
        }
    } finally {
        setIsPasswordLoading(false);
    }
  };

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  if (jobsLoading) return <LoadingState />;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <Button variant="ghost" size="sm" onClick={() => router.push('/staff')} className="-ml-3 h-8 text-[10px] font-black uppercase tracking-widest gap-2 opacity-40 hover:opacity-100">
                <ArrowLeft className="h-3 w-3" /> Back to Force
            </Button>
            <h1 className="text-4xl font-black uppercase tracking-tighter font-headline">Personnel Dossier</h1>
        </div>
        {isMechanic && (
            <Link href={`/job-cards/new?mechanicId=${staff.userId}`}>
                <Button className="h-12 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 gap-3">
                    <Plus className="h-4 w-4" /> Schedule bay load
                </Button>
            </Link>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Identity Column */}
          <div className="lg:col-span-4 space-y-6">
              <Card className="rounded-[2rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow">
                  <CardHeader className="bg-muted/30 p-8 border-b flex flex-row items-center gap-6">
                      <div className="relative group">
                          <Avatar className="h-20 w-20 ring-4 ring-primary/5 shadow-xl transition-all group-hover:opacity-80">
                              <AvatarImage src={staff.photoUrl || `https://picsum.photos/seed/${staff.userId}/300/300`} />
                              <AvatarFallback className="font-black text-2xl bg-primary text-white">{staff.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {canEditProfile && (
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                              >
                                {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Pencil className="h-6 w-6 text-white" />}
                              </button>
                          )}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handlePhotoUpload}
                          />
                      </div>
                      <div className="space-y-1.5">
                          <h2 className="text-2xl font-black uppercase tracking-tight leading-none">{staff.fullName}</h2>
                          <RoleBadge role={staff.role} className="h-5 px-2 text-[8px]" />
                      </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em]">Technical Specialization</h4>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <p className="text-sm font-black uppercase text-foreground">{staff.specialization || 'General Technical Services'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                              <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">In-Bay</p>
                              <p className="text-2xl font-black">{activeJobs.length}</p>
                          </div>
                          <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Lifetime</p>
                              <p className="text-2xl font-black">{completedJobs.length}</p>
                          </div>
                      </div>

                      <Separator className="opacity-50" />

                      <div className="space-y-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                              <Fingerprint className="h-3 w-3" />
                              <h4 className="text-[9px] font-black uppercase tracking-[0.2em]">Registry UID</h4>
                          </div>
                          <code className="block text-[10px] font-mono bg-muted/50 p-3 rounded-xl border font-bold text-center uppercase tracking-tighter truncate">
                              {staff.userId}
                          </code>
                      </div>
                  </CardContent>
              </Card>

              <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl relative overflow-hidden group">
                  <ShieldCheck className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Service Fidelity</h4>
                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic">
                      Personnel identity is verified. Technical certifications are current and logged in the master workshop Os.
                  </p>
              </div>
          </div>

          {/* Workflow & Operations Column */}
          <div className="lg:col-span-8 space-y-8">
              <Tabs defaultValue="overview" className="w-full">
                  <div className="bg-card border border-border/50 rounded-2xl p-1.5 mb-8 shadow-sm">
                      <TabsList className="bg-transparent h-auto gap-1 p-0 flex justify-start">
                          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all">Overview</TabsTrigger>
                          <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all">Active Bay Load ({activeJobs.length})</TabsTrigger>
                          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all">Completion Trace</TabsTrigger>
                      </TabsList>
                  </div>

                  <TabsContent value="overview" className="space-y-8 focus-visible:outline-none animate-in fade-in duration-500">
                      <Card className="rounded-[2rem] border-border/50 bg-card overflow-hidden shadow-sm">
                          <CardHeader className="p-8 border-b flex flex-row items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <Activity className="h-4 w-4 text-primary" />
                                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Capacity Utilization</CardTitle>
                              </div>
                              <Badge className={cn("text-[9px] font-black px-4 py-1 border-none", status.color, "text-white")}>
                                  {status.label}
                              </Badge>
                          </CardHeader>
                          <CardContent className="p-8 space-y-10">
                              <div className="space-y-4">
                                  <div className="flex justify-between items-end">
                                      <div className="space-y-1">
                                          <p className="text-5xl font-black tracking-tighter leading-none">{workloadPercentage.toFixed(0)}%</p>
                                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Technician Throughput index</p>
                                      </div>
                                  </div>
                                  <Progress value={workloadPercentage} className="h-4 rounded-full bg-muted shadow-inner" />
                                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic">
                                      Currently occupying {activeJobs.length} of {MAX_CAPACITY} optimized work slots. Load metrics ensure technical precision and safety.
                                  </p>
                              </div>

                              <Separator className="opacity-50" />

                              <div className="space-y-4">
                                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Registry Communications</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-muted/5 group hover:bg-muted/10 transition-colors">
                                          <div className="h-9 w-9 rounded-xl bg-background border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                              <MailIcon className="h-4 w-4" />
                                          </div>
                                          <span className="text-xs font-bold truncate">{staff.email}</span>
                                      </div>
                                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-muted/5 group hover:bg-muted/10 transition-colors">
                                          <div className="h-9 w-9 rounded-xl bg-background border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                              <PhoneIcon className="h-4 w-4" />
                                          </div>
                                          <span className="text-xs font-bold">{staff.phone}</span>
                                      </div>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>

                      {/* Security & Access Management - Only for self */}
                      {isSelf && (
                        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                          <CardHeader className="bg-muted/30 border-b p-8">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                              <Key className="h-4 w-4 text-primary" /> Security & Access Management
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-8">
                            <form onSubmit={handlePasswordChange} className="space-y-8 max-w-xl">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                                    New Access Token
                                  </Label>
                                  <div className="relative">
                                    <Input 
                                      type={showPassword ? "text" : "password"}
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      className="h-12 bg-muted/30 border-border/50 rounded-xl font-bold pr-11"
                                      placeholder="••••••••"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                                    Verify Token
                                  </Label>
                                  <div className="relative">
                                    <Input 
                                      type={showPassword ? "text" : "password"}
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      className={cn(
                                        "h-12 bg-muted/30 border-border/50 rounded-xl font-bold pr-11",
                                        confirmPassword && !passwordsMatch && "border-destructive/50"
                                      )}
                                      placeholder="••••••••"
                                      required
                                    />
                                    {passwordsMatch && (
                                      <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
                                        <CheckCircle2 className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                <div className="flex items-start gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Protocol Notice</p>
                                    <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground">
                                      Tokens must be at least 6 characters. Updates require a verified session.
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  type="submit" 
                                  disabled={isPasswordLoading || !passwordsMatch || newPassword.length < 6}
                                  className="w-full sm:w-auto h-12 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20"
                                >
                                  {isPasswordLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                  Update Master Key
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      )}

                      <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group border-none">
                        <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Registry Heartbeat</h4>
                        <p className="text-sm font-black text-white">
                            <FormattedDate date={staff.updatedAt} formatString="dd MMMM yyyy • HH:mm" />
                        </p>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Last System Synchronization</p>
                      </div>
                  </TabsContent>

                  <TabsContent value="active" className="space-y-4 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid gap-4">
                        {activeJobs.length > 0 ? activeJobs.map(job => (
                            <button 
                                key={job.jobCardId}
                                onClick={() => router.push(`/job-cards/${job.jobCardId}`)}
                                className="w-full flex items-center justify-between p-6 rounded-[2rem] border border-border/50 bg-card hover:border-primary/40 transition-all group text-left"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <Wrench className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Fingerprint className="h-3 w-3 text-primary opacity-40" />
                                            <span className="text-[9px] font-mono font-black uppercase text-muted-foreground tracking-widest">#{job.jobCardId.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none">
                                            {job.reportedIssue.length > 60 ? `${job.reportedIssue.slice(0, 60)}...` : job.reportedIssue}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <JobStatusBadge status={job.status} className="text-[8px] h-6 px-3" />
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                </div>
                            </button>
                        )) : (
                            <div className="py-32 text-center border-2 border-dashed rounded-[2.5rem] opacity-30 flex flex-col items-center justify-center space-y-4">
                                <ClipboardList className="h-12 w-12" />
                                <p className="text-sm font-medium italic">No active operations in current technical load.</p>
                            </div>
                        )}
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="divide-y divide-border/50">
                            {completedJobs.length > 0 ? completedJobs.map(job => (
                                <div 
                                    key={job.jobCardId} 
                                    className="p-6 flex items-center justify-between hover:bg-muted/20 transition-all group cursor-pointer"
                                    onClick={() => router.push(`/job-cards/${job.jobCardId}`)}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="h-10 w-10 rounded-xl bg-green-500/5 flex items-center justify-center border border-green-500/10 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                                                {job.reportedIssue.slice(0, 50)}...
                                            </p>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                                                <span><FormattedDate date={job.createdAt} formatString="dd MMM yyyy" /></span>
                                                <span className="opacity-30">•</span>
                                                <span>Ref: {job.jobCardId.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] font-black uppercase opacity-60 px-3 py-1 rounded-lg">Verified Closed</Badge>
                                </div>
                            )) : (
                                <div className="p-20 text-center opacity-30 italic text-sm">
                                    No historical repair traces registered.
                                </div>
                            )}
                        </div>
                    </div>
                  </TabsContent>
              </Tabs>
          </div>
      </div>
      
      <footer className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center rounded-[2.5rem]">
          <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.5em]">Makros System Personnel Intelligence • Internal Reference Classified</p>
      </footer>
    </div>
  );
}