import { LiveVehicle, LiveBusArrival, LineStatus, TransitAlert, LiveStreamPacket } from '../src/types';
import { getAggregatedWeatherSummary, AggregatedEnvironmentSummary } from '../api/weather';
import { isLtaConfigured } from '../api/credentials';

// Latest live weather cache for stream broadcast
let liveEnvironmentSummary: AggregatedEnvironmentSummary = {
  updatedAt: new Date().toISOString(),
  condition: 'sunny',
  conditionText: 'Partly Cloudy',
  temperatureC: 31.0,
  rainfallMm: 0,
  humidityPercent: 72,
  windSpeedKmh: 12,
  psi24Hr: 38,
  uvIndex: 5,
  rainAdvisory: false,
  transitImpactNotice: 'Optimal transit conditions across rail and bus networks.',
  forecasts: [],
};

// Periodically sync live weather from Data.gov.sg v2
async function syncLiveWeather() {
  try {
    const summary = await getAggregatedWeatherSummary();
    liveEnvironmentSummary = summary;
  } catch (e) {
    // Keep last cached value
  }
}
syncLiveWeather();
setInterval(syncLiveWeather, 30000);

// Singapore Transport Network Key Locations & Coordinates
export const SG_LOCATIONS: Record<string, { lat: number; lng: number; code?: string; name: string; type: 'mrt' | 'bus_stop' | 'landmark' }> = {
  'Orchard MRT': { lat: 1.3040, lng: 103.8318, code: 'NS22/TE14', name: 'Orchard MRT Station', type: 'mrt' },
  'Orchard MRT Station': { lat: 1.3040, lng: 103.8318, code: 'NS22/TE14', name: 'Orchard MRT Station', type: 'mrt' },
  'Somerset MRT': { lat: 1.3003, lng: 103.8390, code: 'NS23', name: 'Somerset MRT Station', type: 'mrt' },
  'Dhoby Ghaut MRT': { lat: 1.2989, lng: 103.8456, code: 'NS24/NE6/CC1', name: 'Dhoby Ghaut Interchange', type: 'mrt' },
  'Dhoby Ghaut Interchange': { lat: 1.2989, lng: 103.8456, code: 'NS24/NE6/CC1', name: 'Dhoby Ghaut Interchange', type: 'mrt' },
  'City Hall MRT': { lat: 1.2931, lng: 103.8522, code: 'NS25/EW13', name: 'City Hall Interchange', type: 'mrt' },
  'Raffles Place MRT': { lat: 1.2830, lng: 103.8513, code: 'NS26/EW14', name: 'Raffles Place Interchange', type: 'mrt' },
  'Marina Bay MRT': { lat: 1.2760, lng: 103.8546, code: 'NS27/CE2/TE20', name: 'Marina Bay MRT Station', type: 'mrt' },
  'Bugis MRT': { lat: 1.3008, lng: 103.8560, code: 'EW12/DT14', name: 'Bugis Interchange', type: 'mrt' },
  'Bugis MRT Station': { lat: 1.3008, lng: 103.8560, code: 'EW12/DT14', name: 'Bugis Interchange', type: 'mrt' },
  'Paya Lebar MRT': { lat: 1.3182, lng: 103.8931, code: 'EW8/CC9', name: 'Paya Lebar Interchange', type: 'mrt' },
  'Changi Airport MRT': { lat: 1.3573, lng: 103.9885, code: 'CG2', name: 'Changi Airport Station', type: 'mrt' },
  'Changi Airport T3': { lat: 1.3548, lng: 103.9875, code: 'CG2', name: 'Changi Airport Terminal 3', type: 'mrt' },
  'Changi Airport': { lat: 1.3573, lng: 103.9885, code: 'CG2', name: 'Changi Airport Station', type: 'mrt' },
  'Jurong East MRT': { lat: 1.3331, lng: 103.7423, code: 'NS1/EW24', name: 'Jurong East Interchange', type: 'mrt' },
  'Jurong East': { lat: 1.3331, lng: 103.7423, code: 'NS1/EW24', name: 'Jurong East Interchange', type: 'mrt' },
  'Bishan MRT': { lat: 1.3508, lng: 103.8481, code: 'NS17/CC15', name: 'Bishan Interchange', type: 'mrt' },
  'Bishan MRT Station': { lat: 1.3508, lng: 103.8481, code: 'NS17/CC15', name: 'Bishan Interchange', type: 'mrt' },
  'Woodlands MRT': { lat: 1.4368, lng: 103.7865, code: 'NS9/TE2', name: 'Woodlands Integrated Transport Hub', type: 'mrt' },
  'Woodlands Integrated Transport Hub': { lat: 1.4368, lng: 103.7865, code: 'NS9/TE2', name: 'Woodlands Integrated Transport Hub', type: 'mrt' },
  'Tampines Central': { lat: 1.3532, lng: 103.9452, code: 'EW2/DT32', name: 'Tampines Central', type: 'mrt' },
  'HarbourFront Centre / VivoCity': { lat: 1.2653, lng: 103.8223, code: 'NE1/CC29', name: 'HarbourFront Centre / VivoCity', type: 'landmark' },
  'VivoCity': { lat: 1.2644, lng: 103.8222, name: 'VivoCity Singapore', type: 'landmark' },
  'Marina Bay Sands': { lat: 1.2838, lng: 103.8591, code: 'CE1/DT16', name: 'Marina Bay Sands', type: 'landmark' },
  'Singapore Botanic Gardens': { lat: 1.3138, lng: 103.8159, code: 'CC19/DT9', name: 'Botanic Gardens', type: 'landmark' },
  'Toa Payoh Central': { lat: 1.3327, lng: 103.8479, code: 'NS19', name: 'Toa Payoh Central', type: 'mrt' },
  'Opp City Hall Stn': { lat: 1.2934, lng: 103.8519, code: '04111', name: 'Opp City Hall Stn (04111)', type: 'bus_stop' },
  'Changi Airport PTB3': { lat: 1.3548, lng: 103.9875, code: '95109', name: 'Changi Airport PTB3 (95109)', type: 'bus_stop' },
  'Bef Orchard Stn Exit B': { lat: 1.3045, lng: 103.8325, code: '09022', name: 'Bef Orchard Stn Exit B (09022)', type: 'bus_stop' },
};

