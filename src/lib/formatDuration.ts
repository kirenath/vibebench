/**
 * Format duration_ms into a human-readable string like "1m 30.0s", "48.2s", "1h 2m"
 */
export function formatDuration(ms: string | number | null): string | null {
  if (ms == null) return null;
  const totalSeconds = Number(ms) / 1000;
  if (totalSeconds <= 0) return null;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = +(totalSeconds % 60).toFixed(1);

  if (hours > 0) {
    if (minutes > 0) return `${hours}h ${minutes}m`;
    return `${hours}h`;
  }
  if (minutes > 0) {
    if (seconds > 0) return `${minutes}m ${seconds}s`;
    return `${minutes}m`;
  }
  return `${seconds}s`;
}
