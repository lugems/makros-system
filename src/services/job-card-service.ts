import { JobCard, JobCardStatus } from '../types';
import { canTransition } from '../lib/job-card-workflow';

// In-memory data store for job cards
const jobCards: JobCard[] = [];

export const createJobCard = (jobCardData: Omit<JobCard, 'jobCardId' | 'status' | 'createdAt' | 'updatedAt' | 'receivedAt'>): JobCard => {
    const now = new Date().toISOString();
    const newJobCard: JobCard = {
        ...jobCardData,
        jobCardId: `jc-${Date.now()}`,
        status: 'Received',
        receivedAt: now,
        createdAt: now,
        updatedAt: now,
    };
    jobCards.push(newJobCard);
    return newJobCard;
}

export const getJobCardById = (jobCardId: string): JobCard | undefined => {
    return jobCards.find(jc => jc.jobCardId === jobCardId);
}

export const getJobCards = (): JobCard[] => {
    return jobCards;
}

export const updateJobCardStatus = (jobCardId: string, newStatus: JobCardStatus): JobCard | { error: string } => {
    const jobCardIndex = jobCards.findIndex(jc => jc.jobCardId === jobCardId);

    if (jobCardIndex === -1) {
        return { error: 'Job card not found' };
    }

    const jobCard = jobCards[jobCardIndex];

    if (!canTransition(jobCard.status, newStatus)) {
        return { error: `Invalid status transition from ${jobCard.status} to ${newStatus}` };
    }

    const updatedJobCard = { ...jobCard, status: newStatus, updatedAt: new Date().toISOString() };
    
    if (newStatus === 'Completed') {
        updatedJobCard.completedAt = new Date().toISOString();
    }
    
    jobCards[jobCardIndex] = updatedJobCard;
    return updatedJobCard;
}
