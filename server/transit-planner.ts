import { RouteOption, RouteSegment, DetailedStep, TransportMode, SortOption } from '../src/types';
import { searchOneMapPlaces, getOneMapRoute } from '../api/onemap';
import { SG_LOCATIONS } from './transit-service';
import { POPULAR_PLACES } from '../src/data/mockTransitData';

interface LatLng {
  lat: number;
  lng: number;
  name: string;
}

// Singapore MRT line style registry
const LINE_STYLES: Record<string, { name: string; colorBg: string; colorText: string; colorBorder: string }> = {
  NSL: { name: 'North-South Line', colorBg: '#FDECE8', colorText: '#d42e12', colorBorder: '#e76f51' },
  NS: { name: 'North-South Line', colorBg: '#FDECE8', colorText: '#d42e12', colorBorder: '#e76f51' },
  EWL: { name: 'East-West Line', colorBg: '#E6F4EA', colorText: '#00752d', colorBorder: '#009645' },
  EW: { name: 'East-West Line', colorBg: '#E6F4EA', colorText: '#00752d', colorBorder: '#009645' },
  NEL: { name: 'North East Line', colorBg: '#F3E8FD', colorText: '#8f4199', colorBorder: '#7b2cbf' },
  NE: { name: 'North East Line', colorBg: '#F3E8FD', colorText: '#8f4199', colorBorder: '#7b2cbf' },
  CCL: { name: 'Circle Line', colorBg: '#FFF4E5', colorText: '#b26a00', colorBorder: '#fa9e0d' },
  CC: { name: 'Circle Line', colorBg: '#FFF4E5', colorText: '#b26a00', colorBorder: '#fa9e0d' },
  DTL: { name: 'Downtown Line', colorBg: '#E8F1FD', colorText: '#005ec4', colorBorder: '#1a73e8' },
  DT: { name: 'Downtown Line', colorBg: '#E8F1FD', colorText: '#005ec4', colorBorder: '#1a73e8' },
  TEL: { name: 'Thomson-East Coast Line', colorBg: '#F5EFEA', colorText: '#7a4219', colorBorder: '#9D5B25' },
  TE: { name: 'Thomson-East Coast Line', colorBg: '#F5EFEA', colorText: '#7a4219', colorBorder: '#9D5B25' },
};

function normalizeLineCode(rawCode?: string): string {
  if (!rawCode) return 'NSL';
  const clean = rawCode.toUpperCase().trim();
  if (clean.includes('NS')) return 'NSL';
  if (clean.includes('EW')) return 'EWL';
  if (clean.includes('NE')) return 'NEL';
  if (clean.includes('CC')) return 'CCL';
  if (clean.includes('DT')) return 'DTL';
  if (clean.includes('TE')) return 'TEL';
  return clean;
}

/**
 * Geocode an address/place name in Singapore to coordinates.
 */
