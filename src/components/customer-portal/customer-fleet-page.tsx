'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { FormattedDate } from '@/components/shared/formatted-date';
import { 
    Car, 
    Fingerprint, 
    Gauge, 
    Fuel, 
    Calendar, 
    ShieldCheck, 
    History,
    Camera,
    Wrench,
    ArrowRight
} from 'lucide-react';
import { VehiclePhotoUpload } from '@/components/vehicles/vehicle-photo-upload';
import { Separator } from '@/components/ui/separator';

/**
 * @fileOverview High-fidelity Fleet Registry for the customer portal.
 * Stabilized with useMemoFirebase for loop-resistant sync of registered assets.
 */
export default function CustomerFleetPage() {
    const { user } = useAuth();
    const db = useFirestore();

    const vehQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(collection(db, 'vehicles'), where('customerId', '==', user.userId), orderBy('createdAt', 'desc'));
    }, [db, user?.userId]);

    const { data: vehicles, loading } = useCollection<any>(vehQuery);

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-black uppercase tracking-tighter font-headline">My Fleet Registry</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Registered Technical Assets</p>
            </header>

            <div className="grid gap-10">
                {vehicles && vehicles.length > 0 ? vehicles.map(vehicle => (
                    <Card key={vehicle.id} className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden shadow-sm group hover:border-primary/30 transition-all">
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="lg:col-span-4 bg-muted/20 p-8 border-b lg:border-b-0 lg:border-r border-border/50">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                        <Car className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight leading-none">{vehicle.make} {vehicle.model}</h2>
                                        <Badge variant="outline" className="text-[10px] font-mono font-black mt-2 py-0.5 border-primary/20 text-primary bg-primary/5">
                                            {vehicle.numberPlate}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <span className="flex items-center gap-2"><Gauge className="h-3.5 w-3.5" /> Odometer</span>
                                        <span className="text-foreground">{vehicle.mileage?.toLocaleString() || '0'} KM</span>
                                    </div>
                                    <Separator className="opacity-50" />
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <span className="flex items-center gap-2"><Fuel className="h-3.5 w-3.5" /> Fuel Config</span>
                                        <span className="text-foreground">{vehicle.fuelLevel || 'N/A'}</span>
                                    </div>
                                    <Separator className="opacity-50" />
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Mfg Cycle</span>
                                        <span className="text-foreground">Year {vehicle.year}</span>
                                    </div>
                                </div>

                                <div className="mt-8 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-primary mb-1">
                                        <Fingerprint className="h-3 w-3" /> Technical ID
                                    </div>
                                    <p className="text-[10px] font-mono font-bold text-muted-foreground truncate">{vehicle.id}</p>
                                </div>
                            </div>

                            <div className="lg:col-span-8 p-8 space-y-6">
                                <div className="flex items-center gap-3 text-muted-foreground px-2">
                                    <Camera className="h-4 w-4" />
                                    <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Forensic Imagery</h3>
                                </div>
                                <div className="bg-muted/10 p-6 rounded-[2rem] border border-dashed border-border/50">
                                    <VehiclePhotoUpload vehicleId={vehicle.id} />
                                </div>
                            </div>
                        </div>
                    </Card>
                )) : (
                    <div className="py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 flex flex-col items-center justify-center space-y-4">
                        <div className="h-20 w-20 rounded-[2rem] bg-background border flex items-center justify-center shadow-sm">
                            <Car className="h-10 w-10" />
                        </div>
                        <p className="text-sm font-medium italic">No assets registered to your client profile.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
