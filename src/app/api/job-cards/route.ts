import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';
import { JobCard } from '@/types/job-card';

// GET all job cards
export async function GET() {
    return NextResponse.json(makrosMockData.jobCards);
}

// POST a new job card
export async function POST(req: NextRequest) {
    const jobCard = await req.json();
    jobCard.jobCardId = `JC-${Date.now().toString().slice(-6)}`;
    jobCard.createdAt = new Date().toISOString();
    jobCard.updatedAt = new Date().toISOString();
    makrosMockData.jobCards.push(jobCard);
    return NextResponse.json(jobCard);
}
