// Time Formatting Utilities

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to M:SS for compact display
 */
export function formatTimeCompact(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get time warning level based on remaining time
 */
export function getTimeWarningLevel(timeRemaining: number): 'normal' | 'warning' | 'critical' {
  if (timeRemaining <= 10) return 'critical';
  if (timeRemaining <= 30) return 'warning';
  return 'normal';
}

/**
 * Convert release rate to spawn interval
 */
export function releaseRateToInterval(releaseRate: number): number {
  // Rate 1 = ~4 seconds between spawns
  // Rate 99 = ~0.5 seconds between spawns
  return 4 - (releaseRate / 100) * 3.5;
}

/**
 * Calculate percentage with rounding
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
