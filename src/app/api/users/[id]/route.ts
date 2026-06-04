import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateStaffRecord, purgeStaffRecord } from '@/services/users-service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserById(id);
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error fetching user:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateStaffRecord(id, body, 'system');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error updating user:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await purgeStaffRecord(id, 'system');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting user:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
