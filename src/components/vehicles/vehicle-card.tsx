'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Vehicle } from '@/types/vehicle';
import { Badge } from '@/components/ui/badge';
import { Car, User, Fingerprint, ChevronRight, MoreHorizontal, Edit, Power, PowerOff, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  ownerName: string;
  onView: (id: string) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
  onDelete?: () => void;
}

export function VehicleCard({ 
    vehicle, 
    ownerName, 
    onView, 
    onEdit, 
    onDeactivate,
    onActivate,
    onDelete
}: VehicleCardProps) {
  const isActive = vehicle.status !== 'Inactive';

  return (
    <Card className="hover:border-primary/40 transition-all group relative overflow-hidden bg-card border-border/50">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/5 text-primary">
                    <Car className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                        {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Year {vehicle.year}</p>
                </div>
            </div>
            <Badge variant={isActive ? 'success' : 'destructive'} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                {isActive ? 'Active' : 'Inactive'}
            </Badge>
        </div>

        <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-xl border border-dashed border-border/50">
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">License Plate</p>
                    <p className="text-xs font-mono font-black text-primary uppercase">{vehicle.numberPlate}</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Technical ID</p>
                    <p className="text-[9px] font-mono font-bold text-foreground/60 uppercase">{vehicle.vehicleId.slice(-8)}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground/50" />
                <span className="text-[11px] font-bold text-foreground/80 truncate uppercase tracking-tight">{ownerName}</span>
            </div>
        </div>

        <div className="flex gap-2 pt-1">
            <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest bg-background rounded-xl"
                onClick={() => onView(vehicle.vehicleId)}
            >
                View Dossier
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-9 w-9 rounded-xl border border-border/50"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48">
                    <DropdownMenuItem onClick={() => onView(vehicle.vehicleId)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="h-3.5 w-3.5" /> Inspect Dossier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(vehicle)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Edit className="h-3.5 w-3.5" /> Edit Record
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isActive ? (
                        <DropdownMenuItem onClick={() => onDeactivate(vehicle.vehicleId)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive">
                            <PowerOff className="h-3.5 w-3.5" /> Deactivate
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => onActivate(vehicle.vehicleId)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                            <Power className="h-3.5 w-3.5" /> Restore Duty
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={onDelete} 
                        className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Asset
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardContent>
      
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />
    </Card>
  );
}