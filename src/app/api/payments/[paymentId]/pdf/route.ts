import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * @fileOverview Forensic PDF Receipt Export Endpoint.
 * Utilizes Puppeteer to capture high-fidelity transaction snapshots.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const url = new URL(req.url);
    const previewUrl = `${url.origin}/payments/${paymentId}/preview`;

    // Initialize the forensic snapshot engine
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Load the technical preview
    await page.goto(previewUrl, {
      waitUntil: 'networkidle0',
    });

    // Capture the print-optimized PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm',
      },
    });

    await browser.close();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=PAY-${paymentId.slice(-6).toUpperCase()}.pdf`,
      },
    });
  } catch (error: any) {
    console.error('Receipt PDF Export Failure:', error);
    return NextResponse.json(
      { error: 'Failed to generate forensic receipt export.', details: error.message },
      { status: 500 }
    );
  }
}
