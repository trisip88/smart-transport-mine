/**
 * OneMap Singapore API Client
 * Strictly adheres to guardrail: If credential is missing at runtime, returns HTTP 500 with {"error":"credential not configured"}
 */

import { getOneMapEmail, getOneMapPassword, getOneMapDirectToken } from './credentials';

export class OneMapCredentialError extends Error {
  statusCode: number;
  constructor(message = 'credential not configured') {
    super(message);
    this.name = 'OneMapCredentialError';
    this.statusCode = 500;
  }
}

interface CachedToken {
  token: string;
  expiresAt: number; // Unix timestamp in ms
}

let inMemoryTokenCache: CachedToken | null = null;

/**
 * Mint or retrieve active OneMap token (lasts 3 days).
 * Uses ONEMAP_API_TOKEN if provided directly, otherwise authenticates via ONEMAP_EMAIL & ONEMAP_PASSWORD.
 */
export async function getOneMapToken(): Promise<string> {
  const email = getOneMapEmail();
  const password = getOneMapPassword();

  if (email && password) {
    const now = Date.now();
    if (inMemoryTokenCache && inMemoryTokenCache.expiresAt - now > 3600 * 1000) {
      return inMemoryTokenCache.token;
    }

    try {
      const res = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'SmartTransportNavigator/2.0',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const token = data.access_token || data.token;
        if (token) {
          const expiryDurationMs = 2.5 * 24 * 60 * 60 * 1000;
          inMemoryTokenCache = {
            token,
            expiresAt: now + expiryDurationMs,
          };
          return token;
        }
      }
    } catch {
      // Fallback to direct token if minting had a network issue
    }
  }

  const directToken = getOneMapDirectToken();
  if (directToken) {
    return directToken;
  }

  throw new OneMapCredentialError('credential not configured');
}

async function fetchOneMapEndpoint<T = any>(endpointUrl: string): Promise<T> {
  const token = await getOneMapToken();

  const res = await fetch(endpointUrl, {
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'User-Agent': 'SmartTransportNavigator/2.0',
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`OneMap API Error ${res.status}: ${res.statusText} - ${errorText}`);
  }

  return (await res.json()) as T;
}

/**
 * 1. Geocode / search (Elasticsearch)
 * URL: https://www.onemap.gov.sg/api/common/elastic/search?searchVal=...&returnGeom=Y&getAddrDetails=Y&pageNum=1
 */
export async function searchOneMapPlaces(
  searchVal: string,
  returnGeom: 'Y' | 'N' = 'Y',
  getAddrDetails: 'Y' | 'N' = 'Y',
  pageNum = 1
) {
  if (!searchVal || searchVal.trim() === '') {
    throw new Error('searchVal parameter is required');
  }

  const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
    searchVal.trim()
  )}&returnGeom=${returnGeom}&getAddrDetails=${getAddrDetails}&pageNum=${pageNum}`;

  return fetchOneMapEndpoint(url);
}

/**
 * 2. Reverse geocode
 * URL: https://www.onemap.gov.sg/api/public/revgeocode?location=1.3,103.8&buffer=40&addressType=All
 */
export async function reverseGeocodeOneMap(
  lat: number | string,
  lng: number | string,
  buffer = 40,
  addressType: 'All' | 'HDB' | 'Other' = 'All'
) {
  if (lat === undefined || lng === undefined) {
    throw new Error('lat and lng parameters are required');
  }

  const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${encodeURIComponent(
    `${lat},${lng}`
  )}&buffer=${buffer}&addressType=${addressType}`;

  return fetchOneMapEndpoint(url);
}

export type OneMapRouteType = 'walk' | 'drive' | 'cycle' | 'pt';

/**
 * 3. Routing (walk | drive | cycle | pt)
 * URL: https://www.onemap.gov.sg/api/public/routingsvc/route?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk
 */
export async function getOneMapRoute(
  startLat: number | string,
  startLng: number | string,
  endLat: number | string,
  endLng: number | string,
  routeType: OneMapRouteType = 'walk',
  options?: {
    date?: string;
    time?: string;
    mode?: 'TRANSIT' | 'BUS' | 'RAIL';
    maxWalkDistance?: number;
    numItineraries?: number;
  }
) {
  if (!startLat || !startLng || !endLat || !endLng) {
    throw new Error('start and end coordinates are required');
  }

  let url = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${encodeURIComponent(
    `${startLat},${startLng}`
  )}&end=${encodeURIComponent(`${endLat},${endLng}`)}&routeType=${routeType}`;

  if (options?.date) url += `&date=${encodeURIComponent(options.date)}`;
  if (options?.time) url += `&time=${encodeURIComponent(options.time)}`;
  if (options?.mode) url += `&mode=${encodeURIComponent(options.mode)}`;
  if (options?.maxWalkDistance) {
    url += `&maxWalkDistance=${encodeURIComponent(options.maxWalkDistance)}`;
  } else if (routeType === 'pt') {
    url += `&maxWalkDistance=2500`;
  }
  if (options?.numItineraries) {
    url += `&numItineraries=${encodeURIComponent(options.numItineraries)}`;
  }

  try {
    return await fetchOneMapEndpoint(url);
  } catch (err: any) {
    // If OneMap returns 404 "No route found", return an empty plan structure gracefully
    if (err.message && (err.message.includes('404') || err.message.includes('No route found'))) {
      return { plan: { itineraries: [] }, error: 'No route found between coordinates' };
    }
    throw err;
  }
}
