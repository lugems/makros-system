'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hammer, User, Fingerprint, Gauge, ArrowRight, Wrench, MoreHorizontal } from 'lucide-react';
import { PlantEquipment } from '@/types/plant-equipment';
import { getMeterUnit } from '@/services/asset-resolver-service';
import { cn } from '@/lib/utils';

interface PlantCardProps {
  plant: PlantEquipment;
  ownerName: string;
}

export function PlantCard({ plant, ownerName }: PlantCardProps) {
  const router = useRouter();
  const unit = getMeterUnit(plant.meterType);

  return (
    <Card 
        className="cursor-pointer group hover:border-primary/40 transition-all duration-300 bg-card border-border/50 rounded-[1.75rem] shadow-sm flex flex-col h-full overflow-hidden relative"
        onClick={() => router.push(`/plants-equipment/${plant.id}`)}
    >
      <CardHeader className="pb-3 p-6">
        <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5 group-hover:scale-110 transition-transform">
                <Hammer className="h-6 w-6" />
            </div>
            <Badge variant="outline" className={cn(
                "text-[7px] font-black uppercase tracking-widest px-2 py-0.5",
                plant.status === 'Active' ? "bg-green-500/5 text-green-600 border-green-200" : "bg-muted text-muted-foreground"
            )}>{plant.status}</Badge>
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
        <Button variant="outline" className="w-full h-10 text-[9px] font-black uppercase tracking-widest gap-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all border-border/50">
            Inspect Dossier
            <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>
      
      {/* Visual left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
    </Card>
  );
}
