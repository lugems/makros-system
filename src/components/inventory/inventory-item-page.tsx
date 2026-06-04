
'use client';

import React, { useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { 
    Package, 
    ShieldCheck, 
    Fingerprint, 
    Truck, 
    Calendar, 
    History as HistoryIcon, 
    ArrowLeft,
    TrendingUp,
    Warehouse,
    AlertTriangle,
    Activity,
    Edit,
    Banknote,
    Layers,
    Trash2,
    Tag,
    ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormattedDate } from '@/components/shared/formatted-date';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { LowStockBadge } from './low-stock-badge';
import { StockMovementList } from './stock-movement-list';
import { EditInventoryItemDialog } from './edit-inventory-item-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LoadingState } from '@/components/shared/loading-state';
import { InventoryItem } from '@/types/inventory';
import { deleteInventoryItem } from '@/services/inventory-service';
import { useAuth } from '@/contexts/auth-context';

/**
 * @fileOverview Professional "SKU Dossier" view for an inventory item.
 * Features real-time technical tracking and administrative decommissioning protocols.
 */
const InventoryItemPage = ({ params }: { params: { itemId: string } }) => {
    const router = useRouter();
    const { toast } = useToast();
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const db = useFirestore();
    
    // Authorization Gating
    const isAuthorized = useMemo(() => {
        if (!currentUser) return false;
        return ['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Mechanic', 'Inventory Officer', 'Accountant'].includes(currentUser.role);
    }, [currentUser]);

    // Real-time SKU data stream - Gated by authorization
    const itemRef = useMemo(() => {
        if (!isAuthorized || !db) return null;
        return doc(db, 'inventory', params.itemId) as DocumentReference<InventoryItem>;
    }, [db, isAuthorized, params.itemId]);
    
    const { data: item, loading: docLoading } = useDoc<InventoryItem>(itemRef as any);

    const [isEditing, setIsEditing] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    if (authLoading || (isAuthorized && docLoading)) return <LoadingState />;

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Access Restricted</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                        SKU dossier access is limited to authorized workshop personnel.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/inventory')} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8">
                    Return to Command
                </Button>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="p-20 text-center border-2 border-dashed rounded-3xl opacity-40">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p className="text-sm font-medium italic">SKU record not located in technical registry.</p>
                <Button variant="link" onClick={() => router.push('/inventory')} className="mt-4">Return to Inventory</Button>
            </div>
        );
    }

    const totalEquity = item.purchasePrice * item.quantity;
    const isLow = item.quantity <= item.reorderLevel;

    const handleDelete = async () => {
        if (!currentUser) return;
        try {
            await deleteInventoryItem(item.itemId, currentUser.userId);
            toast({ title: "SKU Decommissioned", description: `${item.itemName} has been purged from the catalog.` });
            router.push('/inventory');
        } catch (error: any) {
            toast({ variant: "destructive", title: "Purge Failed", description: error.message });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
            {/* Dossier Header */}
            <div className="bg-muted/30 px-8 py-12 border-b relative overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                    <Warehouse className="h-64 w-64" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-32 w-32 rounded-[2rem] bg-primary/10 border-4 border-background flex items-center justify-center shadow-2xl ring-8 ring-primary/5">
                            <Package className="h-16 w-16 text-primary" />
                        </div>
                        <div className="space-y-3 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Fingerprint className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground">
                                    SKU: {item.itemId.toUpperCase()}
                                </span>
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter uppercase font-headline leading-none">
                                {item.itemName}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
                                <LowStockBadge quantity={item.quantity} lowStockThreshold={item.reorderLevel} />
                                <Badge variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest px-4 border-primary/20 text-primary bg-primary/5">
                                    <Tag className="h-3 w-3 mr-1.5" /> {item.category || 'Uncategorized'}
                                </Badge>
                                <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Active Item
                                </span>
                            </div>
                        </div>
                    </div>

                    <Card className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden border-none min-w-[260px]">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl" />
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Stock Equity (Ush)</p>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                <Banknote className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-xl font-black tracking-tight"><CurrencyFormat value={totalEquity} /></p>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Total Asset Valuation</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Registry Parameters</h3>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-[10px] font-black uppercase tracking-widest gap-2 text-primary hover:bg-primary/10">
                                    <Edit className="h-3 w-3" /> Update SKU
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsDeleting(true)} className="text-[10px] font-black uppercase tracking-widest gap-2 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-3.5 w-3.5" /> Decommission
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => router.push('/inventory')} className="text-[10px] font-black uppercase tracking-widest gap-2">
                                    <ArrowLeft className="h-3 w-3" /> Back to ledger
                                </Button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 bg-muted/10 p-8 rounded-[2.5rem] border border-border/50">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Retail Rate (Ush)</label>
                                    <p className="text-xl font-black text-primary flex items-center gap-2">
                                        <CurrencyFormat value={item.sellingPrice} />
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cost Basis (Ush)</label>
                                    <p className="text-sm font-bold flex items-center gap-2">
                                        <CurrencyFormat value={item.purchasePrice} />
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendor Authority</label>
                                    <p className="text-sm font-bold flex items-center gap-2 uppercase">
                                        <Truck className="h-4 w-4 text-primary" />
                                        {item.supplierId || 'NO_VENDOR_DATA'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alert Threshold</label>
                                    <p className="text-sm font-bold flex items-center gap-2 text-orange-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        {item.reorderLevel} Units
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center border">
                                <HistoryIcon className="h-4 w-4" />
                            </div>
                            <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Stock Movement History</h3>
                        </div>
                        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
                            <StockMovementList />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card premium-shadow">
                        <CardHeader className="bg-muted/30 border-b py-6 px-8">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Resource Capacity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className={cn(
                                        "text-4xl font-black tracking-tighter",
                                        isLow ? 'text-destructive' : 'text-primary'
                                    )}>{item.quantity}</p>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">In-Stock Units</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-4xl font-black tracking-tighter text-indigo-500">{item.status === 'Active' ? '100%' : '0%'}</p>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Registry Health</p>
                                </div>
                            </div>
                            
                            <Separator className="opacity-50" />
                            
                            <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl relative overflow-hidden group">
                                <Activity className="absolute -right-4 -bottom-4 h-16 w-16 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3" /> Technical Pulse
                                </h4>
                                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic relative z-10">
                                    Consumption rate is within nominal parameters. Transactions are atomic and ledger-verified.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 px-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Registry Date</span>
                            <span className="text-foreground"><FormattedDate date={item.createdAt} formatString="dd/MM/yyyy" /></span>
                        </div>
                        <Separator className="opacity-50" />
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Last Synchronization</span>
                            <span className="text-foreground"><FormattedDate date={item.updatedAt} formatString="dd/MM/yyyy" /></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.5em]">Makros System SKU Registry • Internal Reference Classified</p>
            </div>

            {isEditing && (
                <EditInventoryItemDialog 
                    item={item} 
                    isOpen={isEditing} 
                    onOpenChange={setIsEditing} 
                />
            )}

            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent className="rounded-3xl border-border/50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Purge SKU Record?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                            This action will permanently decommission <span className="font-bold text-foreground">{item.itemName}</span> from the workshop catalog. Physical stock remaining will need to be manually audited.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest text-[10px] h-11 text-white border-none">Confirm Purge</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default InventoryItemPage;
