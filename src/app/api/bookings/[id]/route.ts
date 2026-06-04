import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';

// GET a booking by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const booking = makrosMockData.bookings.find((b) => b.bookingId === id);
    if (!booking) {
        return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(booking);
}

// PUT a booking
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const booking = await req.json();
    const index = makrosMockData.bookings.findIndex((b) => b.bookingId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    makrosMockData.bookings[index] = { ...makrosMockData.bookings[index], ...booking, updatedAt: new Date().toISOString() };
    return NextResponse.json(makrosMockData.bookings[index]);
}

// DELETE a booking
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const index = makrosMockData.bookings.findIndex((b) => b.bookingId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    makrosMockData.bookings.splice(index, 1);
    return NextResponse.json({ message: "Booking deleted" });
}
