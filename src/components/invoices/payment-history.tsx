'use client';

import React from 'react';
import { Payment } from '@/types/payment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedDate } from '@/components/shared/formatted-date';
import { CurrencyFormat } from '@/components/shared/currency-format';

interface PaymentHistoryProps {
    payments: Payment[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
    if (payments.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {payments.map(payment => (
                        <li key={payment.paymentId} className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{payment.method}</p>
                                <p className="text-sm text-gray-500">Ref: {payment.transactionRef || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold"><CurrencyFormat value={payment.amount} /></p>
                                <p className="text-sm text-gray-500"><FormattedDate date={payment.paidAt} /></p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}