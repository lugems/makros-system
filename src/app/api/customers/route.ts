import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { Customer } from '@/types/customer';

// GET all customers
export async function GET() {
    return NextResponse.json(makrosMockData.customers);
}

// POST a new customer
export async function POST(req: NextRequest) {
    const customer = await req.json();
    customer.customerId = `CUST-${Date.now().toString().slice(-6)}`;
    customer.createdAt = new Date().toISOString();
    customer.updatedAt = new Date().toISOString();
    makrosMockData.customers.push(customer);
    return NextResponse.json(customer);
}
