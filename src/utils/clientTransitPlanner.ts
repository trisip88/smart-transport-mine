import { RouteOption, RouteSegment, DetailedStep, TransportMode, SortOption } from '../types';
import { POPULAR_PLACES } from '../data/mockTransitData';

export interface LatLng {
  lat: number;
  lng: number;
  name: string;
}

export const SG_STATIONS_COORDS: Record<string, { lat: number; lng: number; code?: string; name: string; line?: string }> = {
  'Orchard': { lat: 1.3040, lng: 103.8318, code: 'NS22/TE14', name: 'Orchard MRT Station', line: 'NSL' },
  'Orchard MRT': { lat: 1.3040, lng: 103.8318, code: 'NS22/TE14', name: 'Orchard MRT Station', line: 'NSL' },
  'Orchard MRT Station': { lat: 1.3040, lng: 103.8318, code: 'NS22/TE14', name: 'Orchard MRT Station', line: 'NSL' },
  'Somerset': { lat: 1.3003, lng: 103.8390, code: 'NS23', name: 'Somerset MRT Station', line: 'NSL' },
  'Dhoby Ghaut': { lat: 1.2989, lng: 103.8456, code: 'NS24/NE6/CC1', name: 'Dhoby Ghaut Interchange', line: 'NSL' },
  'City Hall': { lat: 1.2931, lng: 103.8522, code: 'NS25/EW13', name: 'City Hall Interchange', line: 'NSL' },
  'Raffles Place': { lat: 1.2830, lng: 103.8513, code: 'NS26/EW14', name: 'Raffles Place Interchange', line: 'NSL' },
  'Marina Bay': { lat: 1.2760, lng: 103.8546, code: 'NS27/CE2/TE20', name: 'Marina Bay MRT Station', line: 'NSL' },
  'Marina Bay Sands': { lat: 1.2838, lng: 103.8591, code: 'CE1/DT16', name: 'Marina Bay Sands', line: 'DTL' },
  'Bayfront': { lat: 1.2819, lng: 103.8590, code: 'CE1/DT16', name: 'Bayfront MRT Station', line: 'DTL' },
  'Bugis': { lat: 1.3008, lng: 103.8560, code: 'EW12/DT14', name: 'Bugis Interchange', line: 'EWL' },
  'Paya Lebar': { lat: 1.3182, lng: 103.8931, code: 'EW8/CC9', name: 'Paya Lebar Interchange', line: 'EWL' },
  'Changi Airport': { lat: 1.3573, lng: 103.9885, code: 'CG2', name: 'Changi Airport Station', line: 'EWL' },
  'Changi Airport T3': { lat: 1.3548, lng: 103.9875, code: 'CG2', name: 'Changi Airport Terminal 3', line: 'EWL' },
  'Changi Airport Terminal 3': { lat: 1.3548, lng: 103.9875, code: 'CG2', name: 'Changi Airport Terminal 3', line: 'EWL' },
  'Jurong East': { lat: 1.3331, lng: 103.7423, code: 'NS1/EW24', name: 'Jurong East Interchange', line: 'EWL' },
  'Jurong East MRT': { lat: 1.3331, lng: 103.7423, code: 'NS1/EW24', name: 'Jurong East Interchange', line: 'EWL' },
  'Bishan': { lat: 1.3508, lng: 103.8481, code: 'NS17/CC15', name: 'Bishan Interchange', line: 'NSL' },
  'Bishan MRT': { lat: 1.3508, lng: 103.8481, code: 'NS17/CC15', name: 'Bishan Interchange', line: 'NSL' },
  'Woodlands': { lat: 1.4368, lng: 103.7865, code: 'NS9/TE2', name: 'Woodlands Integrated Transport Hub', line: 'NSL' },
  'Woodlands MRT': { lat: 1.4368, lng: 103.7865, code: 'NS9/TE2', name: 'Woodlands Integrated Transport Hub', line: 'NSL' },
  'Tampines': { lat: 1.3532, lng: 103.9452, code: 'EW2/DT32', name: 'Tampines Central', line: 'EWL' },
  'Tampines Central': { lat: 1.3532, lng: 103.9452, code: 'EW2/DT32', name: 'Tampines Central', line: 'EWL' },
  'HarbourFront': { lat: 1.2653, lng: 103.8223, code: 'NE1/CC29', name: 'HarbourFront Centre / VivoCity', line: 'NEL' },
  'HarbourFront Centre / VivoCity': { lat: 1.2653, lng: 103.8223, code: 'NE1/CC29', name: 'HarbourFront Centre / VivoCity', line: 'NEL' },
  'VivoCity': { lat: 1.2644, lng: 103.8222, name: 'VivoCity Singapore', line: 'NEL' },
  'Botanic Gardens': { lat: 1.3138, lng: 103.8159, code: 'CC19/DT9', name: 'Botanic Gardens', line: 'DTL' },
  'Toa Payoh': { lat: 1.3327, lng: 103.8479, code: 'NS19', name: 'Toa Payoh Central', line: 'NSL' },
  'Toa Payoh Central': { lat: 1.3327, lng: 103.8479, code: 'NS19', name: 'Toa Payoh Central', line: 'NSL' },
  'Ang Mo Kio': { lat: 1.3698, lng: 103.8497, code: 'NS16', name: 'Ang Mo Kio MRT Station', line: 'NSL' },
  'Clementi': { lat: 1.3151, lng: 103.7652, code: 'EW23', name: 'Clementi MRT Station', line: 'EWL' },
  'Bedok': { lat: 1.3240, lng: 103.9300, code: 'EW5', name: 'Bedok MRT Station', line: 'EWL' },
  'Serangoon': { lat: 1.3497, lng: 103.8736, code: 'NE12/CC13', name: 'Serangoon Interchange', line: 'NEL' },
  'Chinatown': { lat: 1.2843, lng: 103.8433, code: 'NE4/DT19', name: 'Chinatown Station', line: 'NEL' },
  'Newton': { lat: 1.3123, lng: 103.8380, code: 'NS21/DT11', name: 'Newton Interchange', line: 'NSL' },
  'Novena': { lat: 1.3204, lng: 103.8438, code: 'NS20', name: 'Novena MRT Station', line: 'NSL' },
  'Sentosa': { lat: 1.2494, lng: 103.8303, name: 'Sentosa Island', line: 'NEL' },
};

