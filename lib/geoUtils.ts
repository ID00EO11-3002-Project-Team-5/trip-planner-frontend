/**
 * Geographic distance and travel time utilities
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimate travel time based on distance and transport mode
 * @param distanceKm Distance in kilometers
 * @param mode Transport mode (driving, walking, cycling)
 * @returns Object with hours and minutes
 */
export function estimateTravelTime(
  distanceKm: number,
  mode: 'driving' | 'walking' | 'cycling' = 'driving'
): { hours: number; minutes: number; totalMinutes: number } {
  // Average speeds in km/h
  const speeds = {
    driving: 60, // City driving average
    walking: 5,
    cycling: 15,
  };
  
  const speed = speeds[mode];
  const hours = distanceKm / speed;
  const totalMinutes = Math.round(hours * 60);
  
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    totalMinutes,
  };
}

/**
 * Format travel time for display
 */
export function formatTravelTime(hours: number, minutes: number): string {
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  }
  return '< 1m';
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  } else if (km < 10) {
    return `${km.toFixed(1)}km`;
  }
  return `${Math.round(km)}km`;
}

/**
 * Calculate total route distance for a sequence of stops
 */
export function calculateRouteDistance(
  stops: Array<{ lat: number; lng: number }>
): number {
  if (stops.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const current = stops[i];
    const next = stops[i + 1];
    totalDistance += calculateDistance(current.lat, current.lng, next.lat, next.lng);
  }
  
  return totalDistance;
}
