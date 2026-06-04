
'use client';

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { JobCard, JobCardStatus } from '@/types/job-card';
import { Vehicle } from '@/types/vehicle';
import { Invoice } from '@/types/invoice';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter,
    DialogBody 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateInvoiceTransaction } from '@/services/invoices-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCheck, Loader2, Receipt } from 'lucide-react';

interface GenerateInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate?: (invoice: Invoice) => void;
}

export default function GenerateInvoiceDialog({ isOpen, onClose, onGenerate }: GenerateInvoiceDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const db = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string>('');

    // Fetch Completed Jobs
    const jobsQuery = useMemo(() => query(
        collection(db, 'jobCards'), 
        where('status', 'in', [JobCardStatus.Completed, JobCardStatus.QualityCheck])
    ) as any, [db]);
    const { data: jobCards } = useCollection<JobCard>(jobsQuery);

    const vehQuery = useMemo(() => query(collection(db, 'vehicles')) as any, [db]);
    const { data: vehicles } = useCollection<Vehicle>(vehQuery);

    const handleGenerate = async () => {
        if (!user || !selectedJobId) return;

        setIsSubmitting(true);
        try {
            const result = await generateInvoiceTransaction(selectedJobId, user.userId);
            toast({ title: "Billing Generated", description: "Repair dossier has been successfully transition to the ledger." });
            if (onGenerate && result) onGenerate(result as unknown as Invoice);
            onClose();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Generation Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
                <DialogHeader className="px-6 pt-6 pb-2 text-left">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Generate Technical Billing</DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Transition a completed operation to the financial ledger.</DialogDescription>
                </DialogHeader>
                
                <DialogBody>
                    <div className="space-y-6 px-6 pb-6 pt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <ClipboardCheck className="h-3.5 w-3.5 text-primary" /> Select Completed bay Load
                            </Label>
                            <Select onValueChange={setSelectedJobId} value={selectedJobId}>
                                <SelectTrigger className="h-14 rounded-2xl bg-muted/50 border-none font-bold">
                                    <SelectValue placeholder="Choose a completed job card..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border/50">
                                    {jobCards?.map(jc => {
                                        const vehicle = vehicles?.find(v => v.vehicleId === jc.vehicleId);
                                        return (
                                            <SelectItem key={jc.jobCardId} value={jc.jobCardId} className="font-bold text-xs uppercase py-3">
                                                #{jc.jobCardId.slice(-6).toUpperCase()} • {vehicle?.numberPlate} • {jc.reportedIssue.slice(0, 30)}...
                                            </SelectItem>
                                        );
                                    })}
                                    {(!jobCards || jobCards.length === 0) && (
                                        <SelectItem value="none" disabled className="italic">No unbilled completed jobs found.</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-primary/5 p-5 rounded-2xl border border-dashed border-primary/20">
                            <p className="text-[10px] font-medium leading-relaxed italic text-muted-foreground">
                                Note: This action will atomically aggregate all labor costs and allocated inventory materials into a certified billing record.
                            </p>
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter className="p-6 border-t">
                    <Button 
                        onClick={handleGenerate} 
                        disabled={!selectedJobId || isSubmitting}
                        className="w-full h-14 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Receipt className="h-4 w-4 mr-2" /> Finalize & Bill</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
