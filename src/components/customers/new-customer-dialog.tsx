'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { User, Mail, Phone, MapPin, ShieldCheck, Loader2, CheckCircle2, Lock, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { enrollCustomerAccount } from '@/services/customers-service';

const enrollmentSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

interface NewCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCustomerDialog({ isOpen, onClose }: NewCustomerDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<(EnrollmentFormValues & { tempPassword?: string }) | null>(null);

  // Utility to generate a temporary password for the portal
  const generateTempPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return Array.from({ length: 10 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Attempt modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Password copied to clipboard." });
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (err) {
      // Fallback for restricted environments or insecure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast({ title: "Copied", description: "Password copied via system fallback." });
      } catch (copyErr) {
        toast({ variant: "destructive", title: "Copy Failed", description: "Please manually record the password." });
      }
      document.body.removeChild(textArea);
    }
  };

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (data: EnrollmentFormValues) => {
    setIsSubmitting(true);
    try {
      // Verification of staff identity for auditing (createdBy field)
      if (!user?.userId) {
        throw new Error("Staff credentials required for technical registry. Please ensure you are logged in.");
      }
      
      const staffId = user.userId;
      const tempPassword = generateTempPassword();
      
      // Enrollment Flow:
      // 1. Create Firebase Auth user using temporary credentials.
      // 2. Synchronize UID for both 'users' and 'customers' collection entries.
      // 3. Assign role 'Customer' to the user registry.
      await enrollCustomerAccount(
        { 
          ...data, 
          role: 'Customer',
          status: 'Active', 
          password: tempPassword 
        } as any, 
        staffId
      );

      setEnrollmentResult({ ...data, tempPassword });
      toast({ 
        title: "Account Initialized", 
        description: `${data.fullName} is now registered for portal access.` 
      });
    } catch (error: any) {
      toast({
        title: "Account Registry Failure",
        description: error.message || "An unexpected error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setEnrollmentResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[560px] border-border/50">
        {enrollmentResult ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Enrollment Success</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Portal access has been provisioned for {enrollmentResult.fullName}.
              </p>
            </div>

            {enrollmentResult.tempPassword && (
              <div className="w-full p-4 bg-muted/50 rounded-2xl border border-dashed border-primary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Temporary Credentials</span>
                  <Lock className="h-3 w-3 text-primary" />
                </div>
                <div className="flex items-center justify-between bg-background p-3 rounded-xl border">
                  <code className="text-sm font-mono font-bold text-primary">{enrollmentResult.tempPassword}</code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-primary/10" 
                    onClick={() => copyToClipboard(enrollmentResult.tempPassword!)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[8px] font-bold text-destructive uppercase tracking-tighter italic">Warning: This password will not be shown again. Provide it to the client immediately.</p>
              </div>
            )}

            <Button onClick={handleClose} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">Acknowledge</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-2 text-left">
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Initialize Account</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Register a new customer for secure service portal access.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
                <DialogBody>
                  <div className="space-y-6 px-6 pb-6 pt-2">
                    {/* Full Name */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <User className="h-3 w-3 text-primary" /> Full Legal Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Johnathan Doe" className="h-12 bg-muted/50 border-none rounded-xl font-bold" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold uppercase" />
                        </FormItem>
                      )}
                    />

                    {/* Email and Phone Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <Mail className="h-3 w-3 text-primary" /> Email Address
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" className="h-12 bg-muted/50 border-none rounded-xl font-medium" {...field} />
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold uppercase" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3 text-primary" /> Contact Number
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+256 700 000 000" className="h-12 bg-muted/50 border-none rounded-xl font-bold" {...field} />
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold uppercase" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-primary" /> Physical Address
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Market, Street, District" className="h-12 bg-muted/50 border-none rounded-xl font-medium" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold uppercase" />
                        </FormItem>
                      )}
                    />
                  </div>
                </DialogBody>

                <DialogFooter className="p-6 border-t">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !user}
                    className="w-full h-14 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 rounded-2xl transition-all hover:scale-[1.01]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <><ShieldCheck className="h-4 w-4 mr-2" /> Initialize Account Registry</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
