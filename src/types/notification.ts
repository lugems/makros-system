
/**
 * @fileOverview Type definitions for the workshop communications log.
 * Tracks forensic-grade interactions between personnel and customers.
 */

export type CommunicationChannel =
  | "In-App"
  | "Phone Call"
  | "SMS"
  | "WhatsApp"
  | "Email"
  | "Walk-In"
  | "Internal Note";

export type CommunicationDirection =
  | "Internal"
  | "Incoming"
  | "Outgoing";

export type CommunicationPriority =
  | "Low"
  | "Normal"
  | "High"
  | "Urgent";

export type CommunicationStatus =
  | "Open"
  | "Pending Response" | "Resolved" | "Closed";

export interface CommunicationLog {
  logId: string;

  subject: string;
  message: string;

  channel: CommunicationChannel;
  direction: CommunicationDirection;
  priority: CommunicationPriority;
  status: CommunicationStatus;

  fromUserId?: string;
  fromRole?: string;
  fromName?: string;

  toUserId?: string;
  toRole?: string;
  toName?: string;

  customerId?: string;
  vehicleId?: string;
  bookingId?: string;
  jobCardId?: string;
  invoiceId?: string;
  paymentId?: string;

  requiresFollowUp: boolean;
  followUpDate?: string;

  isCustomerVisible: boolean;
  isInternalOnly: boolean;

  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

// Map Notification to CommunicationLog for internal logic consistency
export type Notification = CommunicationLog;
