import { JobCardStatus } from '@/types/job-card';

const allowedTransitions: { [key: string]: string[] } = {
  'Received': ['Diagnosing', 'Cancelled'],
  'Diagnosing': ['Waiting for Approval', 'Cancelled'],
  'Waiting for Approval': ['Waiting for Parts', 'In Progress', 'Cancelled'],
  'Waiting for Parts': ['In Progress', 'Cancelled'],
  'In Progress': ['Quality Check', 'Cancelled'],
  'Quality Check': ['Completed'],
  'Completed': ['Invoiced'],
  'Invoiced': ['Paid'],
  'Paid': ['Delivered'],
};

export function canTransition(currentStatus: string, nextStatus: string): boolean {
  return allowedTransitions[currentStatus]?.includes(nextStatus) ?? false;
}
