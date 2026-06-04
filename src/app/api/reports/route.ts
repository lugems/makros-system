import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    reportType: searchParams.get('reportType'),
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
  };

  try {
    // const reports = await getFilteredReports(filters);
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
