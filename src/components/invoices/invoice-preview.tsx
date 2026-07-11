'use client';

import React from 'react';
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
import { Printer, Download, FileText, MapPin, Phone, Mail, ShieldCheck, Fingerprint, Receipt, User, Car, Globe, Loader2, TrendingUp, Landmark, CreditCard, Binary } from 'lucide-react';
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
 * Synchronized with the Midnight Slate theme and Workshop Bank Authority.
 */
const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const db = useFirestore();
  
  // Real-time technical streams
  const settingsRef = useMemoFirebase(() => {
      if (!db) return null;
      return doc(db, 'settings', 'workshop') as DocumentReference<WorkshopSettings>;
  }, [db]);

  const custRef = useMemoFirebase(() => {
      if (!db || !invoice?.customerId) return null;
      return doc(db, 'customers', invoice.customerId);
  }, [db, invoice?.customerId]);
  
  const jobRef = useMemoFirebase(() => {
      if (!db || !invoice?.jobCardId) return null;
      return doc(db, 'jobCards', invoice.jobCardId);
  }, [db, invoice?.jobCardId]);
  
  const { data: settings } = useDoc<WorkshopSettings>(settingsRef);
  const { data: customer } = useDoc<Customer>(custRef as any);
  const { data: jobCard } = useDoc<any>(jobRef as any);

  const vehRef = useMemoFirebase(() => {
      if (!db || !jobCard?.vehicleId) return null;
      return doc(db, 'vehicles', jobCard.vehicleId);
  }, [db, jobCard]);
  const { data: vehicle } = useDoc<Vehicle>(vehRef as any);

  // Fetch detailed parts for the line-item breakdown
  const partsQuery = useMemoFirebase(() => {
      if (!db || !invoice?.jobCardId) return null;
      return query(
          collection(db, 'jobCards', invoice.jobCardId, 'partsUsed'),
          orderBy('createdAt', 'asc')
      );
  }, [db, invoice?.jobCardId]);
  const { data: parts } = useCollection<JobPart>(partsQuery as any);

  const handlePrint = () => {
    window.print();
  };

  const workshop: WorkshopSettings = settings || {
    workshopName: "MAKROS SYSTEM WORKSHOP",
    address: "KAMPALA, UGANDA",
    phone: "+256 000 000 000",
    email: "registry@makrossystem.com",
    taxRate: 18,
    currency: "UGX",
    receiptFooterNote: "Thank you for trusting Makros System Workshop.",
    logoUrl: '',
    businessRegistrationName: '',
    tin: '',
    additionalPhones: [],
    additionalEmails: [],
    website: '',
    bankName: '',
    bankBranch: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankSwiftCode: '',
    settingsId: '',
    secondaryPhone: '',
    timezone: '',
    language: 'English',
    taxEnabled: false,
    taxName: '',
    defaultDiscount: 0,
    invoicePrefix: '',
    invoiceStartNumber: 0,
    receiptPrefix: '',
    receiptStartNumber: 0,
    paymentMethods: {
        cash: false,
        mobileMoney: false,
        bankTransfer: false,
        card: false,
        credit: false
    },
    notifications: {
        sms: false,
        email: false,
        whatsapp: false,
        inApp: false,
        bookingReminders: false,
        jobStatusUpdates: false,
        paymentReminders: false,
        serviceReminders: false,
        lowStockAlerts: false
    },
    operatingHours: [],
    inventoryAlerts: {
        lowStockEnabled: false,
        notifyInventoryOfficer: false,
        notifyWorkshopManager: false
    },
    createdAt: '',
    updatedAt: ''
  };

  const fileName = invoice.invoiceNumber 
    ? `${invoice.invoiceNumber}.pdf` 
    : `Invoice-${invoice.invoiceId.toUpperCase().slice(-8)}.pdf`;

  return (
    <div className="bg-card p-8 md:p-16 rounded-[2.5rem] shadow-2xl max-w-5xl mx-auto my-6 print-container text-foreground border border-border/50 print:border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] rotate-12 pointer-events-none print:hidden">
            <FileText className="h-96 w-96" />
        </div>

        <div className="flex justify-between items-center mb-10 no-print">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary border border-primary/10">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Certified Record Sync Active</span>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-background hover:bg-muted border-border/50">
                    <Printer className="h-4 w-4" /> Print Layout
                </Button>
                
                <Button asChild className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 cursor-pointer">
                    <PDFDownloadLink 
                        document={<InvoicePDFDocument invoice={invoice} customer={customer} vehicle={vehicle} parts={parts} settings={settings} />} 
                        fileName={fileName}
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

        <header className="flex flex-col md:flex-row justify-between items-start pb-12 border-b-2 border-border/20 gap-10">
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
                        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
                            <Receipt className="h-8 w-8" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase font-headline text-foreground">
                            {workshop.workshopName}
                        </h1>
                        {workshop.businessRegistrationName && (
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">{workshop.businessRegistrationName}</p>
                        )}
                        {workshop.tin && (
                            <p className="text-[9px] font-mono font-black text-primary/60 uppercase mt-2">TIN: {workshop.tin}</p>
                        )}
                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mt-1">Technical Operations OS</p>
                    </div>
                </div>
                <div className="space-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary/60" /> {workshop.address}</div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Phone className="h-4 w-4 text-primary/60" /> 
                        <span>{workshop.phone}</span>
                        {workshop.additionalPhones?.map((p: string, i: number) => (
                            <span key={i} className="before:content-['|'] before:mr-2 before:opacity-30">{p}</span>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Mail className="h-4 w-4 text-primary/60" /> 
                        <span>{workshop.email}</span>
                        {workshop.additionalEmails?.map((e: string, i: number) => (
                            <span key={i} className="before:content-['|'] before:mr-2 before:opacity-30">{e}</span>
                        ))}
                    </div>
                    {workshop.website && (
                        <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-primary/60" />
                            <span>{workshop.website}</span>
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
                    <h3 className="font-black text-muted-foreground/30 mb-4 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> Fiscal Recipient
                    </h3>
                    <div className="pl-6 border-l-2 border-border/40">
                        <p className="font-black text-2xl text-foreground uppercase tracking-tight">{customer?.fullName || 'N/A'}</p>
                        <p className="text-sm font-bold text-muted-foreground mt-1">{customer?.phone}</p>
                        <p className="text-[11px] font-medium text-muted-foreground/60 mt-2 italic">{customer?.address}</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-black text-muted-foreground/30 mb-4 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                        <Car className="h-3.5 w-3.5" /> Technical Asset
                    </h3>
                    <div className="pl-6 border-l-2 border-border/40">
                        <p className="font-black text-xl text-foreground/80 uppercase tracking-tight">{vehicle?.make} {vehicle?.model}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-mono font-black bg-muted/50 px-3 py-1 rounded-lg uppercase border border-border/50">
                                {vehicle?.numberPlate}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Year {vehicle?.year}</span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-muted-foreground mt-3 uppercase tracking-tighter">VIN: {vehicle?.vin || 'NOT_RECORDED'}</p>
                    </div>
                </div>
            </div>
            <div className="md:text-right space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between md:justify-end gap-10 items-center">
                        <span className="font-black text-muted-foreground/30 uppercase text-[10px] tracking-[0.3em]">Temporal Ref</span>
                        <span className="font-black text-foreground text-sm"><FormattedDate date={invoice.issuedAt} formatString="dd MMMM yyyy" /></span>
                    </div>
                    {invoice.dueDate && (
                        <div className="flex justify-between md:justify-end gap-10 items-center">
                            <span className="font-black text-muted-foreground/30 uppercase text-[10px] tracking-[0.3em]">Maturity Date</span>
                            <span className="font-black text-destructive text-sm"><FormattedDate date={invoice.dueDate} formatString="dd MMMM yyyy" /></span>
                        </div>
                    )}
                </div>
                
                <div className="pt-6">
                    <div className="inline-flex items-center gap-3 bg-muted/20 p-4 rounded-2xl border border-border/50">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Fiscal Identity</p>
                            <p className="text-xs font-mono font-bold text-foreground/60">CERT-FSC-{invoice.invoiceId.slice(0, 12).toUpperCase()}</p>
                        </div>
                        <ShieldCheck className="h-8 w-8 text-primary/40" />
                    </div>
                </div>
            </div>
        </section>

        <section className="mt-16">
            <table className="w-full">
                <thead>
                    <tr className="border-b-2 border-foreground text-left">
                        <th className="py-5 text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">Technical Description</th>
                        <th className="py-5 text-center text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">Qty</th>
                        <th className="py-5 text-right text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">Unit Price</th>
                        <th className="py-5 text-right text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">Total ({workshop.currency})</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                    <tr>
                        <td className="py-8">
                            <p className="text-lg font-black text-foreground uppercase tracking-tighter leading-none">Labor & Diagnostic Yield</p>
                            <p className="text-xs font-medium text-muted-foreground mt-2 italic">Diagnostic procedures and technical labor cycles.</p>
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
                                        <p className="text-base font-black text-foreground/80 uppercase tracking-tight leading-none">{part.itemName || part.itemId}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-widest">Inventory Allocation</p>
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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
            <div>
                {workshop.bankName && (
                    <div className="p-8 rounded-[2rem] bg-muted/20 border border-border/50 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-primary" /> Payment Instructions
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Bank Institution</p>
                                <p className="text-sm font-black uppercase">{workshop.bankName}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{workshop.bankBranch}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Account Title</p>
                                <p className="text-sm font-black uppercase">{workshop.bankAccountName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Account No</p>
                                    <p className="text-sm font-mono font-black">{workshop.bankAccountNumber}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">SWIFT / BIC</p>
                                    <p className="text-sm font-mono font-black text-primary">{workshop.bankSwiftCode}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end space-y-6">
                <div className="w-full md:w-80 space-y-4 bg-muted/20 p-8 rounded-[2rem] border border-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 transition-transform group-hover:rotate-45">
                        <TrendingUp className="h-32 w-32" />
                    </div>
                    
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground relative z-10">
                        <span>Subtotal</span>
                        <span className="font-black text-foreground"><CurrencyFormat value={invoice.laborTotal + invoice.partsTotal} /></span>
                    </div>
                    {invoice.discount > 0 && (
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-green-600 relative z-10">
                            <span>Certified Discount</span>
                            <span className="font-black">-<CurrencyFormat value={invoice.discount} /></span>
                        </div>
                    )}
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-4 relative z-10">
                        <span>Tax Provision</span>
                        <span className="font-black text-foreground"><CurrencyFormat value={invoice.tax} /></span>
                    </div>
                    
                    <div className="flex justify-between items-end pt-2 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Grand Total</span>
                        <span className="text-4xl font-black text-primary tracking-tighter leading-none"><CurrencyFormat value={invoice.grandTotal} /></span>
                    </div>

                    <div className="pt-6 space-y-3 relative z-10">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                            <span>Net Settled</span>
                            <span className="text-green-600 font-black"><CurrencyFormat value={invoice.amountPaid} /></span>
                        </div>
                        <div className="flex justify-between py-4 px-5 bg-slate-900 rounded-2xl text-white shadow-xl">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Balance Due</span>
                            <span className="text-xl font-black text-primary tracking-tight leading-none"><CurrencyFormat value={invoice.balance} /></span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <footer className="mt-24 pt-10 border-t-2 border-dashed border-border/20 text-center space-y-8">
            <p className="italic text-muted-foreground/60 text-sm font-medium max-w-lg mx-auto leading-relaxed">
                &quot;{workshop.receiptFooterNote}&quot;
            </p>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-16 pt-4">
                <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">Authorized Official</p>
                    <div className="border-b border-border/40 pb-1 px-8 min-w-[200px]">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Master Workshop Os</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">Certified Signature</p>
                    <div className="border-b border-border/40 pb-1 px-8 min-w-[200px] h-6" />
                </div>
            </div>

            <div className="pt-12">
                <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.8em]">Makros System Financial Analysis • Certified Digital Record</p>
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
                .bg-card {
                  box-shadow: none !important;
                  border: none !important;
                  background: white !import; 
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
                .bg-muted, .bg-muted\/20 { background-color: #f8fafc !important; }
                .border-border, .border-border\/20 { border-color: #e2e8f0 !important; }
            }
        `}</style>
    </div>
  );
};

export default InvoicePreview;
