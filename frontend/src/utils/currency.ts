/**
 * Format a number as Vietnamese Dong
 * @example formatVND(150000) => "150.000 ₫"
 */
export function formatVND(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

/**
 * Format a number as USD
 * @example formatUSD(9.99) => "$9.99"
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Parse a VND string back to number
 * @example parseVND("150.000 ₫") => 150000
 */
export function parseVND(value: string): number {
  return Number(value.replace(/[^\d]/g, ''));
}
