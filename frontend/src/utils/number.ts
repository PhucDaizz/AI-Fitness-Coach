/**
 * Format a number with thousand separators
 * @example formatNumber(1234567) => "1,234,567"
 */
export function formatNumber(
  value: number, 
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Format a number as percentage
 * @example formatPercent(0.856) => "85.6%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Clamp a number between min and max
 * @example clamp(150, 0, 100) => 100
 */
export function clamp(
  value: number, 
  min: number, 
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to a given number of decimal places
 * @example roundTo(3.14159, 2) => 3.14
 */
export function roundTo(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Check if a value is a valid finite number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value) && !isNaN(value);
}
