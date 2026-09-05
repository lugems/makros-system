'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Hammer, 
    User, 
    Fingerprint, 
    Gauge, 
    ArrowRight, 
    Wrench, 
    MoreHorizontal, 
    Plus, 
    Edit, 
    Trash2, 
    Activity, 
    PowerOff 
} from 'lucide-react';
import { PlantEquipment, PlantStatus } from '@/types/plant-equipment';
import { getMeterUnit } from '@/services/asset-resolver-service';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { updatePlantStatus, decommissionPlant } from '@/services/plants-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { UpdateMeterDialog } from './update-meter-dialog';
import { EditPlantDialog } from './edit-plant-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PlantCardProps {
  plant: PlantEquipment;
  ownerName: string;
}

export function PlantCard({ plant, ownerName }: PlantCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isUpdateMeterOpen, setIsUpdateMeterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDecommissionAlertOpen, setIsDecommissionAlertOpen] = useState(false);

  const unit = getMeterUnit(plant.meterType);
  const isActive = plant.status === 'Active';

  const handleStatusShift = async (id: string, status: PlantStatus) => {
      if (!user) return;
      try {
        await updatePlantStatus(id, status, user.userId);
        toast({ title: "Status Synchronized", description: `Asset state shifted to ${status}.` });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Shift Failed", description: err.message });
      }
  };

  const handleDecommission = async () => {
      if (user) {
          try {
              await decommissionPlant(plant.id, user.userId);
              toast({ title: "Asset Decommissioned", description: "Technical authority revoked for this unit." });
              setIsDecommissionAlertOpen(false);
          } catch (err: any) {
              toast({ variant: "destructive", title: "Operation Failed", description: err.message });
          }
      }
  };

  return (
    <Card 
        className="group hover:border-primary/40 transition-all duration-300 bg-card border-border/50 rounded-[1.75rem] shadow-sm flex flex-col h-full overflow-hidden relative"
    >
      <CardHeader className="pb-3 p-6">
        <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5 group-hover:scale-110 transition-transform">
                <Hammer className="h-6 w-6" />
            </div>
            <div className="flex gap-2">
                <Badge variant="outline" className={cn(
                    "text-[7px] font-black uppercase tracking-widest px-2 py-0.5",
                    isActive ? "bg-green-500/5 text-green-600 border-green-200" : "bg-muted text-muted-foreground"
                )}>{plant.status}</Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl p-2 w-56 shadow-2xl">
                        <DropdownMenuLabel className="text-[9px] font-black uppercase text-muted-foreground px-3 py-2">Lifecycle</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/job-cards/new?assetId=${plant.id}&assetType=Plant`)} className="rounded-lg gap-2 text-[10px] font-black uppercase">
                            <Plus className="h-3.5 w-3.5 text-primary" /> Create Work Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsUpdateMeterOpen(true)} className="rounded-lg gap-2 text-[10px] font-black uppercase">
                            <Gauge className="h-3.5 w-3.5 text-indigo-500" /> Update Meter
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="rounded-lg gap-2 text-[10px] font-black uppercase">
                            <Edit className="h-3.5 w-3.5 text-primary" /> Edit Record
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusShift(plant.id, 'Under Repair')} className="rounded-lg gap-2 text-[10px] font-black uppercase">
                            <Activity className="h-3.5 w-3.5 text-orange-500" /> Mark Repair
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsDecommissionAlertOpen(true)} className="rounded-lg gap-2 text-[10px] font-black uppercase text-destructive">
                            <Trash2 className="h-3.5 w-3.5" /> Decommission
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        <div className="space-y-1">
            <CardTitle className="text-base font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate">
                {plant.name}
            </CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{plant.make} {plant.model}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 flex-1">
        <div className="bg-muted/30 p-4 rounded-2xl border border-dashed border-border/50">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Fingerprint className="h-3.5 w-3.5 text-primary opacity-40" />
                    <span className="text-[10px] font-mono font-black uppercase text-foreground/70">{plant.assetId}</span>
                </div>
                <span className="text-[8px] font-bold text-muted-foreground uppercase">Serial: {plant.serialNumber.slice(-8)}</span>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Gauge className="h-3.5 w-3.5 text-indigo-500 opacity-40" />
                    <span className="text-sm font-black tabular-nums">{plant.meterReading.toLocaleString()}</span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase">{unit}</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3 px-1">
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3.5 w-3.5 opacity-30" />
            </div>
            <p className="text-[11px] font-bold text-foreground/60 uppercase truncate">{ownerName}</p>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <Button 
            variant="outline" 
            className="w-full h-10 text-[9px] font-black uppercase tracking-widest gap-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all border-border/50"
            onClick={() => router.push(`/plants-equipment/${plant.id}`)}
        >
            Inspect Dossier
            <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>
      
      {/* Dialogs */}
      <UpdateMeterDialog plant={plant} isOpen={isUpdateMeterOpen} onClose={() => setIsUpdateMeterOpen(false)} />
      <EditPlantDialog plant={plant} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      
      <AlertDialog open={isDecommissionAlertOpen} onOpenChange={setIsDecommissionAlertOpen}>
          <AlertDialogContent className="rounded-[2rem] border-border/50">
              <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Decommission Asset?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium leading-relaxed italic">
                      This will revoke technical authority for <span className="font-bold text-foreground">{plant.name}</span>. Historical data remains preserved.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="h-10 rounded-xl font-black uppercase text-[10px]">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDecommission} className="h-10 rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase text-[10px] text-white border-none shadow-lg">Confirm Decommission</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
    </Card>
  );
}