// Initial Vehicle Telemetry Simulation Pool
let activeVehicles: LiveVehicle[] = [
  {
    id: 'TR-NSL-101',
    service: 'NSL Train 101',
    type: 'train',
    lineCode: 'NSL',
    lat: 1.3040,
    lng: 103.8318,
    speedKmH: 58,
    headingDeg: 135,
    crowdLevel: 'Moderate',
    currentOrNextStop: 'Somerset MRT',
    destination: 'Marina South Pier',
    etaSecondsToNextStop: 75,
  },
  {
    id: 'TR-EWL-204',
    service: 'EWL Train 204',
    type: 'train',
    lineCode: 'EWL',
    lat: 1.3182,
    lng: 103.8931,
    speedKmH: 64,
    headingDeg: 78,
    crowdLevel: 'Low',
    currentOrNextStop: 'Eunos MRT',
    destination: 'Pasir Ris',
    etaSecondsToNextStop: 110,
  },
  {
    id: 'TR-TEL-309',
    service: 'TEL Train 309',
    type: 'train',
    lineCode: 'TEL',
    lat: 1.2980,
    lng: 103.8490,
    speedKmH: 62,
    headingDeg: 190,
    crowdLevel: 'Low',
    currentOrNextStop: 'Maxwell MRT',
    destination: 'Bayshore',
    etaSecondsToNextStop: 45,
  },
  {
    id: 'BUS-168-A',
    service: '168',
    type: 'bus',
    lat: 1.3450,
    lng: 103.9650,
    speedKmH: 42,
    headingDeg: 85,
    crowdLevel: 'Low',
    currentOrNextStop: 'Tampines Ave 4',
    destination: 'Changi Airport PTB3',
    etaSecondsToNextStop: 95,
    isElectric: true,
  },
  {
    id: 'BUS-858-C',
    service: '858',
    type: 'bus',
    lat: 1.4120,
    lng: 103.8240,
    speedKmH: 48,
    headingDeg: 110,
    crowdLevel: 'Moderate',
    currentOrNextStop: 'Khatib Stn',
    destination: 'Changi Airport T2/T3',
    etaSecondsToNextStop: 140,
  },
  {
    id: 'BUS-36-E',
    service: '36',
    type: 'bus',
    lat: 1.2965,
    lng: 103.8540,
    speedKmH: 36,
    headingDeg: 60,
    crowdLevel: 'Low',
    currentOrNextStop: 'Opp Suntec City',
    destination: 'Changi Airport T1/T3/T4',
    etaSecondsToNextStop: 180,
    isElectric: true,
  },
  {
    id: 'BUS-143-F',
    service: '143',
    type: 'bus',
    lat: 1.2910,
    lng: 103.8480,
    speedKmH: 32,
    headingDeg: 245,
    crowdLevel: 'High',
    currentOrNextStop: 'Clarke Quay Stn',
    destination: 'Jurong East Int',
    etaSecondsToNextStop: 60,
  },
];

