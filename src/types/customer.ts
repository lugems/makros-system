/**
 * @fileOverview Standardized type definition for the customer module.
 */

export interface Customer {
  customerId: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  status: "Active" | "Inactive";
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
