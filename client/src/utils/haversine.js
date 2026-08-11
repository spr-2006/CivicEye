/**
 * Haversine formula to calculate the distance in meters between two GPS coordinates (lat1, lon1) and (lat2, lon2).
 * Used for 150-meter duplicate ticket detection and crowd confirmation.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceInMeters = R * c;
  return Math.round(distanceInMeters);
}

/**
 * Returns true if candidate coordinates are within distanceThreshold (default 150 meters)
 */
export function isWithinProximity(lat1, lon1, lat2, lon2, distanceThreshold = 150) {
  const dist = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  return {
    isDuplicateCandidate: dist <= distanceThreshold,
    distanceMeters: dist
  };
}
