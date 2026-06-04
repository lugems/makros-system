'use client';

import React from 'react';
import { Invoice } from '@/types/invoice';
import useMakrosStore from '@/store/makros-store';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { FileCheck, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReceiptPreviewProps {
  invoice: Invoice;
  paymentAmount: number;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ invoice, paymentAmount }) => {
  const { customers, workshopSettings } = useMakrosStore();
  const customer = customers.find(c => c.customerId === invoice.customerId);
  const workshop = workshopSettings;

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm max-w-md mx-auto my-4 print-container text-slate-900 border border-slate-200">
      <div className="flex justify-end mb-4 no-print">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
          </Button>
      </div>

      <header className="text-center pb-6 border-b-2 border-dashed border-slate-300">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <FileCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">{workshop.workshopName}</h1>
        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">{workshop.address}</p>
        <p className="text-slate-400 text-[10px] font-bold">{workshop.phone}</p>
        <h2 className="text-2xl font-black text-slate-800 mt-4 tracking-tighter">PAYMENT RECEIPT</h2>
      </header>

      <section className="mt-6 space-y-2 text-xs font-medium">
        <div className="flex justify-between border-b border-slate-50 pb-2">
          <span className="text-slate-400 uppercase tracking-wider text-[9px]">Receipt No</span>
          <span className="font-bold">#REC-{invoice.invoiceId.slice(-4).toUpperCase()}</span>
        </div>
        <div className="flex justify-between border-b border-slate-50 pb-2">
          <span className="text-slate-400 uppercase tracking-wider text-[9px]">Date Paid</span>
          <span className="font-bold"><FormattedDate date={new Date().toISOString()} formatString="dd MMM yyyy HH:mm" /></span>
        </div>
        <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400 uppercase tracking-wider text-[9px]">Invoice Ref</span>
            <span className="font-bold">{invoice.invoiceNumber || invoice.invoiceId}</span>
        </div>

        <div className="pt-4">
            <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-1">RECEIVED FROM</p>
            <p className="font-black text-slate-800 text-sm">{customer?.fullName || 'Valued Customer'}</p>
        </div>
      </section>
      
      <section className="mt-8">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="text-left py-2 uppercase tracking-widest text-[9px]">DESCRIPTION</th>
              <th className="text-right py-2 uppercase tracking-widest text-[9px]">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-50">
              <td className="py-3 font-bold text-slate-700">Payment for Vehicle Services</td>
              <td className="py-3 text-right font-black"><CurrencyFormat value={paymentAmount} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mt-8 space-y-3 bg-slate-50 p-4 rounded-lg">
        <div className="flex justify-between items-center text-primary">
          <span className="font-black uppercase tracking-widest text-[10px]">TOTAL PAID</span>
          <span className="text-2xl font-black"><CurrencyFormat value={paymentAmount} /></span>
        </div>
        <div className="flex justify-between text-slate-400 border-t border-slate-200 pt-2">
            <span className="font-bold uppercase tracking-widest text-[9px]">BALANCE DUE</span>
            <span className="font-bold"><CurrencyFormat value={Math.max(0, invoice.balance - paymentAmount)} /></span>
        </div>
      </section>

      <footer className="mt-10 pt-6 border-t-2 border-dashed border-slate-200 text-center space-y-4">
        <p className="italic text-slate-400 text-[10px]">&quot;{workshop.receiptFooterNote}&quot;</p>
        <p className="text-[8px] font-black text-slate-200 uppercase tracking-[0.4em]">AUTHORIZED SIGNATURE</p>
      </footer>

      <style jsx global>{`
        @media print {
          .print-container {
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
          body { background: white !important; }
          * { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPreview;
