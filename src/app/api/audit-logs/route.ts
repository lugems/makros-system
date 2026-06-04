import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { AuditLog } from '@/types/audit-log';

// GET all audit logs
export async function GET() {
    return NextResponse.json(makrosMockData.auditLogs);
}

// POST a new audit log
export async function POST(req: NextRequest) {
    const log = await req.json();
    log.logId = `LOG-${Date.now().toString().slice(-6)}`;
    log.createdAt = new Date().toISOString();
    makrosMockData.auditLogs.push(log);
    return NextResponse.json(log);
}