let lineStatuses: LineStatus[] = [
  {
    lineCode: 'NSL',
    name: 'North-South Line',
    color: '#d42e12',
    textColor: '#ffffff',
    status: 'Normal Service',
    frequency: '2–3 mins',
    lastUpdated: 'Just now',
  },
  {
    lineCode: 'EWL',
    name: 'East-West Line',
    color: '#009645',
    textColor: '#ffffff',
    status: 'Normal Service',
    frequency: '2–4 mins',
    lastUpdated: 'Just now',
  },
  {
    lineCode: 'CCL',
    name: 'Circle Line',
    color: '#fa9e0d',
    textColor: '#000000',
    status: 'Minor Delay',
    delayNotice: '+5 mins additional travel time due to planned stage 6 track integration tests near HarbourFront.',
    affectedSegment: 'HarbourFront ↔ Telok Blangah',
    frequency: '4–6 mins',
    lastUpdated: '1 min ago',
  },
  {
    lineCode: 'DTL',
    name: 'Downtown Line',
    color: '#005ec4',
    textColor: '#ffffff',
    status: 'Normal Service',
    frequency: '2–4 mins',
    lastUpdated: 'Just now',
  },
  {
    lineCode: 'TEL',
    name: 'Thomson-East Coast Line',
    color: '#9D5B25',
    textColor: '#ffffff',
    status: 'Normal Service',
    frequency: '3–5 mins',
    lastUpdated: 'Just now',
  },
  {
    lineCode: 'NEL',
    name: 'North East Line',
    color: '#8f4199',
    textColor: '#ffffff',
    status: 'Normal Service',
    frequency: '2–4 mins',
    lastUpdated: 'Just now',
  },
];

let activeAlerts: TransitAlert[] = [
  {
    id: 'ALT-101',
    type: 'warning',
    title: 'Circle Line Extension Track Work',
    timestamp: 'Today, 08:30 AM',
    affectedLine: 'Circle Line (CCL)',
    description: 'Single platform operations between HarbourFront and Telok Blangah. Please add 5-8 minutes to your journey.',
    bridgingBus: true,
    bridgingBusRoute: 'Free bridging bus available between HarbourFront and Labrador Park stations.',
  },
  {
    id: 'ALT-102',
    type: 'info',
    title: 'Heavy Rain & Thunderstorm Advisory',
    timestamp: 'Today, 09:15 AM',
    affectedLine: 'Islandwide (Bus & Surface Walkways)',
    description: 'Wet weather detected across central and eastern regions. Sheltered linkways recommended.',
    bridgingBus: false,
  },
];

