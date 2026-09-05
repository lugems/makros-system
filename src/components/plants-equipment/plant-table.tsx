'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlantEquipment, PlantStatus } from '@/types/plant-equipment';
import { Customer } from '@/types/customer';
import { 
    Hammer, 
    User, 
    Fingerprint, 
    Gauge, 
    MoreHorizontal, 
    Eye, 
    ChevronRight, 
    Plus, 
    Edit, 
    Trash2, 
    Activity,
    PowerOff
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getMeterUnit } from '@/services/asset-resolver-service';
import { updatePlantStatus, decommissionPlant } from '@/services/plants-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PlantTableProps {
  plants: PlantEquipment[];
  customers: Customer[];
  onUpdateMeter: (plant: PlantEquipment) => void;
  onEdit: (plant: PlantEquipment) => void;
}

export function PlantTable({ plants, customers, onUpdateMeter, onEdit }: PlantTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [plantToDecommission, setPlantToDecommission] = useState<PlantEquipment | null>(null);

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
      if (plantToDecommission && user) {
          try {
              await decommissionPlant(plantToDecommission.id, user.userId);
              toast({ title: "Asset Decommissioned", description: "Technical authority revoked for this unit." });
              setPlantToDecommission(null);
          } catch (err: any) {
              toast({ variant: "destructive", title: "Operation Failed", description: err.message });
          }
      }
  };

  return (
    <div className="rounded-3xl border bg-card overflow-hidden shadow-sm premium-shadow">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground border-none">
            <TableHead className="px-8 py-5">Equipment Identity</TableHead>
            <TableHead className="px-8 py-5">Asset Reference</TableHead>
            <TableHead className="px-8 py-5">Telemetry</TableHead>
            <TableHead className="px-8 py-5">Owner Authority</TableHead>
            <TableHead className="px-8 py-5">Registry Status</TableHead>
            <TableHead className="px-8 py-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plants.map((plant) => {
            const customer = customers.find(c => c.customerId === plant.ownerId);
            const unit = getMeterUnit(plant.meterType);
            const isActive = plant.status === 'Active';

            return (
              <TableRow 
                key={plant.id} 
                className="hover:bg-muted/30 transition-colors group cursor-pointer border-border/40"
                onClick={() => router.push(`/plants-equipment/${plant.id}`)}
              >
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="h-11 w-11 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Hammer className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none">{plant.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{plant.make} {plant.model}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Fingerprint className="h-3 w-3 text-primary opacity-40" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-foreground/80">{plant.assetId}</span>
                    </div>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">S/N: {plant.serialNumber}</p>
                  </div>
                </TableCell>
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10">
                      <Gauge className="h-3.5 w-3.5 text-indigo-500 opacity-60" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs font-black tabular-nums">{plant.meterReading.toLocaleString()}</p>
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">{unit}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3.5 w-3.5 opacity-40" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-tight text-foreground/80 truncate max-w-[120px]">{customer?.fullName || 'Registry Void'}</span>
                    </div>
                </TableCell>
                <TableCell className="px-8 py-6">
                  <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-3 py-0.5 rounded-lg",
                      isActive ? "bg-green-500/5 text-green-600 border-green-200" : "bg-muted text-muted-foreground"
                  )}>
                    {plant.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 w-64 shadow-2xl border-border/50">
                            <DropdownMenuLabel className="text-[9px] font-black uppercase text-muted-foreground px-3 py-2">Lifecycle Actions</DropdownMenuLabel>
                            
                            <DropdownMenuItem onClick={() => router.push(`/job-cards/new?assetId=${plant.id}&assetType=Plant`)} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <Plus className="h-4 w-4 text-primary" /> Create Work Order
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateMeter(plant)} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <Gauge className="h-4 w-4 text-indigo-500" /> Update Telemetry
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="opacity-50" />
                            
                            <DropdownMenuItem onClick={() => router.push(`/plants-equipment/${plant.id}`)} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <Eye className="h-4 w-4 text-primary" /> Technical Dossier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(plant)} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <Edit className="h-4 w-4 text-primary" /> Edit Record
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="opacity-50" />
                            
                            <DropdownMenuItem onClick={() => handleStatusShift(plant.id, 'Under Repair')} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <Activity className="h-4 w-4 text-orange-500" /> Mark Under Repair
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusShift(plant.id, 'Out of Service')} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                                <PowerOff className="h-4 w-4 text-red-500" /> Out of Service
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPlantToDecommission(plant)} className="rounded-lg gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-destructive">
                                <Trash2 className="h-4 w-4" /> Decommission
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!plantToDecommission} onOpenChange={(o) => !o && setPlantToDecommission(null)}>
          <AlertDialogContent className="rounded-3xl border-border/50">
              <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Decommission technical Asset?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium leading-relaxed italic">
                      This action will forensically decommission <span className="font-bold text-foreground">{(plantToDecommission as any)?.name}</span>. Historical work orders and technical logs will be preserved, but the unit will be removed from the active fleet.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="h-11 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDecommission} className="h-11 rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase text-[10px] tracking-widest border-none text-white shadow-xl shadow-destructive/20">Authorize Decommissioning</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
