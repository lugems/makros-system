import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { Notification } from '@/types/notification';

// GET all notifications
export async function GET() {
    return NextResponse.json(makrosMockData.notifications);
}

// POST a new notification
export async function POST(req: NextRequest) {
    const notification = await req.json();
    notification.notificationId = `NOT-${Date.now().toString().slice(-6)}`;
    notification.createdAt = new Date().toISOString();
    notification.updatedAt = new Date().toISOString();
    makrosMockData.notifications.push(notification);
    return NextResponse.json(notification);
}
