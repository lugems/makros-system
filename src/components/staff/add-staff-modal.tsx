'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StaffForm } from '@/components/staff/staff-form';
import { StaffMember } from '@/types/staff';
import { Plus, Key, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddStaffModalProps {
  onAdd: (staff: Partial<StaffMember>) => Promise<void> | void;
}

export function AddStaffModal({ onAdd }: AddStaffModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<{ password: string; name: string } | null>(null);
  const [formData, setFormData] = useState<Partial<StaffMember>>({});
  const [hasCopied, setHasCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEnrollmentResult(null);
      setFormData({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Generate a secure temporary password
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const password = Array.from(window.crypto.getRandomValues(new Uint32Array(12)))
      .map((v) => charset[v % charset.length])
      .join("");

    try {
      // Trigger enrollment with the generated password
      await onAdd({ ...formData, password } as any);
      
      setEnrollmentResult({ password, name: formData.fullName || '' });
      
      // Attempt auto-copy
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(password);
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 3000);
        } catch {
          console.warn("Auto-copy blocked by browser policy.");
        }
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Enrollment Failed", 
        description: error.message || "Failed to initialize personnel account." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({ title: "Copy Failed", description: "Clipboard access restricted.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Enroll Personnel
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-black uppercase tracking-tight">Personnel Enrollment</DialogTitle>
          <DialogDescription>
            Provide the technical profile and credentials to register new personnel in the workshop registry.
          </DialogDescription>
        </DialogHeader>
        
        {enrollmentResult ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <DialogBody>
              <div className="space-y-6 px-6 pb-6 pt-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="h-12 w-12 rounded-[1.25rem] bg-green-500/10 flex items-center justify-center mb-2 border border-green-500/20">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Enrollment Successful</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                Credentials generated for <span className="text-foreground">{enrollmentResult.name}</span>
              </p>
            </div>

            <div className="bg-muted/50 p-6 rounded-2xl border border-dashed border-primary/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Temporary Access Key</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-[9px] font-black uppercase tracking-widest gap-2 bg-background/50 hover:bg-background"
                  onClick={() => copyToClipboard(enrollmentResult.password)}
                >
                  {hasCopied ? <><Check className="h-3 w-3 text-green-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy Key</>}
                </Button>
              </div>
                <code className="block text-lg sm:text-xl font-mono font-bold tracking-tight text-primary text-center break-all select-all bg-primary/5 p-4 rounded-xl border border-primary/10">
                {enrollmentResult.password}
              </code>
            </div>
              </div>
            </DialogBody>
            <DialogFooter className="p-6 border-t">
              <Button 
              onClick={() => handleOpenChange(false)}
              className="w-full h-11 font-black uppercase tracking-[0.2em] text-[10px]"
            >
              Finalize & Close
            </Button>
          </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <DialogBody>
              <div className="px-6 pb-6 pt-2">
                <StaffForm onChange={setFormData} />
              </div>
            </DialogBody>
            <DialogFooter className="p-6 border-t">
                <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} className="w-full sm:w-auto h-11 font-black uppercase tracking-widest text-[10px]">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-11 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20">
                  {isSubmitting ? "Initializing..." : "Enroll New Personnel"}
                </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
