'use client';

import useMakrosStore from '@/store/makros-store';

interface CurrencyFormatProps {
  value: number;
  className?: string;
  abbreviate?: boolean;
}

/**
 * @fileOverview Formats numbers as currency using the workshop's preferred currency setting.
 * Defaults to Uganda Shillings (Ush). Supports abbreviation for high-density UI.
 */
export function CurrencyFormat({ value, className, abbreviate }: CurrencyFormatProps) {
  const { workshopSettings } = useMakrosStore();
  const currency = workshopSettings?.currency || 'UGX';

  // Handle abbreviation for large UGX values if requested
  if (abbreviate && currency === 'UGX') {
    let displayValue = '';
    if (value >= 1000000) {
      const formatted = (value / 1000000).toFixed(1).replace(/\.0$/, '');
      displayValue = `Ush ${formatted}M`;
    } else if (value >= 1000) {
      const formatted = (value / 1000).toFixed(1).replace(/\.0$/, '');
      displayValue = `Ush ${formatted}K`;
    } else {
      displayValue = `Ush ${value}`;
    }
    return <span className={className}>{displayValue}</span>;
  }

  // Standard localization
  const formatted = new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
    maximumFractionDigits: 0,
  }).format(value);

  // Force 'Ush' display for UGX to match local technical conventions
  const displayValue = currency === 'UGX' ? formatted.replace('UGX', 'Ush') : formatted;

  return <span className={className}>{displayValue}</span>;
}
