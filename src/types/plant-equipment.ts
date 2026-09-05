import { AssetType } from './asset';

/**
 * @fileOverview Technical model for Plant & Equipment assets.
 */

export type MeterType = 'Hour Meter' | 'Odometer - KM' | 'Odometer - Miles' | 'Cycle Counter' | 'None';

export type PlantCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Non-operational';

export type PlantStatus = 'Active' | 'Under Repair' | 'Under Maintenance' | 'Out of Service' | 'Decommissioned';

export type PlantCategory = 
  | 'Excavator'
  | 'Bulldozer'
  | 'Grader'
  | 'Loader'
  | 'Forklift'
  | 'Crane'
  | 'Tractor'
  | 'Generator'
  | 'Compressor'
  | 'Welding Equipment'
  | 'Hydraulic Equipment'
  | 'Pump'
  | 'Workshop Machine'
  | 'Other';

export interface MaintenanceInterval {
  intervalValue: number;
  intervalUnit: 'Hours' | 'KM' | 'Miles' | 'Cycles' | 'Days' | 'Months';
  lastReadingAtService: number;
  lastDateAtService: string;
}

export interface PlantEquipment {
  id: string;
  ownerId: string;
  assetId: string; // The specific technical identifier for the machine
  name: string;
  category: PlantCategory;
  make: string;
  model: string;
  serialNumber: string;
  yearOfManufacture: string;
  manufacturer?: string;
  manufacturerDetails?: string;
  meterType: MeterType;
  meterReading: number;
  powerType: string;
  engineNumber?: string;
  location?: string;
  branchId?: string;
  condition: PlantCondition;
  status: PlantStatus;
  notes?: string;
  maintenance?: MaintenanceInterval;
  createdAt: any;
  updatedAt: any;
}
