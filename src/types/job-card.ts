import { AssetType } from './asset';

/**
 * @fileOverview Type definitions for the workshop job cards.
 */

export const JobCardStatus = {
  Pending: "Pending",
  Received: "Received",
  Diagnosing: "Diagnosing",
  WaitingForApproval: "Waiting for Approval",
  WaitingForParts: "Waiting for Parts",
  InProgress: "In Progress",
  QualityCheck: "Quality Check",
  Completed: "Completed",
  Invoiced: "Invoiced",
  Paid: "Paid",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
} as const;

export type JobCardStatus = (typeof JobCardStatus)[keyof typeof JobCardStatus];

export interface JobTask {
  jobTaskId: string;
  jobCardId: string;
  taskDescription: string;
  estimatedHours: number;
  status: "Pending" | "In Progress" | "Completed";
  createdAt: string;
  updatedAt: string;
}

export interface JobPart {
  jobPartId: string;
  jobCardId: string;
  itemId: string;
  itemName?: string;
  quantityUsed: number;
  unitPrice: number;
  createdAt: string;
}

export interface JobCard {
  jobCardId: string;
  customerId: string;
  assetId: string;
  assetType: AssetType;
  vehicleId?: string; // Legacy support
  bookingId?: string;
  assignedMechanicId?: string;
  reportedIssue: string;
  inspectionNotes?: string;
  status: JobCardStatus;
  laborCost: number;
  receivedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tasks?: JobTask[];
  parts?: JobPart[];
}