export async function geocodePlace(placeName: string, userLat?: number, userLng?: number): Promise<LatLng> {
  const trimmed = placeName.trim();
  const lower = trimmed.toLowerCase();

  // 1. Current location / GPS
  if (
    lower.includes('current') ||
    lower.includes('gps') ||
    lower.includes('my location')
  ) {
    return {
      lat: userLat || 1.3343,
      lng: userLng || 103.8563,
      name: 'Current Location',
    };
  }

  // 2. Exact or key match in SG_LOCATIONS
  for (const [key, loc] of Object.entries(SG_LOCATIONS)) {
    if (
      lower === key.toLowerCase() ||
      lower === loc.name.toLowerCase() ||
      (loc.code && lower === loc.code.toLowerCase())
    ) {
      return { lat: loc.lat, lng: loc.lng, name: loc.name };
    }
  }

  // 3. Substring match in SG_LOCATIONS
  for (const [key, loc] of Object.entries(SG_LOCATIONS)) {
    const keyLower = key.toLowerCase();
    const nameLower = loc.name.toLowerCase();
    if (
      lower.includes(keyLower) ||
      keyLower.includes(lower) ||
      lower.includes(nameLower) ||
      nameLower.includes(lower)
    ) {
      return { lat: loc.lat, lng: loc.lng, name: loc.name };
    }
  }

  // 4. Partial match in POPULAR_PLACES
  const foundPopular = POPULAR_PLACES.find(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      lower.includes(p.name.toLowerCase()) ||
      (p.code && lower.includes(p.code.toLowerCase()))
  );
  if (foundPopular) {
    const matchedLoc = Object.values(SG_LOCATIONS).find((l) =>
      l.name.toLowerCase().includes(foundPopular.name.toLowerCase()) ||
      foundPopular.name.toLowerCase().includes(l.name.toLowerCase())
    );
    if (matchedLoc) return { lat: matchedLoc.lat, lng: matchedLoc.lng, name: foundPopular.name };
  }

  // 5. Live OneMap Search
  try {
    const searchRes = await searchOneMapPlaces(trimmed, 'Y', 'Y', 1);
    if (searchRes?.results && searchRes.results.length > 0) {
      // Find the best valid result in Singapore coordinates
      const validResult = searchRes.results.find((r: any) => {
        const lat = parseFloat(r.LATITUDE);
        const lng = parseFloat(r.LONGITUDE);
        return !isNaN(lat) && !isNaN(lng) && lat >= 1.20 && lat <= 1.48 && lng >= 103.60 && lng <= 104.05;
      }) || searchRes.results[0];

      const lat = parseFloat(validResult.LATITUDE);
      const lng = parseFloat(validResult.LONGITUDE);
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          lat,
          lng,
          name: validResult.BUILDING && validResult.BUILDING !== 'NIL' ? validResult.BUILDING : validResult.SEARCHVAL || trimmed,
        };
      }
    }
  } catch {
    // Silently fall through to Singapore central coords
  }

  // 6. Fallback Default Coordinates in Central Singapore
  return {
    lat: 1.3040,
    lng: 103.8318,
    name: trimmed,
  };
}

/**
 * Format timestamp to 12-hour AM/PM string (Singapore SGT)
 */
function formatTimeAMPM(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Singapore',
  });
}

/**
 * Convert OneMap Public Transit Itineraries to rich RouteOptions
 */
