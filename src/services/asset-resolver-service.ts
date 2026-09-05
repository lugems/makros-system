'use client';

import { doc, getDoc, Firestore } from 'firebase/firestore';
import { AssetType, AssetSummary } from '@/types/asset';
import { Vehicle } from '@/types/vehicle';
import { PlantEquipment } from '@/types/plant-equipment';

/**
 * @fileOverview Shared service for technical asset resolution across registries.
 * Ensures the system correctly identifies and displays both Vehicles and Plant.
 */

export const resolveAsset = async (db: Firestore, id: string, type: AssetType) => {
  const collection = type === 'Vehicle' ? 'vehicles' : 'plantsAndEquipment';
  const docRef = doc(db, collection, id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
};

export const getAssetDisplayData = (asset: any, type: AssetType): AssetSummary => {
  if (type === 'Vehicle') {
    const v = asset as Vehicle;
    return {
      id: v.vehicleId,
      type: 'Vehicle',
      primaryLabel: `${v.make} ${v.model}`,
      secondaryLabel: v.numberPlate,
      tertiaryLabel: v.vin,
      meterValue: v.mileage,
      meterUnit: 'KM'
    };
  } else {
    const p = asset as PlantEquipment;
    return {
      id: p.id,
      type: 'Plant',
      primaryLabel: p.name,
      secondaryLabel: `${p.make} ${p.model}`,
      tertiaryLabel: p.assetId,
      meterValue: p.meterReading,
      meterUnit: getMeterUnit(p.meterType)
    };
  }
};

export const getMeterUnit = (meterType: string) => {
  switch (meterType) {
    case 'Hour Meter': return 'HRS';
    case 'Odometer - KM': return 'KM';
    case 'Odometer - Miles': return 'MI';
    case 'Cycle Counter': return 'CYC';
    default: return '';
  }
};

export const getAssetRoute = (id: string, type: AssetType) => {
    return type === 'Vehicle' ? `/vehicles/${id}` : `/plants-equipment/${id}`;
};
