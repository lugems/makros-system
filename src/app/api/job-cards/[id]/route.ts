import {NextRequest, NextResponse} from "next/server";
import { makrosMockData } from '@/data/mock-data';

// GET a job card by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const jobCard = makrosMockData.jobCards.find((jc) => jc.jobCardId === id);
    if (!jobCard) {
        return NextResponse.json({ message: "Job card not found" }, { status: 404 });
    }
    return NextResponse.json(jobCard);
}

// PUT a job card
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const jobCard = await req.json();
    const index = makrosMockData.jobCards.findIndex((jc) => jc.jobCardId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Job card not found" }, { status: 404 });
    }
    makrosMockData.jobCards[index] = { ...makrosMockData.jobCards[index], ...jobCard, updatedAt: new Date().toISOString() };
    return NextResponse.json(makrosMockData.jobCards[index]);
}

// DELETE a job card
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const index = makrosMockData.jobCards.findIndex((jc) => jc.jobCardId === id);
    if (index === -1) {
        return NextResponse.json({ message: "Job card not found" }, { status: 404 });
    }
    makrosMockData.jobCards.splice(index, 1);
    return NextResponse.json({ message: "Job card deleted" });
}
