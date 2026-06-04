export type UserRole =
  | "Makros System Owner"
  | "Workshop Manager"
  | "Receptionist"
  | "Mechanic"
  | "Inventory Officer"
  | "Accountant"
  | "Customer";

export interface StaffMember {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserRole;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  address?: string;
  specialization?: string;
  assignedJobs?: number;
  completedJobs?: number;
  currentWorkload?: number;
  photoUrl?: string;
}
