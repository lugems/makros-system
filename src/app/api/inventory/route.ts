import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { InventoryItem } from '@/types/inventory';

// GET all inventory items
export async function GET() {
    return NextResponse.json(makrosMockData.inventory);
}

// POST a new inventory item
export async function POST(req: NextRequest) {
    const item = await req.json();
    item.itemId = `INV-${Date.now().toString().slice(-6)}`;
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    makrosMockData.inventory.push(item);
    return NextResponse.json(item);
}
