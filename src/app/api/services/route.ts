import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { MakrosService } from '@/types/makros-service';

// GET all services
export async function GET() {
    return NextResponse.json(makrosMockData.services);
}

// POST a new service
export async function POST(req: NextRequest) {
    const service = await req.json();
    service.serviceId = `SRV-${Date.now().toString().slice(-6)}`;
    service.createdAt = new Date().toISOString();
    service.updatedAt = new Date().toISOString();
    makrosMockData.services.push(service);
    return NextResponse.json(service);
}
