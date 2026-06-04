
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
    MessageSquare, 
    Loader2, 
    Tag, 
    FileText, 
    Activity, 
    AlertTriangle, 
    ArrowRightLeft,
    EyeOff,
    Users
} from 'lucide-react';
import { createNotification } from '@/services/notifications-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { 
    CommunicationLog, 
    CommunicationChannel, 
    CommunicationDirection, 
    CommunicationPriority,
    CommunicationStatus 
} from '@/types/notification';

interface NewNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHANNELS: CommunicationChannel[] = ["In-App", "Phone Call", "SMS", "WhatsApp", "Email", "Walk-In", "Internal Note"];
const DIRECTIONS: CommunicationDirection[] = ["Internal", "Incoming", "Outgoing"];
const PRIORITIES: CommunicationPriority[] = ["Low", "Normal", "High", "Urgent"];

export function NewNotificationDialog({ isOpen, onOpenChange }: NewNotificationDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    channel: 'In-App' as CommunicationChannel,
    direction: 'Internal' as CommunicationDirection,
    priority: 'Normal' as CommunicationPriority,
    status: 'Open' as CommunicationStatus,
    customerId: '',
    vehicleId: '',
    jobCardId: '',
    invoiceId: '',
    paymentId: '',
    toUserId: '',
    requiresFollowUp: false,
    followUpDate: '',
    isCustomerVisible: false,
    isInternalOnly: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await createNotification(formData, user.userId);
      toast({ title: "Interaction Registered", description: "Dossier trace synchronized with master registry." });
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Trace Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
        subject: '',
        message: '',
        channel: 'In-App',
        direction: 'Internal',
        priority: 'Normal',
        status: 'Open',
        customerId: '',
        vehicleId: '',
        jobCardId: '',
        invoiceId: '',
        paymentId: '',
        toUserId: '',
        requiresFollowUp: false,
        followUpDate: '',
        isCustomerVisible: false,
        isInternalOnly: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] flex-col overflow-hidden p-0 sm:max-w-[640px] border-border/50 bg-background rounded-3xl shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-4 text-left border-b bg-muted/30">
          <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">Register Interaction</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">Forensic communication trace registry entry.</DialogDescription>
              </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <div className="space-y-8 px-8 py-6">
              {/* Primary Identity */}
              <div className="space-y-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                            <Activity className="h-3 w-3 text-primary" /> Protocol
                        </Label>
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
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                            <ArrowRightLeft className="h-3 w-3 text-primary" /> Flow
                        </Label>
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
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                            <AlertTriangle className="h-3 w-3 text-orange-500" /> Priority
                        </Label>
                        <Select value={formData.priority} onValueChange={(val: any) => setFormData({ ...formData, priority: val })}>
                            <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none font-bold text-[10px] uppercase">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-[10px] font-bold uppercase">{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
              </div>

              {/* Linking Matrix */}
              <div className="grid grid-cols-2 gap-4 bg-muted/10 p-5 rounded-2xl border border-border/50">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Job Card Ref</Label>
                  <Input 
                    value={formData.jobCardId}
                    onChange={(e) => setFormData({ ...formData, jobCardId: e.target.value })}
                    placeholder="JC-XXXXX"
                    className="h-10 rounded-lg bg-background border-border/50 font-mono text-[10px] uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Invoice Ref</Label>
                  <Input 
                    value={formData.invoiceId}
                    onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                    placeholder="INV-XXXXX"
                    className="h-10 rounded-lg bg-background border-border/50 font-mono text-[10px] uppercase"
                  />
                </div>
              </div>

              {/* Message Payload */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                  <FileText className="h-3 w-3 text-primary" /> Interaction Content
                </Label>
                <Textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Record forensic details of the communication..."
                  className="min-h-[120px] rounded-2xl bg-muted/30 border-none resize-none p-5 text-sm font-medium leading-relaxed"
                  required
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                      <div className="space-y-0.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest">Internal Only</Label>
                          <p className="text-[8px] text-muted-foreground uppercase">Hide from client portal</p>
                      </div>
                      <Switch 
                          checked={formData.isInternalOnly} 
                          onCheckedChange={(val) => setFormData({ ...formData, isInternalOnly: val, isCustomerVisible: !val })} 
                      />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                      <div className="space-y-0.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest">Follow-Up Required</Label>
                          <p className="text-[8px] text-muted-foreground uppercase">Mark for personnel attention</p>
                      </div>
                      <Switch 
                          checked={formData.requiresFollowUp} 
                          onCheckedChange={(val) => setFormData({ ...formData, requiresFollowUp: val })} 
                      />
                  </div>
              </div>
              
              {formData.requiresFollowUp && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Follow-Up Date</Label>
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
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <><ShieldCheck className="h-4 w-4 mr-2" /> Commit to Master Registry</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
