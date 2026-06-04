'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyFormat } from '@/components/shared/currency-format';

interface InvoiceSummaryCardsProps {
    stats: {
        totalInvoices: number;
        totalValue: number;
        totalPaid: number;
        balanceDue: number;
        Paid: number;
        Unpaid: number;
        'Partially Paid': number;
        Overdue: number;
    }
}

const InvoiceSummaryCards: React.FC<InvoiceSummaryCardsProps> = ({ stats }) => {
    const summaryData = [
        { title: 'Total Invoices', value: stats.totalInvoices, isCurrency: false },
        { title: 'Total Value', value: stats.totalValue, isCurrency: true },
        { title: 'Total Paid', value: stats.totalPaid, isCurrency: true },
        { title: 'Balance Due', value: stats.balanceDue, isCurrency: true, className: 'text-destructive' },
        { title: 'Paid Invoices', value: stats.Paid, isCurrency: false },
        { title: 'Unpaid Invoices', value: stats.Unpaid, isCurrency: false },
        { title: 'Partially Paid', value: stats['Partially Paid'], isCurrency: false },
        { title: 'Overdue', value: stats.Overdue, isCurrency: false },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summaryData.map(item => (
                <Card key={item.title} className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${item.className || ''}`}>
                            {item.isCurrency ? <CurrencyFormat value={Number(item.value)} /> : item.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default InvoiceSummaryCards;