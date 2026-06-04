import { NextResponse } from 'next/server';
import { enrollStaff, getAllUsers } from '@/services/users-service';

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName, role } = body;

    if (!email || !password || !displayName || !role) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const newUser = await enrollStaff({ email, fullName: displayName, role }, 'system');
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