export function geocodePlaceClient(placeName: string, userLat?: number, userLng?: number): LatLng {
  const trimmed = (placeName || 'Current Location').trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('current') || lower.includes('gps') || lower.includes('my location')) {
    return {
      lat: userLat || 1.3343,
      lng: userLng || 103.8563,
      name: 'Current Location',
    };
  }

  // Exact or sub-match in registry
  for (const [key, loc] of Object.entries(SG_STATIONS_COORDS)) {
    if (
      lower === key.toLowerCase() ||
      lower === loc.name.toLowerCase() ||
      lower.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lower)
    ) {
      return { lat: loc.lat, lng: loc.lng, name: loc.name };
    }
  }

  const popular = POPULAR_PLACES.find((p) => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase()));
  if (popular) {
    const matched = Object.values(SG_STATIONS_COORDS).find((s) => s.name.toLowerCase().includes(popular.name.toLowerCase()));
    if (matched) return { lat: matched.lat, lng: matched.lng, name: popular.name };
  }

  // Default coordinate in Singapore
  return {
    lat: 1.3040,
    lng: 103.8318,
    name: trimmed,
  };
}

export function computeClientTransitPlan(
  origin: string,
  destination: string,
  transportMode: TransportMode = 'mixed',
  sortBy: SortOption = 'best_match',
  userLat?: number,
  userLng?: number
): { routes: RouteOption[]; origin: LatLng; destination: LatLng } {
  const originLoc = geocodePlaceClient(origin, userLat, userLng);
  const destLoc = geocodePlaceClient(destination);

  const dLat = destLoc.lat - originLoc.lat;
  const dLng = destLoc.lng - originLoc.lng;
  const straightDistKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
  const baseMinutes = Math.max(14, Math.round(straightDistKm * 2.8 + 6));

  const now = Date.now();
  const formatTime = (offsetMins: number) => {
    const d = new Date(now + offsetMins * 60000);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const routes: RouteOption[] = [];

  // Line determinations
  let lineCode = 'NSL';
  let lineName = 'North-South Line';
  let lineColorBg = '#FDECE8';
  let lineColorText = '#d42e12';
  let lineColorBorder = '#e76f51';

  if (destLoc.name.includes('Airport') || destLoc.name.includes('Tampines') || destLoc.name.includes('Jurong') || destLoc.name.includes('Bedok') || destLoc.name.includes('Clementi')) {
    lineCode = 'EWL';
    lineName = 'East-West Line';
    lineColorBg = '#E6F4EA';
    lineColorText = '#00752d';
    lineColorBorder = '#009645';
  } else if (destLoc.name.includes('Sands') || destLoc.name.includes('Bayfront') || destLoc.name.includes('Botanic') || destLoc.name.includes('Bugis')) {
    lineCode = 'DTL';
    lineName = 'Downtown Line';
    lineColorBg = '#E8F1FD';
    lineColorText = '#005ec4';
    lineColorBorder = '#1a73e8';
  } else if (destLoc.name.includes('HarbourFront') || destLoc.name.includes('VivoCity') || destLoc.name.includes('Chinatown') || destLoc.name.includes('Serangoon')) {
    lineCode = 'NEL';
    lineName = 'North East Line';
    lineColorBg = '#F3E8FD';
    lineColorText = '#8f4199';
    lineColorBorder = '#7b2cbf';
  }

  // 1. MRT Rail Option
  if (transportMode === 'mixed' || transportMode === 'train_only') {
    const dur = baseMinutes;
    const stops = Math.max(3, Math.min(16, Math.round(dur / 3.2)));
    routes.push({
      id: `client-mrt-${Date.now()}-1`,
      totalDurationMinutes: dur,
      departureTime: formatTime(2),
      arrivalTime: formatTime(2 + dur),
      status: 'On Time',
      statusColor: 'text-[#006e2a]',
      badge: 'Most Optimal',
      isOptimal: true,
      fare: `$${(1.49 + dur * 0.015).toFixed(2)}`,
      calories: Math.round(dur * 2.2),
      carbonSaved: `${(dur * 0.038).toFixed(2)} kg CO₂`,
      transportType: 'train_only',
      segments: [
        {
          id: 'seg-mrt-walk1',
          mode: 'walk',
          durationMinutes: 4,
          label: '4 min',
          fromStop: originLoc.name,
          toStop: `${originLoc.name.includes('MRT') ? originLoc.name : originLoc.name + ' Station'}`,
        },
        {
          id: 'seg-mrt-train',
          mode: 'train',
          durationMinutes: dur - 7,
          label: lineCode,
          lineCode,
          lineName,
          colorBg: lineColorBg,
          colorText: lineColorText,
          colorBorder: lineColorBorder,
          fromStop: originLoc.name,
          toStop: destLoc.name,
          numStops: stops,
          platform: 'Platform A/B',
          headsign: destLoc.name,
          crowdLevel: 'Low',
        },
        {
          id: 'seg-mrt-walk2',
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
          instruction: `Walk to ${originLoc.name.includes('Station') ? originLoc.name : originLoc.name + ' Station'}`,
          detail: 'Take sheltered concourse linkway (approx 250m)',
          mode: 'walk',
          duration: '4 min',
        },
        {
          time: formatTime(6),
          instruction: `Board ${lineName} (${lineCode})`,
          detail: `Ride ${stops} stops directly towards ${destLoc.name}`,
          mode: 'train',
          badge: lineCode,
          badgeColor: lineColorText,
          duration: `${dur - 7} min`,
          stopsCount: stops,
        },
        {
          time: formatTime(2 + dur - 3),
          instruction: `Arrive at ${destLoc.name}`,
          detail: 'Follow station signs to exit',
          mode: 'destination',
          duration: '3 min',
        },
      ],
    });
  }

  // 2. Direct Express Bus Option
  if (transportMode === 'mixed' || transportMode === 'bus_only') {
    const dur = Math.round(baseMinutes * 1.2 + 3);
    const busService = destLoc.name.includes('Airport') ? '36' : destLoc.name.includes('Sands') ? '502' : '147';
    const stops = Math.max(5, Math.min(22, Math.round(dur / 2.5)));

    routes.push({
      id: `client-bus-${Date.now()}-2`,
      totalDurationMinutes: dur,
      departureTime: formatTime(4),
      arrivalTime: formatTime(4 + dur),
      status: 'On Time',
      statusColor: 'text-[#006e2a]',
      badge: transportMode === 'bus_only' ? 'Most Optimal' : 'Least Transfers',
      isOptimal: transportMode === 'bus_only',
      fare: `$${(1.28 + dur * 0.012).toFixed(2)}`,
      calories: Math.round(dur * 2.8),
      carbonSaved: `${(dur * 0.032).toFixed(2)} kg CO₂`,
      transportType: 'bus_only',
      segments: [
        {
          id: 'seg-bus-walk1',
          mode: 'walk',
          durationMinutes: 3,
          label: '3 min',
          fromStop: originLoc.name,
          toStop: 'Nearest Bus Stop',
        },
        {
          id: 'seg-bus-ride',
          mode: 'bus',
          durationMinutes: dur - 6,
          label: busService,
          serviceNumber: busService,
          colorBg: '#E6F4EA',
          colorText: '#00752d',
          colorBorder: '#006e2a',
          fromStop: `${originLoc.name} Bus Shelter`,
          toStop: `${destLoc.name} Bus Bay`,
          numStops: stops,
          platform: 'Bus Stop Platform',
          headsign: destLoc.name,
          crowdLevel: 'Low',
        },
        {
          id: 'seg-bus-walk2',
          mode: 'walk',
          durationMinutes: 3,
          label: '3 min',
          fromStop: `${destLoc.name} Bus Bay`,
          toStop: destLoc.name,
        },
      ],
      detailedSteps: [
        {
          time: formatTime(4),
          instruction: `Walk to Bus Stop near ${originLoc.name}`,
          detail: 'Head to roadside bus stop shelter (approx 180m)',
          mode: 'walk',
          duration: '3 min',
        },
        {
          time: formatTime(7),
          instruction: `Board Bus ${busService}`,
          detail: `Ride ${stops} stops directly to ${destLoc.name}`,
          mode: 'bus',
          badge: busService,
          badgeColor: '#00752d',
          duration: `${dur - 6} min`,
          stopsCount: stops,
        },
        {
          time: formatTime(4 + dur - 3),
          instruction: `Arrive at ${destLoc.name}`,
          detail: 'Alight at main lobby / arrival gate',
          mode: 'destination',
          duration: '3 min',
        },
      ],
    });
  }

  // 3. Fast Multimodal Alternative
  if (transportMode === 'mixed') {
    const dur = Math.max(12, Math.round(baseMinutes * 0.92));
    const busService = '858';
    routes.push({
      id: `client-mixed-${Date.now()}-3`,
      totalDurationMinutes: dur,
      departureTime: formatTime(1),
      arrivalTime: formatTime(1 + dur),
      status: 'On Time',
      statusColor: 'text-[#006e2a]',
      badge: 'Fast Alternative',
      isOptimal: false,
      fare: `$${(1.75 + dur * 0.015).toFixed(2)}`,
      calories: Math.round(dur * 2.5),
      carbonSaved: `${(dur * 0.035).toFixed(2)} kg CO₂`,
      transportType: 'mixed',
      segments: [
        {
          id: 'seg-mix-w1',
          mode: 'walk',
          durationMinutes: 2,
          label: '2 min',
          fromStop: originLoc.name,
          toStop: 'Concourse Entrance',
        },
        {
          id: 'seg-mix-train',
          mode: 'train',
          durationMinutes: Math.round(dur * 0.55),
          label: lineCode,
          lineCode,
          lineName,
          colorBg: lineColorBg,
          colorText: lineColorText,
          colorBorder: lineColorBorder,
          fromStop: originLoc.name,
          toStop: 'Transit Interchange',
          numStops: 4,
          platform: 'Platform A',
          headsign: 'City Interchange',
          crowdLevel: 'Moderate',
        },
        {
          id: 'seg-mix-bus',
          mode: 'bus',
          durationMinutes: Math.round(dur * 0.35),
          label: busService,
          serviceNumber: busService,
          colorBg: '#E6F4EA',
          colorText: '#00752d',
          colorBorder: '#006e2a',
          fromStop: 'Interchange Bus Berth',
          toStop: destLoc.name,
          numStops: 4,
          platform: 'Berth 2',
          headsign: destLoc.name,
          crowdLevel: 'Low',
        },
        {
          id: 'seg-mix-w2',
          mode: 'walk',
          durationMinutes: 2,
          label: '2 min',
          fromStop: 'Dropoff Bay',
          toStop: destLoc.name,
        },
      ],
      detailedSteps: [
        {
          time: formatTime(1),
          instruction: `Walk to ${originLoc.name} MRT Station`,
          detail: 'Enter via underground underpass',
          mode: 'walk',
          duration: '2 min',
        },
        {
          time: formatTime(3),
          instruction: `Board ${lineName} (${lineCode})`,
          detail: 'Ride 4 stops to Transit Interchange',
          mode: 'train',
          badge: lineCode,
          badgeColor: lineColorText,
          duration: `${Math.round(dur * 0.55)} min`,
          stopsCount: 4,
        },
        {
          time: formatTime(3 + Math.round(dur * 0.55)),
          instruction: `Transfer to Bus ${busService}`,
          detail: 'Transfer at Interchange Berth 2 (1 min walk)',
          mode: 'bus',
          badge: busService,
          badgeColor: '#00752d',
          duration: `${Math.round(dur * 0.35)} min`,
          stopsCount: 4,
        },
        {
          time: formatTime(1 + dur),
          instruction: `Arrive at ${destLoc.name}`,
          detail: 'Journey completed on time',
          mode: 'destination',
          duration: '2 min',
        },
      ],
    });
  }

  // Sorting
  if (sortBy === 'fastest') {
    routes.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
  } else if (sortBy === 'least_transfers') {
    routes.sort((a, b) => a.segments.length - b.segments.length);
  } else if (sortBy === 'least_walking') {
    const walkDuration = (r: RouteOption) =>
      r.segments.filter((s) => s.mode === 'walk').reduce((acc, s) => acc + s.durationMinutes, 0);
    routes.sort((a, b) => walkDuration(a) - walkDuration(b));
  }

  if (routes.length > 0 && !routes.some((r) => r.isOptimal)) {
    routes[0].isOptimal = true;
    routes[0].badge = 'Most Optimal';
  }

  return { routes, origin: originLoc, destination: destLoc };
}
