'use client';

import React, { useEffect, useState } from 'react';
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
  DialogFooter 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Hammer, Tag, Hash, Loader2, Gauge, Fuel, Binary, MapPin } from 'lucide-react';
import { updatePlant } from '@/services/plants-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { PlantEquipment } from '@/types/plant-equipment';

const plantSchema = z.object({
  name: z.string().min(1, "Equipment name is required"),
  category: z.string().min(1, "Category is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  yearOfManufacture: z.string().min(1, "Year is required"),
  assetId: z.string().min(1, "Asset ID is required"),
  powerType: z.string().min(1, "Power type is required"),
  engineNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  location: z.string().optional(),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Non-operational']),
  status: z.enum(['Active', 'Under Repair', 'Under Maintenance', 'Out of Service', 'Decommissioned']),
  notes: z.string().optional(),
});

type PlantFormData = z.infer<typeof plantSchema>;

interface EditPlantDialogProps {
  plant: PlantEquipment;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPlantDialog({ plant, isOpen, onClose }: EditPlantDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlantFormData>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: plant.name || '',
      category: plant.category || '',
      make: plant.make || '',
      model: plant.model || '',
      serialNumber: plant.serialNumber || '',
      yearOfManufacture: plant.yearOfManufacture || '',
      assetId: plant.assetId || '',
      powerType: plant.powerType || '',
      engineNumber: plant.engineNumber || '',
      manufacturer: plant.manufacturer || '',
      location: plant.location || '',
      condition: plant.condition || 'Good',
      status: plant.status || 'Active',
      notes: plant.notes || ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: plant.name || '',
        category: plant.category || '',
        make: plant.make || '',
        model: plant.model || '',
        serialNumber: plant.serialNumber || '',
        yearOfManufacture: plant.yearOfManufacture || '',
        assetId: plant.assetId || '',
        powerType: plant.powerType || '',
        engineNumber: plant.engineNumber || '',
        manufacturer: plant.manufacturer || '',
        location: plant.location || '',
        condition: plant.condition || 'Good',
        status: plant.status || 'Active',
        notes: plant.notes || ''
      });
    }
  }, [isOpen, plant, form]);

  const onSubmit = async (data: PlantFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updatePlant(plant.id, data as any, user.userId);
      toast({ title: "Dossier Synchronized", description: "Technical specifications updated successfully." });
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[92dvh] flex-col overflow-hidden p-0 sm:max-w-[700px] border-border/50">
        <DialogHeader className="px-8 pt-8 pb-4 text-left border-b bg-muted/30">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Hammer className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Recalibrate Dossier</DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">Modify technical data for SKU #{plant.assetId.toUpperCase()}</DialogDescription>
                </div>
            </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <DialogBody>
              <div className="space-y-8 px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Equipment Name</FormLabel>
                                <FormControl><Input {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Technical Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger className="h-11 bg-muted/20 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {['Excavator', 'Bulldozer', 'Grader', 'Loader', 'Forklift', 'Crane', 'Tractor', 'Generator', 'Compressor', 'Welding Equipment', 'Pump', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="make"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Make</FormLabel>
                                <FormControl><Input {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Model</FormLabel>
                                <FormControl><Input {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="yearOfManufacture"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Year</FormLabel>
                                <FormControl><Input type="number" {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                    <FormField
                        control={form.control}
                        name="assetId"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Hash className="h-3 w-3" /> Asset ID
                                </FormLabel>
                                <FormControl><Input {...field} className="h-11 bg-background border-none rounded-xl font-black uppercase tracking-tighter" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="serialNumber"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Binary className="h-3 w-3" /> Serial S/N
                                </FormLabel>
                                <FormControl><Input {...field} className="h-11 bg-background border-none rounded-xl font-black uppercase" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger className="h-11 bg-muted/20 border-none rounded-xl font-black text-primary"><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {['Active', 'Under Repair', 'Under Maintenance', 'Out of Service', 'Decommissioned'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-primary" /> Current Deployment
                                </FormLabel>
                                <FormControl><Input {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Technical Dossier Notes</Label>
                    <Textarea 
                        {...form.register('notes')}
                        className="min-h-[100px] rounded-2xl bg-muted/20 border-none resize-none p-4 text-sm font-medium" 
                    />
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="p-8 border-t bg-muted/10">
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
                >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : 'Commit Calibration Sync'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
