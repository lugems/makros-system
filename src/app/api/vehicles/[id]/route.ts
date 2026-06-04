import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';

// GET a vehicle by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vehicle = makrosMockData.vehicles.find((v) => v.vehicleId === id);
    if (!vehicle) {
        return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }
    return NextResponse.json(vehicle);
}

// PUT a vehicle
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vehicle = await req.json();
    const index = makrosMockData.vehicles.findIndex((v) => v.vehicleId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }
    makrosMockData.vehicles[index] = { ...makrosMockData.vehicles[index], ...vehicle, updatedAt: new Date().toISOString() };
    return NextResponse.json(makrosMockData.vehicles[index]);
}

// DELETE a vehicle
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const index = makrosMockData.vehicles.findIndex((v) => v.vehicleId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }
    makrosMockData.vehicles.splice(index, 1);
    return NextResponse.json({ message: "Vehicle deleted" });
}