// Live bus arrivals dynamic cache
let busArrivalsStore: Record<string, LiveBusArrival[]> = {
  '04111': [
    { service: '168', destination: 'Changi Airport PTB3', nextBus: '2 min', nextBusSeconds: 120, nextNextBus: '9 min', nextNextBusSeconds: 540, type: 'Double Deck', crowd: 'Seats Available', wheelchairAccessible: true },
    { service: '858', destination: 'Changi Airport T2/T3', nextBus: '5 min', nextBusSeconds: 300, nextNextBus: '14 min', nextNextBusSeconds: 840, type: 'Single Deck', crowd: 'Standing Available', wheelchairAccessible: true },
    { service: '36', destination: 'Changi Airport T1/T3/T4', nextBus: '8 min', nextBusSeconds: 480, nextNextBus: '16 min', nextNextBusSeconds: 960, type: 'Single Deck', crowd: 'Seats Available', wheelchairAccessible: true },
    { service: '143', destination: 'Jurong East Int', nextBus: '1 min', nextBusSeconds: 60, nextNextBus: '11 min', nextNextBusSeconds: 660, type: 'Double Deck', crowd: 'Seats Available', wheelchairAccessible: true },
  ],
  '09022': [
    { service: '65', destination: 'Tampines Int', nextBus: '3 min', nextBusSeconds: 180, nextNextBus: '12 min', nextNextBusSeconds: 720, type: 'Double Deck', crowd: 'Seats Available', wheelchairAccessible: true },
    { service: '174', destination: 'New Bridge Rd Ter', nextBus: '6 min', nextBusSeconds: 360, nextNextBus: '15 min', nextNextBusSeconds: 900, type: 'Single Deck', crowd: 'Standing Available', wheelchairAccessible: true },
    { service: '111', destination: 'Ghim Moh Ter', nextBus: '1 min', nextBusSeconds: 50, nextNextBus: '10 min', nextNextBusSeconds: 600, type: 'Single Deck', crowd: 'Seats Available', wheelchairAccessible: true },
  ],
};

// SSE Client Registry
type SseClient = {
  id: string;
  res: any;
};
const sseClients = new Map<string, SseClient>();

// Telemetry Simulation Loop
let telemetryTimer: NodeJS.Timeout | null = null;

export function startTelemetrySimulation() {
  if (telemetryTimer) return;

  telemetryTimer = setInterval(() => {
    // 1. Advance active vehicles
    activeVehicles = activeVehicles.map((v) => {
      // Small jitter in speed and position along heading
      const rad = (v.headingDeg * Math.PI) / 180;
      const speedOffset = (Math.random() - 0.5) * 4;
      const speedKmH = Math.max(15, Math.min(85, v.speedKmH + speedOffset));
      
      // Delta coordinate (~0.0001 deg is ~11 meters)
      const moveDistance = (speedKmH / 3600) * 2 * (1 / 111); // in degrees approx for 2 sec
      const nextLat = v.lat + Math.cos(rad) * moveDistance;
      const nextLng = v.lng + Math.sin(rad) * moveDistance;
      
      // Update ETA
      let etaSec = v.etaSecondsToNextStop - 2;
      if (etaSec <= 0) {
        etaSec = Math.floor(Math.random() * 120) + 60;
      }

      return {
        ...v,
        lat: Number(nextLat.toFixed(6)),
        lng: Number(nextLng.toFixed(6)),
        speedKmH: Math.round(speedKmH),
        etaSecondsToNextStop: etaSec,
      };
    });

    // 2. Decrement bus arrivals countdown
    for (const stopCode of Object.keys(busArrivalsStore)) {
      busArrivalsStore[stopCode] = busArrivalsStore[stopCode].map((bus) => {
        const nextSec = Math.max(0, bus.nextBusSeconds - 2);
        let nextNextSec = bus.nextNextBusSeconds - 2;

        let display = `${Math.ceil(nextSec / 60)} min`;
        if (nextSec <= 30) {
          display = 'Arr';
        }
        if (nextSec === 0) {
          // Recycle
          return {
            ...bus,
            nextBus: `${Math.ceil(bus.nextNextBusSeconds / 60)} min`,
            nextBusSeconds: bus.nextNextBusSeconds,
            nextNextBus: '15 min',
            nextNextBusSeconds: 900,
          };
        }

        return {
          ...bus,
          nextBus: display,
          nextBusSeconds: nextSec,
          nextNextBus: `${Math.ceil(nextNextSec / 60)} min`,
          nextNextBusSeconds: Math.max(60, nextNextSec),
        };
      });
    }

    // 3. Broadcast to all SSE subscribers
    broadcastStreamPacket();
  }, 2000);
}