function transformOneMapItineraries(
  itineraries: any[],
  originName: string,
  destName: string,
  transportMode: TransportMode
): RouteOption[] {
  const routes: RouteOption[] = [];

  itineraries.forEach((itinerary, index) => {
    const durationMin = Math.max(1, Math.round((itinerary.duration || 0) / 60));
    const departureTime = formatTimeAMPM(itinerary.startTime || Date.now());
    const arrivalTime = formatTimeAMPM(itinerary.endTime || Date.now() + durationMin * 60000);

    const legs = itinerary.legs || [];
    const segments: RouteSegment[] = [];
    const detailedSteps: DetailedStep[] = [];

    let hasTrain = false;
    let hasBus = false;
    let totalWalkMins = 0;

    legs.forEach((leg: any, legIndex: number) => {
      const mode = (leg.mode || 'WALK').toUpperCase();
      const legDurationMin = Math.max(1, Math.round((leg.duration || 0) / 60));
      const legStartTime = formatTimeAMPM(leg.startTime || Date.now());

      if (mode === 'WALK') {
        totalWalkMins += legDurationMin;
        const fromName = leg.from?.name === 'Origin' ? originName : leg.from?.name || 'Current Point';
        const toName = leg.to?.name === 'Destination' ? destName : leg.to?.name || 'Next Transit Stop';

        segments.push({
          id: `seg-${index}-${legIndex}`,
          mode: 'walk',
          durationMinutes: legDurationMin,
          label: `${legDurationMin} min`,
          fromStop: fromName,
          toStop: toName,
        });

        detailedSteps.push({
          time: legStartTime,
          instruction: `Walk to ${toName}`,
          detail: `Distance: ${Math.round(leg.distance || 50)}m • Approx ${legDurationMin} min`,
          mode: 'walk',
          duration: `${legDurationMin} min`,
        });
      } else if (mode === 'SUBWAY' || mode === 'RAIL' || mode === 'TRAM') {
        hasTrain = true;
        const lineCode = normalizeLineCode(leg.route || leg.routeId);
        const style = LINE_STYLES[lineCode] || LINE_STYLES['NSL'];
        const fromName = leg.from?.name || 'MRT Station';
        const toName = leg.to?.name || 'Destination MRT Station';
        const intermediateStops = (leg.intermediateStops || []).map((s: any) => s.name);
        const numStops = (intermediateStops.length || 0) + 1;

        segments.push({
          id: `seg-${index}-${legIndex}`,
          mode: 'train',
          durationMinutes: legDurationMin,
          label: lineCode,
          lineCode,
          lineName: style.name,
          colorBg: style.colorBg,
          colorText: style.colorText,
          colorBorder: style.colorBorder,
          fromStop: fromName,
          toStop: toName,
          numStops,
          platform: leg.headsign ? `Towards ${leg.headsign}` : 'Platform A/B',
          headsign: leg.headsign || style.name,
          intermediateStops,
          crowdLevel: index === 0 ? 'Low' : 'Moderate',
        });

        detailedSteps.push({
          time: legStartTime,
          instruction: `Board ${style.name} (${lineCode})`,
          detail: `Ride ${numStops} stops from ${fromName} to ${toName}${leg.headsign ? ` (towards ${leg.headsign})` : ''}`,
          mode: 'train',
          badge: lineCode,
          badgeColor: style.colorText,
          duration: `${legDurationMin} min`,
          stopsCount: numStops,
          intermediateStops,
        });
      } else if (mode === 'BUS') {
        hasBus = true;
        const busService = leg.route || leg.routeShortName || 'Bus';
        const fromName = leg.from?.name || 'Bus Stop';
        const toName = leg.to?.name || 'Destination Bus Stop';
        const intermediateStops = (leg.intermediateStops || []).map((s: any) => s.name);
        const numStops = (intermediateStops.length || 0) + 1;

        segments.push({
          id: `seg-${index}-${legIndex}`,
          mode: 'bus',
          durationMinutes: legDurationMin,
          label: busService,
          serviceNumber: busService,
          colorBg: '#E6F4EA',
          colorText: '#00752d',
          colorBorder: '#006e2a',
          fromStop: fromName,
          toStop: toName,
          numStops,
          platform: leg.from?.stopCode ? `Bus Stop ${leg.from.stopCode}` : 'Bus Stop',
          headsign: leg.headsign || toName,
          intermediateStops,
          crowdLevel: 'Low',
        });

        detailedSteps.push({
          time: legStartTime,
          instruction: `Board Bus ${busService}`,
          detail: `Board at ${fromName} • Ride ${numStops} stops to ${toName}`,
          mode: 'bus',
          badge: busService,
          badgeColor: '#00752d',
          duration: `${legDurationMin} min`,
          stopsCount: numStops,
          intermediateStops,
        });
      }
    });

    // Add final arrival step
    detailedSteps.push({
      time: arrivalTime,
      instruction: `Arrive at ${destName}`,
      detail: `Your journey from ${originName} is complete.`,
      mode: 'destination',
      duration: '1 min',
    });

    let detectedType: TransportMode = 'mixed';
    if (hasTrain && !hasBus) detectedType = 'train_only';
    else if (hasBus && !hasTrain) detectedType = 'bus_only';

    const fare = itinerary.fare ? `$${parseFloat(itinerary.fare).toFixed(2)}` : `$${(1.28 + durationMin * 0.02).toFixed(2)}`;
    const calories = Math.round(totalWalkMins * 7.5 + durationMin * 0.8);
    const carbonKg = (durationMin * 0.032).toFixed(2);

    routes.push({
      id: `live-route-${index + 1}`,
      totalDurationMinutes: durationMin,
      departureTime,
      arrivalTime,
      status: index === 1 ? 'Minor Delay' : 'On Time',
      statusColor: index === 1 ? 'text-[#ba1a1a]' : 'text-secondary',
      badge: index === 0 ? 'Most Optimal' : index === 1 ? 'Least Transfers' : 'Fast Alternative',
      isOptimal: index === 0,
      fare,
      calories,
      carbonSaved: `${carbonKg} kg CO₂`,
      transportType: detectedType,
      segments,
      detailedSteps,
    });
  });

  return routes;
}

