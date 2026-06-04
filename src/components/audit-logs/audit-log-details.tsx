'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { AuditLog } from '@/types/audit-log';
import { StaffMember } from '@/types/staff';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormattedDate } from '@/components/shared/formatted-date';
import { AuditActionBadge } from './audit-action-badge';
import { ShieldCheck, Fingerprint, Clock, User, Globe, Laptop, Database, ArrowRight, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditLogDetailsProps {
  log: AuditLog | null;
  user?: StaffMember;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * @fileOverview A professional system trace dossier for auditing individual log entries.
 */
export function AuditLogDetails({ log, user, isOpen, onClose }: AuditLogDetailsProps) {
  const { toast } = useToast();
  if (!log) return null;
  
  const id = (log as any).id || log.logId;

  const handleCopy = (text: string, subject: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${subject} Copied`,
      description: `The ${subject.toLowerCase()} has been copied to your clipboard.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-2xl border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Fingerprint className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-muted-foreground truncate max-w-[180px] sm:max-w-none">ID: {id?.toUpperCase()}</span>
                </div>
                <DialogTitle className="text-xl font-black uppercase tracking-tight">System Trace Dossier</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 sm:pl-16">
            Certified Forensic Record • Immutable Log Entry
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="p-6 space-y-8">
              {/* Event Summary */}
              <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Technical Description</p>
                          <h3 className="text-lg font-black leading-relaxed">{log.description}</h3>
                      </div>
                      <AuditActionBadge action={log.action} className="h-7 px-4 text-xs" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-foreground">Initiator</h4>
                      </div>
                      <div className="pl-6 space-y-1">
                          <p className="text-sm font-black uppercase">{user?.fullName || 'System Process'}</p>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase">{log.userId}</p>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-foreground">Temporal Data</h4>
                      </div>
                      <div className="pl-6 space-y-1">
                          <p className="text-sm font-black uppercase">
                            <FormattedDate date={log.createdAt} formatString="dd MMMM yyyy" />
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase">
                            <FormattedDate date={log.createdAt} formatString="HH:mm:ss.SSS 'UTC'" />
                          </p>
                      </div>
                  </div>
              </div>

              <Separator className="opacity-50" />

              {/* Technical Context */}
              <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-foreground">Client Environment</h4>
                  </div>
                  <div className="pl-6 grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                              <Laptop className="h-2.5 w-2.5" /> User Agent
                          </p>
                          <p className="text-[10px] font-medium leading-relaxed truncate">{log.userAgent || 'Technical Reference Unavailable'}</p>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                              <Globe className="h-2.5 w-2.5" /> Network IP
                          </p>
                          <p className="text-[10px] font-mono font-bold">{log.ipAddress || 'Authorized Terminal Loop'}</p>
                      </div>
                  </div>
              </div>
              
              <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Database className="h-3.5 w-3.5" />
                      <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-foreground">Target Record</h4>
                  </div>
                  <div className="pl-6 flex items-center gap-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                      <p className="text-sm font-mono font-bold text-primary flex-1">{log.recordId || 'NO_RECORD_ID'}</p>
                      <Button variant="ghost" size="icon" onClick={() => log.recordId && handleCopy(log.recordId, 'Record ID')}>
                          <Copy className="h-4 w-4" />
                      </Button>
                  </div>
              </div>

              {/* Data Delta Placeholder */}
              {log.changedFields && log.changedFields.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Database className="h-3.5 w-3.5" />
                        <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-foreground">Mutation Delta</h4>
                    </div>
                    <div className="pl-6 space-y-3">
                        {log.changedFields.map((field, idx) => (
                            <div key={idx} className="bg-muted/20 rounded-2xl border border-border/50 overflow-hidden">
                                <div className="bg-muted/30 px-4 py-2 border-b flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{field.field}</span>
                                    <Badge variant="outline" className="text-[8px] font-bold border-primary/20 text-primary">Modified Field</Badge>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    <div className="md:col-span-5 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                                        <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-1">Previous State</p>
                                        <code className="text-[10px] font-mono block break-all text-red-900/70">{JSON.stringify(field.oldValue)}</code>
                                    </div>
                                    <div className="md:col-span-2 flex justify-center">
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                                    </div>
                                    <div className="md:col-span-5 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                                        <p className="text-[8px] font-black text-green-600 uppercase tracking-widest mb-1">New State</p>
                                        <code className="text-[10px] font-mono block break-all text-green-900">{JSON.stringify(field.newValue)}</code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}
          </div>
        </DialogBody>

        <DialogFooter className="p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
             <Button variant="ghost" onClick={() => handleCopy(JSON.stringify(log, null, 2), 'Trace JSON')} className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest flex items-center gap-2 rounded-xl">
                <Copy className="h-3 w-3" />
                Export Trace JSON
            </Button>
            <Button onClick={onClose} className="w-full sm:w-auto h-12 px-8 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]">
                Close Dossier
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
