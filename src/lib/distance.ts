/**
 * Calculate the distance between two geographical points using the Haversine formula
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
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
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

/**
 * Sort facilities by distance from user location
 * @param facilities Array of facilities with coordinates
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @returns Facilities sorted by distance with calculated distances
 */
export function sortByDistance<T extends { latitude: number; longitude: number }>(
  facilities: T[],
  userLat: number,
  userLon: number
): (T & { calculatedDistance: number })[] {
  return facilities
    .map(facility => ({
      ...facility,
      calculatedDistance: calculateDistance(userLat, userLon, facility.latitude, facility.longitude)
    }))
    .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
}