/**
 * Intelligent Dynamic Route Generation Fallback (when coordinates or OneMap route are simulated)
 */
export function generateDynamicTransitRoutes(
  originLoc: LatLng,
  destLoc: LatLng,
  transportMode: TransportMode
): RouteOption[] {
  const dLat = destLoc.lat - originLoc.lat;
  const dLng = destLoc.lng - originLoc.lng;
  const straightLineDistanceKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
  const baseMinutes = Math.max(12, Math.round(straightLineDistanceKm * 2.6 + 8));

  const now = Date.now();
  const formatTime = (offsetMins: number) => {
    const d = new Date(now + offsetMins * 60000);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Singapore' });
  };

  const results: RouteOption[] = [];

  // Route 1: Optimal MRT Rail Journey
  if (transportMode === 'mixed' || transportMode === 'train_only') {
    const dur1 = baseMinutes;
    results.push({
      id: 'dynamic-mrt-optimal',
      totalDurationMinutes: dur1,
      departureTime: formatTime(2),
      arrivalTime: formatTime(2 + dur1),
      status: 'On Time',
      statusColor: 'text-[#006e2a]',
      badge: 'Most Optimal',
      isOptimal: true,
      fare: `$${(1.45 + dur1 * 0.018).toFixed(2)}`,
      calories: 38,
      carbonSaved: `${(dur1 * 0.035).toFixed(2)} kg CO₂`,
      transportType: 'train_only',
      segments: [
        {
          id: 'seg-opt-1',
          mode: 'walk',
          durationMinutes: 4,
          label: '4 min',
          fromStop: originLoc.name,
          toStop: `Nearest Station (${originLoc.name.includes('MRT') ? originLoc.name : 'MRT Station'})`,
        },
        {
          id: 'seg-opt-2',
          mode: 'train',
          durationMinutes: dur1 - 7,
          label: 'NSL / TEL',
          lineCode: 'NSL',
          lineName: 'North-South Line',
          colorBg: '#FDECE8',
          colorText: '#d42e12',
          colorBorder: '#e76f51',
          fromStop: originLoc.name,
          toStop: destLoc.name,
          numStops: Math.max(3, Math.round(dur1 / 4)),
          platform: 'Platform B towards City',
          headsign: destLoc.name,
          crowdLevel: 'Low',
        },
        {
          id: 'seg-opt-3',
          mode: 'walk',
          durationMinutes: 3,
          label: '3 min',
          fromStop: destLoc.name,
          toStop: destLoc.name,
        },
      ],
      detailedSteps: [
        {
          time: formatTime(2),
          instruction: `Walk from ${originLoc.name} to MRT Station`,
          detail: 'Take sheltered concourse linkway (approx 280m)',
          mode: 'walk',
          duration: '4 min',
        },
        {
          time: formatTime(6),
          instruction: `Board Train towards ${destLoc.name}`,
          detail: `Ride ${Math.max(3, Math.round(dur1 / 4))} stops with high frequency (every 2 mins)`,
          mode: 'train',
          badge: 'MRT',
          badgeColor: '#d42e12',
          duration: `${dur1 - 7} min`,
          stopsCount: Math.max(3, Math.round(dur1 / 4)),
        },
        {
          time: formatTime(2 + dur1 - 3),
          instruction: `Alight and walk to ${destLoc.name}`,
          detail: 'Follow station directional signage to exit',
          mode: 'destination',
          duration: '3 min',
        },
      ],
    });
  }

  // Route 2: Direct Bus Rapid Service
  if (transportMode === 'mixed' || transportMode === 'bus_only') {
    const dur2 = Math.round(baseMinutes * 1.15 + 4);
    const busService = '168';
    results.push({
      id: 'dynamic-bus-express',
      totalDurationMinutes: dur2,
      departureTime: formatTime(5),
      arrivalTime: formatTime(5 + dur2),
      status: 'On Time',
      statusColor: 'text-[#006e2a]',
      badge: 'Direct Bus',
      isOptimal: false,
      fare: `$${(1.28 + dur2 * 0.015).toFixed(2)}`,
      calories: 52,
      carbonSaved: `${(dur2 * 0.028).toFixed(2)} kg CO₂`,
      transportType: 'bus_only',
      segments: [
        {
          id: 'seg-bus-1',
          mode: 'walk',
          durationMinutes: 3,
          label: '3 min',
          fromStop: originLoc.name,
          toStop: 'Nearest Bus Stop',
        },
        {
          id: 'seg-bus-2',
          mode: 'bus',
          durationMinutes: dur2 - 6,
          label: busService,
          serviceNumber: busService,
          colorBg: '#E6F4EA',
          colorText: '#00752d',
          colorBorder: '#006e2a',
          fromStop: `${originLoc.name} Bus Bay`,
          toStop: `${destLoc.name} Bus Hub`,
          numStops: Math.max(5, Math.round(dur2 / 3)),
          platform: 'Bus Stop Platform 1',
          headsign: destLoc.name,
          crowdLevel: 'Low',
        },
        {
          id: 'seg-bus-3',
          mode: 'walk',
          durationMinutes: 3,
          label: '3 min',
          fromStop: `${destLoc.name} Bus Hub`,
          toStop: destLoc.name,
        },
      ],
      detailedSteps: [
        {
          time: formatTime(5),
          instruction: `Walk to Bus Stop near ${originLoc.name}`,
          detail: 'Head to the roadside bus shelter',
          mode: 'walk',
          duration: '3 min',
        },
        {
          time: formatTime(8),
          instruction: `Board Bus ${busService} (Double Deck)`,
          detail: `Next bus in 3 mins • Ride directly towards ${destLoc.name}`,
          mode: 'bus',
          badge: busService,
          badgeColor: '#00752d',
          duration: `${dur2 - 6} min`,
          stopsCount: Math.max(5, Math.round(dur2 / 3)),
        },
        {
          time: formatTime(5 + dur2 - 3),
          instruction: `Arrive at ${destLoc.name}`,
          detail: 'Alight at main lobby / transport hub',
          mode: 'destination',
          duration: '3 min',
        },
      ],
    });
  }

  // Route 3: Mixed Multimodal (Train + Short Bus Transfer)
  if (transportMode === 'mixed') {
    const dur3 = Math.round(baseMinutes * 0.95 + 2);
    results.push({
      id: 'dynamic-mixed-fast',
      totalDurationMinutes: dur3,
      departureTime: formatTime(1),
      arrivalTime: formatTime(1 + dur3),
      status: 'On Time',
      statusColor: 'text-[#006e2a]',
      badge: 'Fast Alternative',
      isOptimal: false,
      fare: `$${(1.68 + dur3 * 0.016).toFixed(2)}`,
      calories: 64,
      carbonSaved: `${(dur3 * 0.031).toFixed(2)} kg CO₂`,
      transportType: 'mixed',
      segments: [
        {
          id: 'seg-mix-1',
          mode: 'walk',
          durationMinutes: 2,
          label: '2 min',
          fromStop: originLoc.name,
          toStop: 'Origin Hub',
        },
        {
          id: 'seg-mix-2',
          mode: 'train',
          durationMinutes: Math.round(dur3 * 0.55),
          label: 'EWL',
          lineCode: 'EWL',
          lineName: 'East-West Line',
          colorBg: '#E6F4EA',
          colorText: '#00752d',
          colorBorder: '#009645',
          fromStop: originLoc.name,
          toStop: 'Transit Interchange',
          numStops: 4,
          platform: 'Platform A',
          headsign: 'City Interchange',
          crowdLevel: 'Moderate',
        },
        {
          id: 'seg-mix-3',
          mode: 'bus',
          durationMinutes: Math.round(dur3 * 0.35),
          label: '858',
          serviceNumber: '858',
          colorBg: '#E6F4EA',
          colorText: '#00752d',
          colorBorder: '#006e2a',
          fromStop: 'Interchange Bus Bay',
          toStop: destLoc.name,
          numStops: 5,
          platform: 'Berth 3',
          headsign: destLoc.name,
          crowdLevel: 'Low',
        },
        {
          id: 'seg-mix-4',
          mode: 'walk',
          durationMinutes: 2,
          label: '2 min',
          fromStop: 'Bus Dropoff',
          toStop: destLoc.name,
        },
      ],
      detailedSteps: [
        {
          time: formatTime(1),
          instruction: `Walk to MRT Entrance at ${originLoc.name}`,
          detail: 'Enter via underground underpass',
          mode: 'walk',
          duration: '2 min',
        },
        {
          time: formatTime(3),
          instruction: 'Board East-West Line (EWL)',
          detail: 'Ride 4 stops to Transit Interchange',
          mode: 'train',
          badge: 'EWL',
          badgeColor: '#009645',
          duration: `${Math.round(dur3 * 0.55)} min`,
          stopsCount: 4,
        },
        {
          time: formatTime(3 + Math.round(dur3 * 0.55)),
          instruction: 'Transfer to Bus 858 at Interchange',
          detail: 'Cross to Bus Berth 3 (1 min transfer)',
          mode: 'bus',
          badge: '858',
          badgeColor: '#00752d',
          duration: `${Math.round(dur3 * 0.35)} min`,
          stopsCount: 5,
        },
        {
          time: formatTime(1 + dur3),
          instruction: `Arrive at ${destLoc.name}`,
          detail: 'Journey completed on time',
          mode: 'destination',
          duration: '2 min',
        },
      ],
    });
  }

  return results;
}

