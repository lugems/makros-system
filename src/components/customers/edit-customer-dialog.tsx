'use client';

import { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerSchema } from '@/schemas/customer-schema';
import { Customer } from '@/types/customer';
import { User, Mail, Phone, MapPin, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateCustomer } from '@/services/customers-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface EditCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomerDialog({ customer, open, onOpenChange }: EditCustomerDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const editSchema = CustomerSchema.extend({
    status: z.enum(['Active', 'Inactive']).optional()
  });

  type EditFormValues = z.infer<typeof editSchema>;

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      status: customer.status,
    },
  });

  useEffect(() => {
    if (open && customer) {
      form.reset({
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        status: customer.status,
      });
    }
  }, [open, customer, form]);

  const onSubmit = useCallback(async (data: EditFormValues) => {
    try {
        if (!user?.userId) {
            throw new Error("Authentication required for record synchronization.");
        }
        
        await updateCustomer(customer.customerId, data, user.userId);
        toast({ title: "Registry Synchronized", description: `${customer.fullName} record updated.` });
        onOpenChange(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  }, [customer.customerId, customer.fullName, user?.userId, onOpenChange, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Record Synchronization</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Modify technical enrollment data for client dossier #{customer.customerId.slice(-6).toUpperCase()}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <div className="space-y-4 px-6 pb-6 pt-2">
              <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" /> Full Legal Name
                  </Label>
                  <Input 
                      {...form.register('fullName')} 
                      className="h-11 rounded-xl bg-muted/50 border-none font-bold"
                  />
                  {form.formState.errors.fullName && (
                      <p className="text-[10px] text-destructive font-bold uppercase tracking-tight">{form.formState.errors.fullName.message}</p>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" /> Digital Address
                      </Label>
                      <Input 
                          type="email" 
                          {...form.register('email')} 
                          className="h-11 rounded-xl bg-muted/50 border-none"
                      />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" /> Contact Authority
                      </Label>
                      <Input 
                          {...form.register('phone')} 
                          className="h-11 rounded-xl bg-muted/50 border-none"
                      />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" /> Location
                      </Label>
                      <Input 
                          {...form.register('address')} 
                          className="h-11 rounded-xl bg-muted/50 border-none"
                      />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-muted-foreground">
                          <Activity className="h-3 w-3" /> Registry Status
                      </Label>
                      <Select 
                        onValueChange={(val) => form.setValue('status', val as any)} 
                        defaultValue={customer.status}
                    >
                        <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active" className="font-bold">Active Duty</SelectItem>
                            <SelectItem value="Inactive" className="font-bold">Closed Record</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="p-6 border-t">
            <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
            >
                Commit Record Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
