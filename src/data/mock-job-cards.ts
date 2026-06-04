import { JobCard } from '@/types/job-card';
import { JobCardStatus } from '@/types/job-card';

export const mockJobCards: JobCard[] = [
    {
        jobCardId: 'JC001',
        bookingId: 'B001',
        customerId: 'C001',
        vehicleId: 'V001',
        reportedIssue: 'Customer waiting.',
        status: JobCardStatus.InProgress,
        assignedMechanicId: 'user-003',
        laborCost: 50000,
        receivedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-004',
        tasks: [],
        parts: [],
    }
];
