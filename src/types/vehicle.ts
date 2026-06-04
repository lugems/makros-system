/**
 * @fileOverview Standardized type definition for the vehicle module.
 */

export interface Vehicle {
  vehicleId: string;
  customerId: string;
  make: string;
  model: string;
  year?: string | number;
  numberPlate: string;
  vin?: string;
  chassisNumber?: string;
  engineNumber?: string;
  color?: string;
  mileage?: number;
  fuelLevel?: string;
  conditionNotes?: string;
  createdAt: any;
  updatedAt: any;
  status: "Active" | "Inactive";
}
