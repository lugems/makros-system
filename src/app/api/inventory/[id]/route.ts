// This file is deprecated to resolve the dynamic route slug conflict ('id' !== 'itemId').
// The inventory registry now uses the [itemId] technical endpoint to match the app directory.
export const dynamic = 'force-dynamic';

export async function GET() {
    return new Response("Deprecated endpoint. Use /api/inventory/[itemId] for technical data.", { status: 410 });
}
