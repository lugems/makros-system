'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DialogBody, DialogFooter } from '@/components/ui/dialog';
import { 
  Tag, 
  Activity, 
  AlertTriangle, 
  ArrowRightLeft, 
  ShieldCheck, 
  Loader2,
  Lock,
  Link as LinkIcon,
  Calendar,
  Layers,
  User
} from 'lucide-react';
import { 
  CommunicationLog, 
  CommunicationChannel, 
  CommunicationDirection, 
  CommunicationPriority, 
  CommunicationStatus,
  CommunicationModule
} from '@/types/communication';
import { useAuth } from '@/contexts/auth-context';

interface CommunicationFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  initialData?: CommunicationLog | null;
}

const CHANNELS: CommunicationChannel[] = ["In-App", "Phone Call", "SMS", "WhatsApp", "Email", "Walk-In", "Internal Note"];
const DIRECTIONS: CommunicationDirection[] = ["Internal", "Incoming", "Outgoing"];
const PRIORITIES: CommunicationPriority[] = ["Low", "Normal", "High", "Urgent"];
const STATUSES: CommunicationStatus[] = ["Open", "Pending Response", "Resolved", "Closed"];
const MODULES: CommunicationModule[] = ["General", "Job Card", "Invoicing", "Inventory", "Staff"];

