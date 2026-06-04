'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  RefreshCcw, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Mock types based on your codebase patterns
interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  date: Date;
  method: string;
  status: 'Cleared' | 'Pending' | 'Flagged';
}

export default function PaymentsPage() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]); // Initialize with your data fetch

  const selectedPayment = payments.find(p => p.id === selectedPaymentId);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* 
        HEADER SECTION 
        Fixed: Flex-col on mobile to prevent button overflow 
      */}
      <header className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title Area */}
            <div className="min-w-0">
              <h1 className="text-xl font-black uppercase tracking-tight sm:text-2xl truncate">
                Receipt Inspection
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-0.5 truncate flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> Certified Transaction Record Active
              </p>
            </div>

            {/* Actions Area - Flexible buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 rounded-xl font-bold uppercase tracking-wider text-[10px] flex-1 sm:flex-none border-primary/20 hover:bg-primary/5"
              >
                <RefreshCcw className="h-3 w-3 mr-2" /> Refresh Ledger
              </Button>
              <Button 
                size="sm"
                className="h-9 rounded-xl font-bold uppercase tracking-wider text-[10px] flex-1 sm:flex-none shadow-lg shadow-primary/20"
              >
                <Download className="h-3 w-3 mr-2" /> Export Registry
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden">
        
        {/* LEDGER LIST (SIDEBAR) */}
        <div className="w-full sm:w-[380px] lg:w-[420px] border-r flex flex-col min-h-0 bg-muted/5">
           <div className="p-4 border-b bg-background/50">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Search settlement records..." 
                 className="pl-9 bg-muted/30 border-none rounded-xl h-10 text-xs focus-visible:ring-primary/20"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
           </div>
           
           <ScrollArea className="flex-1" type="always">
             <div className="p-4 space-y-3">
               {payments.length > 0 ? (
                 payments.map((payment) => (
                   <button
                     key={payment.id}
                     onClick={() => setSelectedPaymentId(payment.id)}
                     className={cn(
                       "w-full text-left p-4 rounded-2xl transition-all border outline-none",
                       selectedPaymentId === payment.id 
                        ? "bg-background border-primary shadow-sm" 
                        : "bg-background/40 border-transparent hover:border-muted-foreground/20"
                     )}
                   >
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                         #{payment.invoiceNumber}
                       </span>
                       <Badge variant={payment.status === 'Cleared' ? 'default' : 'secondary'} className="text-[9px] font-bold uppercase tracking-tighter">
                         {payment.status}
                       </Badge>
                     </div>
                     <div className="text-sm font-bold truncate mb-1">{payment.customerName}</div>
                     <div className="flex justify-between items-center">
                       <span className="text-xs font-mono font-medium text-primary">${payment.amount.toLocaleString()}</span>
                       <span className="text-[10px] text-muted-foreground">{format(payment.date, 'MMM dd, yyyy')}</span>
                     </div>
                   </button>
                 ))
               ) : (
                 <div className="text-center py-20 opacity-30 italic text-xs">
                   No transactions loaded in active memory.
                 </div>
               )}
             </div>
           </ScrollArea>
        </div>

        {/* DETAILED INSPECTION VIEW (DESKTOP ONLY) */}
        <div className="hidden sm:flex flex-1 flex-col min-h-0 bg-background">
          {selectedPayment ? (
             <ScrollArea className="flex-1" type="always">
               <div className="p-8 max-w-3xl mx-auto w-full">
                 {/* Transaction Details Content */}
                 <div className="p-8 border-2 border-dashed rounded-[2.5rem] bg-muted/10">
                    <div className="flex justify-between items-start mb-12">
                        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                            <Receipt className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Certified Record</div>
                            <div className="text-2xl font-black">{selectedPayment.invoiceNumber}</div>
                        </div>
                    </div>
                    {/* ... rest of payment details ... */}
                 </div>
               </div>
             </ScrollArea>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="h-16 w-16 rounded-3xl bg-background/50 flex items-center justify-center mb-6 shadow-sm border border-border/50">
                    <FileText className="h-8 w-8 opacity-20" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-2">Settlement Inspector</h3>
                <p className="text-xs font-medium italic opacity-40 leading-relaxed max-w-[240px] mx-auto">
                    Select a settlement record from the ledger to view certified receipts and forensic transaction details.
                </p>
             </div>
          )}
        </div>
      </main>

      {/* MOBILE DRAWER */}
      {isMobile && selectedPayment && (
        <Drawer open={!!selectedPaymentId} onOpenChange={(open) => !open && setSelectedPaymentId(null)}>
          <DrawerContent className="max-h-[92dvh] flex flex-col outline-none">
            {/* Safe drag handle */}
            <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
            
            <DrawerHeader className="shrink-0 border-b pb-4 text-left">
              <DrawerTitle className="text-xl font-black uppercase tracking-tight">
                Transaction Archive
              </DrawerTitle>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">
                Forensic Receipt Data Loaded
              </div>
            </DrawerHeader>

            {/* Scrollable Body - min-h-0 flex-1 logic */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-6">
                 {/* Receipt Data Components */}
                 <div className="space-y-6">
                    <div className="flex justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Reference</span>
                        <span className="text-xs font-mono font-bold">{selectedPayment.invoiceNumber}</span>
                    </div>
                    {/* ... other details ... */}
                 </div>
              </div>
            </div>

            <DrawerFooter className="border-t p-4 shrink-0 bg-background">
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-sm"
                onClick={() => setSelectedPaymentId(null)}
              >
                Dismiss Ledger
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
