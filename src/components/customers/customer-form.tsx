'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => Promise<void> | void;
  customer: Customer | null;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  customer 
}) => {
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFullName(customer?.fullName || '');
      setEmail(customer?.email || '');
      setPhone(customer?.phone || '');
      setAddress(customer?.address || '');
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({ fullName, email, phone, address });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[560px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            {customer ? 'Update Registry Profile' : 'New Customer Intake'}
          </DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {customer ? 'Synchronize customer data with the central technical ledger.' : 'Initialize a new client account for technical bay access.'}
          </DialogDescription>
        </DialogHeader>

        {/* 
          min-h-0 on the form is the "magic" fix. 
          It allows the form to shrink so the footer stays visible.
        */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <div className="space-y-5 px-6 pb-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3 text-primary" /> Full Legal Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="fullName"
                    className="pl-9 h-11 rounded-xl bg-muted/50 border-none font-bold"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3 text-primary" /> Digital Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9 h-11 rounded-xl bg-muted/50 border-none font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3 w-3 text-primary" /> Contact Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      id="phone"
                      className="pl-9 h-11 rounded-xl bg-muted/50 border-none font-bold"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" /> Physical Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="address"
                    className="pl-9 h-11 rounded-xl bg-muted/50 border-none font-medium"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="p-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full sm:w-auto h-11 font-black uppercase tracking-widest text-[10px]"
              disabled={isSubmitting}
            >
              Discard
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {customer ? 'Commit Sync' : 'Complete Intake'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
