'use client';

import React from 'react';
import { Payment } from '@/types/payment';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Fingerprint, CreditCard, Banknote, Smartphone, Wallet, CheckCircle2, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PaymentListProps {
  payments: Payment[];
  selectedPaymentId: string | null;
  onSelectPayment: (id: string) => void;
}

const methodIcons: Record<string, any> = {
    'Cash': Banknote,
    'Mobile Money': Smartphone,
    'Bank Transfer': Wallet,
    'Card': CreditCard,
    'Credit': Fingerprint
};

export function PaymentList({ payments, onSelectPayment, selectedPaymentId }: PaymentListProps) {
  if (payments.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-[2rem] bg-muted/5 text-muted-foreground opacity-40">
            <History className="h-10 w-10 mb-2" />
            <p className="text-sm font-medium italic">No settlement records detected.</p>
        </div>
    );
  }

  return (
    <div className="space-y-3">
        {payments.map((payment) => {
            const isActive = selectedPaymentId === payment.paymentId;
            const Icon = methodIcons[payment.method as string] || CreditCard;

            return (
                <div 
                    key={payment.paymentId}
                    onClick={() => onSelectPayment(payment.paymentId)}
                    className={cn(
                        "cursor-pointer transition-all p-5 rounded-3xl border bg-card hover:border-primary/40 group relative overflow-hidden",
                        isActive ? "border-primary ring-1 ring-primary/10 bg-primary/[0.02]" : "border-border/50 shadow-sm"
                    )}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-300",
                                isActive ? "bg-primary text-white border-primary/20 shadow-lg shadow-primary/20" : "bg-muted/50 text-muted-foreground border-border/50"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <Fingerprint className="h-3 w-3 text-primary/50" />
                                    <span className="text-[9px] font-mono font-black uppercase text-muted-foreground tracking-widest">
                                        {payment.paymentId.toUpperCase().slice(-8)}
                                    </span>
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none">
                                    {payment.method} Settlement
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0.5 bg-green-500/5 text-green-600 border-green-200">
                           <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> SETTLED
                        </Badge>
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-border/50 pt-4">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Transaction Date</p>
                            <p className="text-[10px] font-bold text-foreground/80">
                                <FormattedDate date={payment.paidAt} formatString="dd MMM yyyy" />
                            </p>
                        </div>
                        <div className="text-right space-y-0.5">
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Settled Amount</p>
                            <p className="text-lg font-black text-primary tracking-tighter leading-none">
                                <CurrencyFormat value={payment.amount} abbreviate />
                            </p>
                        </div>
                    </div>
                    
                    {/* Interactive Left Accent */}
                    <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 bg-primary/20 scale-y-0 transition-transform origin-top duration-300",
                        isActive && "scale-y-100"
                    )} />
                </div>
            );
        })}
    </div>
  );
}