export function CommunicationForm({ onSubmit, isSubmitting, initialData }: CommunicationFormProps) {
  const { role: currentRole } = useAuth();

  // Role-based defaults for modules
  const getInitialModule = (): CommunicationModule => {
      if (currentRole === 'Mechanic') return 'Job Card';
      if (currentRole === 'Accountant') return 'Invoicing';
      if (currentRole === 'Inventory Officer') return 'Inventory';
      return 'General';
  };

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    channel: 'In-App' as CommunicationChannel,
    direction: 'Internal' as CommunicationDirection,
    priority: 'Normal' as CommunicationPriority,
    status: 'Open' as CommunicationStatus,
    module: getInitialModule(),
    customerId: '',
    vehicleId: '',
    jobCardId: '',
    invoiceId: '',
    paymentId: '',
    toUserId: '',
    toRole: '' as any,
    toName: '',
    requiresFollowUp: false,
    followUpDate: '',
    isCustomerVisible: false,
    isInternalOnly: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        subject: initialData.subject || '',
        message: initialData.message || '',
        channel: initialData.channel || 'In-App',
        direction: initialData.direction || 'Internal',
        priority: initialData.priority || 'Normal',
        status: initialData.status || 'Open',
        module: initialData.module || 'General',
        customerId: initialData.customerId || '',
        vehicleId: initialData.vehicleId || '',
        jobCardId: initialData.jobCardId || '',
        invoiceId: initialData.invoiceId || '',
        paymentId: initialData.paymentId || '',
        toUserId: initialData.toUserId || '',
        toRole: initialData.toRole || '',
        toName: initialData.toName || '',
        requiresFollowUp: initialData.requiresFollowUp || false,
        followUpDate: initialData.followUpDate || '',
        isCustomerVisible: initialData.isCustomerVisible || false,
        isInternalOnly: initialData.isInternalOnly ?? true
      });
    }
  }, [initialData]);

  // Automated policy enforcement based on direction
  useEffect(() => {
      if (formData.direction === 'Internal') {
          setFormData(prev => ({ ...prev, isInternalOnly: true, isCustomerVisible: false }));
      } else if (formData.direction === 'Outgoing') {
          setFormData(prev => ({ ...prev, isCustomerVisible: true, isInternalOnly: false }));
      }
  }, [formData.direction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DialogBody>
        <div className="space-y-8 px-6 pb-6 pt-2">
          {/* Header Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                      <Tag className="h-3 w-3 text-primary" /> Subject Header
                  </Label>
                  <Input 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Engine Calibration Feedback"
                      className="h-12 rounded-xl bg-muted/30 border-none font-bold text-sm"
                      required
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                      <Layers className="h-3 w-3 text-primary" /> Technical Module
                  </Label>
                  <Select value={formData.module} onValueChange={(val: any) => setFormData({ ...formData, module: val })}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold text-xs uppercase">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                          {MODULES.map(m => <SelectItem key={m} value={m} className="text-[10px] font-bold uppercase">{m}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Protocol</Label>
              <Select value={formData.channel} onValueChange={(val: any) => setFormData({ ...formData, channel: val })}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none font-bold text-[10px] uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CHANNELS.map(c => <SelectItem key={c} value={c} className="text-[10px] font-bold uppercase">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Flow</Label>
              <Select value={formData.direction} onValueChange={(val: any) => setFormData({ ...formData, direction: val })}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none font-bold text-[10px] uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DIRECTIONS.map(d => <SelectItem key={d} value={d} className="text-[10px] font-bold uppercase">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Priority</Label>
              <Select value={formData.priority} onValueChange={(val: any) => setFormData({ ...formData, priority: val })}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none font-bold text-[10px] uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-[10px] font-bold uppercase">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
              <Select value={formData.status} onValueChange={(val: any) => setFormData({ ...formData, status: val })}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none font-bold text-[10px] uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {STATUSES.map(s => <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Interaction Content</Label>
            <Textarea 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Record forensic details of the communication..."
              className="min-h-[120px] rounded-2xl bg-muted/30 border-none resize-none p-5 text-sm font-medium leading-relaxed"
              required
            />
          </div>

          {/* Recipient Context */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground ml-1">
              <User className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Recipient Authority</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-muted-foreground">Recipient Name</Label>
                    <Input 
                        value={formData.toName}
                        onChange={(e) => setFormData({ ...formData, toName: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="h-10 rounded-lg bg-muted/10 border-border/50 font-bold text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-muted-foreground">Recipient Role</Label>
                    <Select value={formData.toRole} onValueChange={(val) => setFormData({ ...formData, toRole: val })}>
                        <SelectTrigger className="h-10 rounded-lg bg-muted/10 border-border/50 font-bold text-xs">
                            <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                            {["Workshop Manager", "Mechanic", "Accountant", "Customer", "Receptionist", "Inventory Officer", "System Owner"].map(r => (
                                <SelectItem key={r} value={r} className="text-xs font-bold uppercase">{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>

          {/* Dossier Linkage */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground ml-1">
              <LinkIcon className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Registry Association</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/10 p-5 rounded-2xl border border-border/50">
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-muted-foreground">Job Card ID</Label>
                <Input 
                  value={formData.jobCardId}
                  onChange={(e) => setFormData({ ...formData, jobCardId: e.target.value })}
                  placeholder="JC-XXXXX"
                  className="h-10 rounded-lg bg-background border-border/50 font-mono text-[10px] uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-muted-foreground">Invoice ID</Label>
                <Input 
                  value={formData.invoiceId}
                  onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                  placeholder="INV-XXXXX"
                  className="h-10 rounded-lg bg-background border-border/50 font-mono text-[10px] uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase text-muted-foreground">Customer ID</Label>
                <Input 
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  placeholder="CUST-XXXXX"
                  className="h-10 rounded-lg bg-background border-border/50 font-mono text-[10px] uppercase"
                />
              </div>
            </div>
          </div>

          {/* Governance Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    <Label className="text-[10px] font-black uppercase tracking-widest">Internal Only</Label>
                </div>
                <p className="text-[8px] text-muted-foreground uppercase">Hide from client portal</p>
              </div>
              <Switch 
                checked={formData.isInternalOnly} 
                onCheckedChange={(val) => setFormData({ ...formData, isInternalOnly: val, isCustomerVisible: !val })} 
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-primary" />
                    <Label className="text-[10px] font-black uppercase tracking-widest">Follow-Up Target</Label>
                </div>
                <p className="text-[8px] text-muted-foreground uppercase">Flag for personnel action</p>
              </div>
              <Switch 
                checked={formData.requiresFollowUp} 
                onCheckedChange={(val) => setFormData({ ...formData, requiresFollowUp: val })} 
              />
            </div>
          </div>
          
          {formData.requiresFollowUp && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-primary" /> Required Action Date
              </Label>
              <Input 
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="h-11 rounded-xl bg-muted/30 border-none font-bold text-center"
              />
            </div>
          )}
        </div>
      </DialogBody>

      <DialogFooter className="p-8 border-t bg-muted/10">
        <Button type="submit" disabled={isSubmitting} className="w-full h-14 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 rounded-2xl text-xs transition-all hover:scale-[1.01]">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <><ShieldCheck className="h-4 w-4 mr-2" /> Commit Interaction Trace</>}
        </Button>
      </DialogFooter>
    </form>
  );
}
