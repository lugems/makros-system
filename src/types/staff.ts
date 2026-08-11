export type UserRole =
  | "Makros System Owner"
  | "Workshop Manager"
  | "Receptionist"
  | "Senior Mechanic / Lead Mechanic"
  | "Mechanic"
  | "Diagnostic Technician"
  | "Auto-Wiring Technician"
  | "Welding Lead Technician"
  | "Welding Technician"
  | "Auto Body / Panel Beater"
  | "Painter"
  | "Tyre & Wheel Technician"
  | "Car Wash / Detailing Technician"
  | "Quality Control Officer"
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
