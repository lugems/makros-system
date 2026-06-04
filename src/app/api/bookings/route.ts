import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { Booking } from '@/types/booking';

// GET all bookings
export async function GET() {
    return NextResponse.json(makrosMockData.bookings);
}

// POST a new booking
export async function POST(req: NextRequest) {
    const booking = await req.json();
    booking.bookingId = `BK-${Date.now().toString().slice(-6)}`;
    booking.createdAt = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    makrosMockData.bookings.push(booking);
    return NextResponse.json(booking);
}
