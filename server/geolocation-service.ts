import { SG_LOCATIONS } from './transit-service';
import { RouteOption } from '../src/types';

// Calculate distance between two lat/lng coordinates in meters (Haversine formula)
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Find nearest stations/stops to given coordinates
export function findNearestTransitStops(lat: number, lng: number, maxResults = 5) {
  const results = Object.entries(SG_LOCATIONS).map(([key, loc]) => {
    const distanceMeters = calculateDistanceMeters(lat, lng, loc.lat, loc.lng);
    const walkingMinutes = Math.max(1, Math.round(distanceMeters / 80)); // ~80m per min walk
    return {
      key,
      name: loc.name,
      code: loc.code,
      type: loc.type,
      lat: loc.lat,
      lng: loc.lng,
      distanceMeters,
      walkingMinutes,
    };
  });

  results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return results.slice(0, maxResults);
}

// Reverse geocode coordinate into closest landmark or station
export function reverseGeocodeLocation(lat: number, lng: number) {
  const nearest = findNearestTransitStops(lat, lng, 1)[0];
  if (nearest && nearest.distanceMeters < 350) {
    return {
      formattedAddress: `Near ${nearest.name} (${nearest.distanceMeters}m away)`,
      nearestStation: nearest,
      lat,
      lng,
    };
  }

  return {
    formattedAddress: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)} (Singapore)`,
    nearestStation: nearest || null,
    lat,
    lng,
  };
}

// Real-time Journey Progress Tracker
export function trackJourneyProgress(
  route: RouteOption,
  userLat: number,
  userLng: number,
  currentStepIndex = 0
) {
  // Check progress through detailed steps
  const totalSteps = route.detailedSteps.length;
  const clampedStepIndex = Math.min(Math.max(0, currentStepIndex), totalSteps - 1);
  const currentStep = route.detailedSteps[clampedStepIndex];

  // Try to find if user is closer to next stop
  const nearestStop = findNearestTransitStops(userLat, userLng, 1)[0];
  
  // Calculate approximate remaining journey metrics
  const remainingSteps = totalSteps - 1 - clampedStepIndex;
  const progressRatio = (clampedStepIndex + 0.5) / totalSteps;
  const etaMinutesRemaining = Math.max(1, Math.round(route.totalDurationMinutes * (1 - progressRatio)));

  return {
    routeId: route.id,
    currentStepIndex: clampedStepIndex,
    currentStep,
    nextStep: route.detailedSteps[clampedStepIndex + 1] || null,
    remainingStepsCount: remainingSteps,
    etaMinutesRemaining,
    nearestStop,
    userLocation: { lat: userLat, lng: userLng },
    isCompleted: clampedStepIndex >= totalSteps - 1 && (nearestStop?.distanceMeters || 100) < 60,
  };
}
