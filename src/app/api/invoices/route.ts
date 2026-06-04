import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { Invoice } from '@/types/invoice';

// GET all invoices
export async function GET() {
    return NextResponse.json(makrosMockData.invoices);
}

// POST a new invoice
export async function POST(req: NextRequest) {
    const invoice = await req.json();
    invoice.invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    invoice.createdAt = new Date().toISOString();
    invoice.updatedAt = new Date().toISOString();
    makrosMockData.invoices.push(invoice);
    return NextResponse.json(invoice);
}
