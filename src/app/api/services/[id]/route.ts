import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';

// PUT a service
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const service = await req.json();
    const index = makrosMockData.services.findIndex((s) => s.serviceId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }
    makrosMockData.services[index] = { ...makrosMockData.services[index], ...service, updatedAt: new Date().toISOString() };
    return NextResponse.json(makrosMockData.services[index]);
}

// DELETE a service
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const index = makrosMockData.services.findIndex((s) => s.serviceId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }
    makrosMockData.services.splice(index, 1);
    return NextResponse.json({ message: "Service deleted" });
}
