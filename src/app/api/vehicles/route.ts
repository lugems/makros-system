import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { Vehicle } from '@/types/vehicle';

// GET all vehicles
export async function GET() {
    return NextResponse.json(makrosMockData.vehicles);
}

// POST a new vehicle
export async function POST(req: NextRequest) {
    const vehicle = await req.json();
    vehicle.vehicleId = `VEH-${Date.now().toString().slice(-6)}`;
    vehicle.createdAt = new Date().toISOString();
    vehicle.updatedAt = new Date().toISOString();
    makrosMockData.vehicles.push(vehicle);
    return NextResponse.json(vehicle);
}
