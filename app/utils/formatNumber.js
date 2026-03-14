/**
 * Format large numbers to human-readable form (e.g., 1.2K, 3.5M)
 */
export function formatNumber(num) {
  if (num == null) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}
