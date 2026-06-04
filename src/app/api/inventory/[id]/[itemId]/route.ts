import { NextRequest, NextResponse } from "next/server";
import { getInventoryItemById, updateInventoryItem, deleteInventoryItem } from '@/services/inventory-service';

/**
 * Technical endpoint for individual SKU operations.
 * Recalibrated for Next.js 15 dynamic routing patterns.
 */

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
    try {
        const { itemId } = await params;
        const item = await getInventoryItemById(itemId);
        if (!item) return NextResponse.json({ message: "SKU not located" }, { status: 404 });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ message: "Registry error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
    try {
        const { itemId } = await params;
        const data = await req.json();
        const userId = req.headers.get('x-user-id') || 'system';
        await updateInventoryItem(itemId, data, userId);
        return NextResponse.json({ message: "Record synchronized" });
    } catch (error) {
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
    try {
        const { itemId } = await params;
        const userId = req.headers.get('x-user-id') || 'system';
        await deleteInventoryItem(itemId, userId);
        return NextResponse.json({ message: "Record purged" });
    } catch (error) {
        return NextResponse.json({ message: "Purge failed" }, { status: 500 });
    }
}
