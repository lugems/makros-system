import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { WorkshopSettings } from '@/types/settings';

// GET settings
export async function GET() {
    return NextResponse.json(makrosMockData.workshopSettings);
}

// PUT (update) settings
export async function PUT(req: NextRequest) {
    const updatedSettings: WorkshopSettings = await req.json();
    makrosMockData.workshopSettings = { ...makrosMockData.workshopSettings, ...updatedSettings, updatedAt: new Date().toISOString() };
    return NextResponse.json(makrosMockData.workshopSettings);
}
