import { NextRequest, NextResponse } from 'next/server';
import { getSupplierById, updateSupplier, deleteSupplier } from '@/services/suppliers-service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supplier = await getSupplierById(id);
    if (!supplier) {
      return new NextResponse('Supplier not found', { status: 404 });
    }
    return NextResponse.json(supplier);
  } catch (error) {
    console.error(`Error fetching supplier:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateSupplier(id, body);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error updating supplier:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteSupplier(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting supplier:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