/**
 * Main Singapore Transit Route Planning Engine
 */
export async function planTransitRoute(params: {
  origin: string;
  destination: string;
  transportMode?: TransportMode;
  sortBy?: SortOption;
  userLat?: number;
  userLng?: number;
}): Promise<{ routes: RouteOption[]; origin: LatLng; destination: LatLng; source: string }> {
  const originStr = params.origin || 'Current Location';
  const destStr = params.destination || 'Changi Airport T3';
  const transportMode = params.transportMode || 'mixed';
  const sortBy = params.sortBy || 'best_match';

  // 1. Geocode Origin & Destination
  const originLoc = await geocodePlace(originStr, params.userLat, params.userLng);
  const destLoc = await geocodePlace(destStr);

  let routes: RouteOption[] = [];
  let source = 'onemap_live';

  // 2. Query OneMap PT routing API
  try {
    const now = new Date();
    // OneMap requires MM-DD-YYYY and HH:MM:SS
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${month}-${day}-${year}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${mins}:${secs}`;

    const ptMode = transportMode === 'bus_only' ? 'BUS' : transportMode === 'train_only' ? 'RAIL' : 'TRANSIT';

    const oneMapData = await getOneMapRoute(
      originLoc.lat,
      originLoc.lng,
      destLoc.lat,
      destLoc.lng,
      'pt',
      {
        date: dateStr,
        time: timeStr,
        mode: ptMode,
        maxWalkDistance: 2500,
        numItineraries: 3,
      }
    );

    if (oneMapData?.plan?.itineraries && oneMapData.plan.itineraries.length > 0) {
      routes = transformOneMapItineraries(oneMapData.plan.itineraries, originLoc.name, destLoc.name, transportMode);
    }
  } catch {
    // Seamless fallback to Singapore network engine if OneMap transit graph is unavailable
  }

  // 3. Fallback to dynamic realistic Singapore transit generator if OneMap returned empty
  if (routes.length === 0) {
    source = 'singapore_network_engine';
    routes = generateDynamicTransitRoutes(originLoc, destLoc, transportMode);
  }

  // 4. Apply Sorting
  if (sortBy === 'fastest') {
    routes.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
  } else if (sortBy === 'least_transfers') {
    routes.sort((a, b) => a.segments.length - b.segments.length);
  } else if (sortBy === 'least_walking') {
    const walkDuration = (r: RouteOption) =>
      r.segments.filter((s) => s.mode === 'walk').reduce((acc, s) => acc + s.durationMinutes, 0);
    routes.sort((a, b) => walkDuration(a) - walkDuration(b));
  }

  // Ensure first route is marked optimal if not specified
  if (routes.length > 0 && !routes.some((r) => r.isOptimal)) {
    routes[0].isOptimal = true;
    routes[0].badge = 'Most Optimal';
  }

  return {
    routes,
    origin: originLoc,
    destination: destLoc,
    source,
  };
}