export function broadcastStreamPacket() {
  if (sseClients.size === 0) return;

  const ltaActive = isLtaConfigured();
  const packet: LiveStreamPacket = {
    timestamp: Date.now(),
    vehicles: activeVehicles,
    lineStatuses,
    alerts: activeAlerts,
    arrivalsSample: busArrivalsStore,
    weather: {
      condition: liveEnvironmentSummary.condition,
      tempC: liveEnvironmentSummary.temperatureC,
      rainfallMm: liveEnvironmentSummary.rainfallMm,
      rainAdvisory: liveEnvironmentSummary.rainAdvisory,
    },
    serverStats: {
      activeStreams: sseClients.size,
      updateFrequencyMs: 2000,
      externalApiConfigured: ltaActive,
      provider: ltaActive ? 'LTA DataMall & Data.gov.sg (Live Stream)' : 'Data.gov.sg (Live Weather) & Transit Engine',
    },
  };

  const payload = `data: ${JSON.stringify(packet)}\n\n`;
  for (const [id, client] of sseClients.entries()) {
    try {
      client.res.write(payload);
    } catch (e) {
      sseClients.delete(id);
    }
  }
}

export function registerSseClient(id: string, res: any) {
  sseClients.set(id, { id, res });
  const ltaActive = isLtaConfigured();
  // Send immediate first packet
  const packet: LiveStreamPacket = {
    timestamp: Date.now(),
    vehicles: activeVehicles,
    lineStatuses,
    alerts: activeAlerts,
    arrivalsSample: busArrivalsStore,
    weather: {
      condition: liveEnvironmentSummary.condition,
      tempC: liveEnvironmentSummary.temperatureC,
      rainfallMm: liveEnvironmentSummary.rainfallMm,
      rainAdvisory: liveEnvironmentSummary.rainAdvisory,
    },
    serverStats: {
      activeStreams: sseClients.size,
      updateFrequencyMs: 2000,
      externalApiConfigured: ltaActive,
      provider: ltaActive ? 'LTA DataMall & Data.gov.sg (Live Stream)' : 'Data.gov.sg (Live Weather) & Transit Engine',
    },
  };
  res.write(`data: ${JSON.stringify(packet)}\n\n`);
}

export function unregisterSseClient(id: string) {
  sseClients.delete(id);
}

// REST helper getters
export function getLiveVehicles() {
  return activeVehicles;
}

export function getLineStatuses() {
  return lineStatuses;
}

export function getActiveAlerts() {
  return activeAlerts;
}

export function getBusArrivals(stopCode: string) {
  return busArrivalsStore[stopCode] || [
    { service: '65', destination: 'Tampines Int', nextBus: '4 min', nextBusSeconds: 240, nextNextBus: '14 min', nextNextBusSeconds: 840, type: 'Double Deck', crowd: 'Seats Available', wheelchairAccessible: true },
    { service: '190', destination: 'Chinatown', nextBus: '6 min', nextBusSeconds: 360, nextNextBus: '16 min', nextNextBusSeconds: 960, type: 'Bendy', crowd: 'Standing Available', wheelchairAccessible: true },
  ];
}
