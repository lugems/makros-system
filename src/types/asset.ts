/**
 * @fileOverview Canonical asset classification for the polymorphic workshop ecosystem.
 */

export type AssetType = 'Vehicle' | 'Plant';

export interface AssetSummary {
  id: string;
  type: AssetType;
  primaryLabel: string;
  secondaryLabel: string;
  tertiaryLabel?: string;
  meterValue?: number;
  meterUnit?: string;
}
