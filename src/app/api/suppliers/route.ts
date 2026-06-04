import { NextResponse } from 'next/server';
import { createSupplier, getSuppliers } from '@/services/suppliers-service';

export async function GET() {
  try {
    const suppliers = await getSuppliers();
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'system';
    const newSupplier = await createSupplier(body, userId);
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
