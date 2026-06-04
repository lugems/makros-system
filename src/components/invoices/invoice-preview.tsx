'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Invoice } from '@/types/invoice';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { JobPart } from '@/types/job-card';
import { WorkshopSettings } from '@/types/settings';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, DocumentReference } from 'firebase/firestore';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Button } from '@/components/ui/button';
import { Printer, Download, FileText, MapPin, Phone, Mail, ShieldCheck, Fingerprint, Receipt, User, Car, Globe, Loader2 } from 'lucide-react';
import PaymentStatusBadge from './payment-status-badge';
import { Separator } from '@/components/ui/separator';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDFDocument } from './invoice-pdf-document';

interface InvoicePreviewProps {
  invoice: Invoice;
}

/**
 * @fileOverview High-fidelity Certified Fiscal Document.
 * Enhanced with @react-pdf client-side construction and print-safe styling.
 */
const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const db = useFirestore();
  
  // Real-time technical streams
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'workshop') as DocumentReference<WorkshopSettings>, [db]);
  const custRef = useMemoFirebase(() => doc(db, 'customers', invoice.customerId), [db, invoice.customerId]);
  const jobRef = useMemoFirebase(() => doc(db, 'jobCards', invoice.jobCardId), [db, invoice.jobCardId]);
  
  const { data: settings } = useDoc<WorkshopSettings>(settingsRef);
  const { data: customer } = useDoc<Customer>(custRef as any);
  const { data: jobCard } = useDoc<any>(jobRef as any);

  const vehRef = useMemoFirebase(() => jobCard ? doc(db, 'vehicles', jobCard.vehicleId) : null, [db, jobCard]);
  const { data: vehicle } = useDoc<Vehicle>(vehRef as any);

  // Fetch detailed parts for the line-item breakdown
  const partsQuery = useMemoFirebase(() => query(
      collection(db, 'jobCards', invoice.jobCardId, 'partsUsed'),
      orderBy('createdAt', 'asc')
  ), [db, invoice.jobCardId]);
  const { data: parts } = useCollection<JobPart>(partsQuery as any);

  const handlePrint = () => {
    window.print();
  };

  const workshop = settings || {
    workshopName: "MAKROS SYSTEM WORKSHOP",
    address: "KAMPALA, UGANDA",
    phone: "+256 000 000 000",
    email: "registry@makrossystem.com",
    taxRate: 18,
    currency: "UGX",
    receiptFooterNote: "Thank you for trusting Makros System Workshop."
  };

  return (
    <div className="bg-white p-8 md:p-16 rounded-3xl shadow-2xl max-w-5xl mx-auto my-6 print:m-0 print:p-10 print:shadow-none print:rounded-none text-slate-900 border border-slate-100 print:border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] rotate-12 pointer-events-none print:hidden">
            <FileText className="h-96 w-96" />
        </div>

        <div className="flex justify-between items-center mb-10 no-print">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary border border-primary/10">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Certified Record Sync Active</span>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-white hover:bg-slate-50 border-slate-200">
                    <Printer className="h-4 w-4" /> Print Layout
                </Button>
                
                <Button asChild className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 cursor-pointer">
                    <PDFDownloadLink 
                        document={<InvoicePDFDocument invoice={invoice} customer={customer} vehicle={vehicle} parts={parts} settings={settings} />} 
                        fileName={`INV-${invoice.invoiceNumber || invoice.invoiceId.slice(-6)}.pdf`}
                    >
                        {({ loading }) => (
                            <>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                <span>Export PDF</span>
                            </>
                        )}
                    </PDFDownloadLink>
                </Button>
            </div>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start pb-12 border-b-2 border-slate-100 gap-10">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    {workshop.logoUrl ? (
                        <div className="relative h-16 w-32 shrink-0">
                            <Image 
                                src={workshop.logoUrl} 
                                alt="Workshop Logo" 
                                fill 
                                className="object-contain" 
                            />
                        </div>
                    ) : (
                        <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shrink-0">
                            <Receipt className="h-8 w-8" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase font-headline text-slate-800">
                            {workshop.workshopName}
                        </h1>
                        {workshop.businessRegistrationName && (
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{workshop.businessRegistrationName}</p>
                        )}
                        {workshop.tin && (
                            <p className="text-[10px] font-mono font-black text-primary/60 uppercase mt-2">TIN: {workshop.tin}</p>
                        )}
                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mt-1">Technical Operations OS</p>
                    </div>
                </div>
                <div className="space-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary/60" /> {workshop.address}</div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Phone className="h-4 w-4 text-primary/60" /> 
                        <span>{workshop.phone}</span>
                        {workshop.additionalPhones?.map((p, i) => (
                            <span key={i} className="before:content-['|'] before:mr-2 before:opacity-30">{p}</span>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Mail className="h-4 w-4 text-primary/60" /> 
                        <span>{workshop.email}</span>
                        {workshop.additionalEmails?.map((e, i) => (
                            <span key={i} className="before:content-['|'] before:mr-2 before:opacity-30">{e}</span>
                        ))}
                    </div>
                    {workshop.website && (
                        <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-primary/60" /> <span>{workshop.website}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="text-right space-y-6 w-full md:w-auto">
                <div className="inline-block bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group border-none">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700">
                        <ShieldCheck className="h-20 w-20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-3 relative z-10 text-center">Certified Record</p>
                    <h2 className="text-3xl font-black tracking-tighter relative z-10 text-center leading-none">#{invoice.invoiceNumber || invoice.invoiceId.slice(-8).toUpperCase()}</h2>
                    <div className="mt-4 flex justify-center relative z-10">
                        <PaymentStatusBadge status={invoice.paymentStatus} className="h-7 text-[9px] px-4 shadow-lg border-none" />
                    </div>
                </div>
            </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-12">
            <div className="space-y-8">
                <div>
                    <h3 className="font-black text-slate-300 mb-4 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> Fiscal Recipient
                    </h3>
                    <div className="pl-6 border-l-2 border-slate-100">
                        <p className="font-black text-2xl text-slate-800 uppercase tracking-tight">{customer?.fullName || 'N/A'}</p>
                        <p className="text-sm font-bold text-slate-500 mt-1">{customer?.phone}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-2 italic">{customer?.address}</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-black text-slate-300 mb-4 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                        <Car className="h-3.5 w-3.5" /> Technical Asset
                    </h3>
                    <div className="pl-6 border-l-2 border-slate-100">
                        <p className="font-black text-xl text-slate-700 uppercase tracking-tight">{vehicle?.make} {vehicle?.model}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-mono font-black bg-slate-100 px-3 py-1 rounded-lg uppercase border border-slate-200">
                                {vehicle?.numberPlate}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year {vehicle?.year}</span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-slate-400 mt-3 uppercase tracking-tighter">VIN: {vehicle?.vin || 'NOT_RECORDED'}</p>
                    </div>
                </div>
            </div>
            <div className="md:text-right space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between md:justify-end gap-10 items-center">
                        <span className="font-black text-slate-300 uppercase text-[10px] tracking-[0.3em]">Temporal Ref</span>
                        <span className="font-black text-slate-800 text-sm"><FormattedDate date={invoice.issuedAt} formatString="dd MMMM yyyy" /></span>
                    </div>
                    {invoice.dueDate && (
                        <div className="flex justify-between md:justify-end gap-10 items-center">
                            <span className="font-black text-slate-300 uppercase text-[10px] tracking-[0.3em]">Maturity Date</span>
                            <span className="font-black text-destructive text-sm"><FormattedDate date={invoice.dueDate} formatString="dd MMMM yyyy" /></span>
                        </div>
                    )}
                </div>
                
                <div className="pt-6">
                    <div className="inline-flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Identity</p>
                            <p className="text-xs font-mono font-bold text-slate-600">CERT-FSC-{invoice.invoiceId.slice(0, 12).toUpperCase()}</p>
                        </div>
                        <ShieldCheck className="h-8 w-8 text-primary/40" />
                    </div>
                </div>
            </div>
        </section>

        <section className="mt-16">
            <table className="w-full">
                <thead>
                    <tr className="border-b-2 border-slate-900 text-left">
                        <th className="py-5 text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Technical Description</th>
                        <th className="py-5 text-center text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Qty</th>
                        <th className="py-5 text-right text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Unit Price</th>
                        <th className="py-5 text-right text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Total ({workshop.currency})</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr>
                        <td className="py-8">
                            <p className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-none">Labor & Diagnostic Yield</p>
                            <p className="text-xs font-medium text-slate-500 mt-2 italic">Diagnostic procedures and technical labor cycles.</p>
                        </td>
                        <td className="py-8 text-center font-bold">1</td>
                        <td className="py-8 text-right font-bold"><CurrencyFormat value={invoice.laborTotal} /></td>
                        <td className="py-8 text-right font-black text-xl">
                            <CurrencyFormat value={invoice.laborTotal} />
                        </td>
                    </tr>
                    {parts && parts.length > 0 ? (
                        parts.map((part) => {
                            const partId = (part as any).id || part.jobPartId;
                            return (
                                <tr key={partId}>
                                    <td className="py-6">
                                        <p className="text-base font-black text-slate-700 uppercase tracking-tight leading-none">{part.itemName || part.itemId}</p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Inventory Allocation</p>
                                    </td>
                                    <td className="py-6 text-center font-bold">{part.quantityUsed}</td>
                                    <td className="py-6 text-right font-bold"><CurrencyFormat value={part.unitPrice} /></td>
                                    <td className="py-6 text-right font-black text-lg">
                                        <CurrencyFormat value={part.unitPrice * part.quantityUsed} />
                                    </td>
                                </tr>
                            );
                        })
                    ) : null}
                </tbody>
            </table>
        </section>

        <section className="flex flex-col items-end mt-12 space-y-6">
            <div className="w-full md:w-80 space-y-4 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-black text-slate-800"><CurrencyFormat value={invoice.laborTotal + invoice.partsTotal} /></span>
                </div>
                {invoice.discount > 0 && (
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-green-600">
                        <span>Certified Discount</span>
                        <span className="font-black">-<CurrencyFormat value={invoice.discount} /></span>
                    </div>
                )}
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-4">
                    <span>Tax Provision</span>
                    <span className="font-black text-slate-800"><CurrencyFormat value={invoice.tax} /></span>
                </div>
                
                <div className="flex justify-between items-end pt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Grand Total</span>
                    <span className="text-4xl font-black text-primary tracking-tighter leading-none"><CurrencyFormat value={invoice.grandTotal} /></span>
                </div>

                <div className="pt-6 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>Net Settled</span>
                        <span className="text-green-600 font-black"><CurrencyFormat value={invoice.amountPaid} /></span>
                    </div>
                    <div className="flex justify-between py-4 px-5 bg-slate-900 rounded-2xl text-white shadow-xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Balance Due</span>
                        <span className="text-xl font-black text-primary tracking-tight leading-none"><CurrencyFormat value={invoice.balance} /></span>
                    </div>
                </div>
            </div>
        </section>

        <footer className="mt-24 pt-10 border-t-2 border-dashed border-slate-200 text-center space-y-8">
            <p className="italic text-slate-400 text-sm font-medium max-w-lg mx-auto leading-relaxed">
                &quot;{workshop.receiptFooterNote}&quot;
            </p>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-16 pt-4">
                <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300">Authorized Official</p>
                    <div className="border-b border-slate-200 pb-1 px-8 min-w-[200px]">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Master Workshop Os</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300">Certified Signature</p>
                    <div className="border-b border-slate-200 pb-1 px-8 min-w-[200px] h-6" />
                </div>
            </div>

            <div className="pt-12">
                <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.8em]">Makros System Financial Analysis • Certified Digital Record</p>
            </div>
        </footer>

        <style jsx global>{`
            @media print {
                .no-print { display: none !important; }
                body { 
                  background: white !important; 
                  padding: 0 !important; 
                  margin: 0 !important;
                }
                .receipt-document {
                  box-shadow: none !important;
                  border: none !important;
                  background: white !important;
                }
                * { 
                  color: #0f172a !important; 
                  text-shadow: none !important;
                  -webkit-print-color-adjust: exact !important; 
                  print-color-adjust: exact !important; 
                }
                .bg-slate-900 { 
                  background-color: #0f172a !important; 
                  color: white !important; 
                }
                .text-white { color: white !important; }
                .text-primary { color: #3b82f6 !important; }
                .bg-primary { background-color: #3b82f6 !important; }
                .bg-slate-50 { background-color: #f8fafc !important; }
            }
        `}</style>
    </div>
  );
};

export default InvoicePreview;
