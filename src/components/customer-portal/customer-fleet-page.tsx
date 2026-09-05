'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { 
    Car, 
    Fingerprint, 
    Gauge, 
    Fuel, 
    Calendar, 
    ShieldCheck, 
    Camera, 
    Hammer,
    Layers,
    Activity,
    Search
} from 'lucide-react';
import { VehiclePhotoUpload } from '@/components/vehicles/vehicle-photo-upload';
import { Separator } from '@/components/ui/separator';
import { getMeterUnit } from '@/services/asset-resolver-service';

/**
 * @fileOverview Multi-Registry Fleet Dashboard for the customer portal.
 * Surfaces both road vehicles and industrial machinery dossiers.
 */
export default function CustomerFleetPage() {
    const { user } = useAuth();
    const db = useFirestore();

    // 1. Technical Data Streams
    const vehQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(collection(db, 'vehicles'), where('customerId', '==', user.userId), orderBy('createdAt', 'desc'));
    }, [db, user?.userId]);

    const plantsQuery = useMemoFirebase(() => {
        if (!user?.userId || !db) return null;
        return query(collection(db, 'plantsAndEquipment'), where('ownerId', '==', user.userId), orderBy('createdAt', 'desc'));
    }, [db, user?.userId]);

    const { data: vehicles, loading: vLoading } = useCollection<any>(vehQuery);
    const { data: plants, loading: pLoading } = useCollection<any>(plantsQuery);

    if (vLoading || pLoading) return <LoadingState />;

    const totalAssets = (vehicles?.length || 0) + (plants?.length || 0);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-headline">My Fleet Registry</h1>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Registered Technical Assets ({totalAssets})</p>
                </div>
            </header>

            {/* Industrial Hardware Section */}
            {plants && plants.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-muted-foreground px-2">
                        <Hammer className="h-4 w-4 text-primary" />
                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Industrial Machinery</h3>
                    </div>
                    <div className="grid gap-8">
                        {plants.map(plant => (
                            <AssetCard key={plant.id} asset={plant} type="Plant" />
                        ))}
                    </div>
                </section>
            )}

            {/* Road Fleet Section */}
            {vehicles && vehicles.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-muted-foreground px-2">
                        <Car className="h-4 w-4 text-primary" />
                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Road Vehicle Fleet</h3>
                    </div>
                    <div className="grid gap-8">
                        {vehicles.map(vehicle => (
                            <AssetCard key={vehicle.vehicleId || vehicle.id} asset={vehicle} type="Vehicle" />
                        ))}
                    </div>
                </section>
            )}

            {totalAssets === 0 && (
                <div className="py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 flex flex-col items-center justify-center space-y-4 bg-muted/5">
                    <div className="h-20 w-20 rounded-[2rem] bg-background border flex items-center justify-center shadow-sm">
                        <Layers className="h-10 w-10 opacity-20" />
                    </div>
                    <p className="text-sm font-medium italic">No assets registered to your client profile.</p>
                </div>
            )}
        </div>
    );
}

function AssetCard({ asset, type }: { asset: any; type: 'Vehicle' | 'Plant' }) {
    const isVehicle = type === 'Vehicle';
    const id = isVehicle ? (asset.vehicleId || asset.id) : asset.id;
    const name = isVehicle ? `${asset.make} ${asset.model}` : asset.name;
    const subLabel = isVehicle ? asset.numberPlate : `${asset.make} ${asset.model}`;
    const refId = isVehicle ? asset.vin : asset.assetId;
    const telemetry = isVehicle ? asset.mileage : asset.meterReading;
    const unit = isVehicle ? 'KM' : getMeterUnit(asset.meterType);

    return (
        <Card className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden shadow-sm group hover:border-primary/40 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-4 bg-muted/20 p-8 border-b lg:border-b-0 lg:border-r border-border/50">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                            {isVehicle ? <Car className="h-7 w-7" /> : <Hammer className="h-7 w-7" />}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-none truncate">{name}</h2>
                            <Badge variant="outline" className="text-[10px] font-mono font-black mt-2 py-0 border-primary/20 text-primary bg-primary/5">
                                {subLabel}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="flex items-center gap-2"><Gauge className="h-3.5 w-3.5" /> Telemetry</span>
                            <span className="text-foreground">{telemetry?.toLocaleString() || '0'} {unit}</span>
                        </div>
                        <Separator className="opacity-50" />
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="flex items-center gap-2">
                                {isVehicle ? <Fuel className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                                {isVehicle ? 'Fuel Config' : 'Operational'}
                            </span>
                            <span className="text-foreground">{isVehicle ? (asset.fuelLevel || 'N/A') : (asset.status)}</span>
                        </div>
                        <Separator className="opacity-50" />
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Mfg Cycle</span>
                            <span className="text-foreground">Year {isVehicle ? asset.year : asset.yearOfManufacture}</span>
                        </div>
                    </div>

                    <div className="mt-8 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-primary mb-1">
                            <Fingerprint className="h-3 w-3" /> Technical ID
                        </div>
                        <p className="text-[10px] font-mono font-bold text-muted-foreground truncate uppercase">{refId || id}</p>
                    </div>
                </div>

                <div className="lg:col-span-8 p-8 space-y-6">
                    <div className="flex items-center gap-3 text-muted-foreground px-2">
                        <Camera className="h-4 w-4" />
                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Forensic Evidence Registry</h3>
                    </div>
                    <div className="bg-muted/10 p-6 rounded-[2rem] border border-dashed border-border/50">
                        <VehiclePhotoUpload vehicleId={id} />
                    </div>
                </div>
            </div>
        </Card>
    );
}
