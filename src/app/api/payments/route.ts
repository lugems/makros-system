import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { Payment } from '@/types/payment';

// GET all payments
export async function GET() {
    return NextResponse.json(makrosMockData.payments);
}

// POST a new payment
export async function POST(req: NextRequest) {
    const payment = await req.json();
    payment.paymentId = `PAY-${Date.now().toString().slice(-6)}`;
    payment.createdAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();
    makrosMockData.payments.push(payment);
    return NextResponse.json(payment);
}
