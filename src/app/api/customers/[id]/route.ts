import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';

// GET a customer by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = makrosMockData.customers.find((c) => c.customerId === id);
    if (!customer) {
        return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(customer);
}

// PUT a customer
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = await req.json();
    const index = makrosMockData.customers.findIndex((c) => c.customerId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }
    makrosMockData.customers[index] = { ...makrosMockData.customers[index], ...customer, updatedAt: new Date().toISOString() };
    return NextResponse.json(makrosMockData.customers[index]);
}

// DELETE a customer
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const index = makrosMockData.customers.findIndex((c) => c.customerId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }
    makrosMockData.customers.splice(index, 1);
    return NextResponse.json({ message: "Customer deleted" });
}
