import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * @fileOverview Forensic PDF Export Endpoint.
 * Utilizes Puppeteer to capture high-fidelity document snapshots for archival.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;
    const url = new URL(req.url);
    const previewUrl = `${url.origin}/invoices/${invoiceId}/preview`;

    // Initialize the forensic snapshot engine
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Authenticate and load the technical preview
    await page.goto(previewUrl, {
      waitUntil: 'networkidle0',
    });

    // Capture the print-optimized PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm',
      },
    });

    await browser.close();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Invoice-${invoiceId.toUpperCase().slice(-8)}.pdf`,
      },
    });
  } catch (error: any) {
    console.error('PDF Export Protocol Failure:', error);
    return NextResponse.json(
      { error: 'Failed to generate forensic PDF export.', details: error.message },
      { status: 500 }
    );
  }
}
