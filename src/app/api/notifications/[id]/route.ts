import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';

// GET a single notification by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const notification = makrosMockData.notifications.find(n => n.logId === id);
    if (!notification) {
        return new NextResponse('Notification not found', { status: 404 });
    }
    return NextResponse.json(notification);
}

// PUT (update) a single notification by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const updatedNotification = await req.json();
    const index = makrosMockData.notifications.findIndex(n => n.logId === id);
    if (index === -1) {
        return new NextResponse('Notification not found', { status: 404 });
    }
    makrosMockData.notifications[index] = { ...makrosMockData.notifications[index], ...updatedNotification, updatedAt: new Date().toISOString() };
    return NextResponse.json(makrosMockData.notifications[index]);
}

// DELETE a single notification by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const index = makrosMockData.notifications.findIndex(n => n.logId === id);
    if (index === -1) {
        return new NextResponse('Notification not found', { status: 404 });
    }
    makrosMockData.notifications.splice(index, 1);
    return new NextResponse(null, { status: 204 });
}
