'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogBody, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gauge, Loader2, History, AlertTriangle, ShieldCheck } from 'lucide-react';
import { updatePlantMeter } from '@/services/plants-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { PlantEquipment } from '@/types/plant-equipment';
import { getMeterUnit } from '@/services/asset-resolver-service';
import { Separator } from '@/components/ui/separator';

interface UpdateMeterDialogProps {
  plant: PlantEquipment;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateMeterDialog({ plant, isOpen, onClose }: UpdateMeterDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reading, setReading] = useState<string>(plant.meterReading.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unit = getMeterUnit(plant.meterType);
  const currentReading = plant.meterReading;
  const newReading = parseFloat(reading) || 0;
  const delta = newReading - currentReading;
  const isRegression = delta < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await updatePlantMeter(plant.id, newReading, user.userId);
      toast({ title: "Telemetry Synced", description: `Meter updated to ${newReading.toLocaleString()} ${unit}.` });
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[440px] border-border/50">
        <DialogHeader className="px-8 pt-8 pb-4 text-left border-b bg-muted/30">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-sm">
                    <Gauge className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Telemetry Update</DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Registry calibration for {plant.assetId}</DialogDescription>
                </div>
            </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <div className="space-y-8 px-8 py-6">
                <div className="flex justify-between items-end bg-muted/20 p-6 rounded-2xl border border-dashed border-border/50">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Reading</p>
                        <p className="text-xl font-black">{currentReading.toLocaleString()} <span className="text-[10px]">{unit}</span></p>
                    </div>
                    <History className="h-5 w-5 text-muted-foreground/30" />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 ml-1">
                        <Gauge className="h-3 w-3" /> New Master Reading ({unit})
                    </Label>
                    <Input 
                        type="number" 
                        step="any"
                        value={reading}
                        onChange={(e) => setReading(e.target.value)}
                        className="h-16 rounded-2xl bg-muted/30 border-none font-black text-3xl text-center focus-visible:ring-primary/20"
                        autoFocus
                    />
                </div>

                {isRegression && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-700 uppercase leading-relaxed">
                            Telemetry Regression Detected. Ensure new reading reflects verified technical state.
                        </p>
                    </div>
                )}

                <div className="bg-primary/5 p-5 rounded-2xl flex items-start gap-4">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-[10px] font-medium leading-relaxed italic text-muted-foreground uppercase">
                        Master telemetry updates are recorded forensically. Delta: <span className="font-black text-primary">{delta > 0 ? '+' : ''}{delta.toLocaleString()} {unit}</span>
                    </p>
                </div>
            </div>
          </DialogBody>

          <DialogFooter className="p-8 border-t bg-muted/10">
              <Button 
                type="submit" 
                disabled={isSubmitting || reading === ''}
                className="w-full h-14 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : 'Synchronize Telemetry'}
              </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
