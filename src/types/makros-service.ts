/**
 * @fileOverview Type definitions for the workshop services catalog.
 */

export type ServiceStatus = "Active" | "Inactive";

export type ServiceCategory =
  | "General Service"
  | "Diagnostics"
  | "Engine"
  | "Brakes"
  | "Suspension"
  | "Tyres"
  | "Battery"
  | "Car Wash"
  | "Body Works"
  | "Electrical"
  | "Other";

export interface MakrosService {
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  description: string;
  defaultLaborCost: number;
  estimatedDuration: string; // e.g., "2 hours", "30 minutes"
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

// Keeping legacy Service for backward compatibility if needed
export interface Service {
  serviceId: string;
  name: string;
  description: string;
  estimatedTime: number; // in minutes
  defaultLaborCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
