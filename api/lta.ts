/**
 * Singapore Land Transport Authority (LTA) DataMall Client
 * Strictly adheres to guardrail: If credential is missing at runtime, returns HTTP 500 with {"error":"credential not configured"}
 */

import { getLtaAccountKey } from './credentials';

const LTA_BASE_URL = 'https://datamall2.mytransport.sg/ltaodataservice';

export class LtaCredentialError extends Error {
  statusCode: number;
  constructor(message = 'credential not configured') {
    super(message);
    this.name = 'LtaCredentialError';
    this.statusCode = 500;
  }
}

async function fetchLtaEndpoint<T = any>(endpointUrl: string): Promise<T> {
  const accountKey = getLtaAccountKey();

  if (!accountKey) {
    throw new LtaCredentialError('credential not configured');
  }

  const res = await fetch(endpointUrl, {
    headers: {
      AccountKey: accountKey,
      Accept: 'application/json',
      'User-Agent': 'SmartTransportNavigator/2.0',
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`LTA DataMall Error ${res.status}: ${res.statusText} - ${errorText}`);
  }

  return (await res.json()) as T;
}

/**
 * 1. Next buses at a stop (v3 - current version; 20-second refresh)
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode={code}
 */
export async function getLtaBusArrivals(busStopCode: string, serviceNo?: string) {
  if (!busStopCode) {
    throw new Error('BusStopCode is required');
  }

  let url = `${LTA_BASE_URL}/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
  if (serviceNo) {
    url += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
  }

  return fetchLtaEndpoint(url);
}

/**
 * 2. Live carpark lots (HDB + LTA + URA)
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 */
export async function getLtaCarParkAvailability() {
  const url = `${LTA_BASE_URL}/CarParkAvailabilityv2`;
  return fetchLtaEndpoint(url);
}

/**
 * 3. Traffic incidents
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents
 */
export async function getLtaTrafficIncidents() {
  const url = `${LTA_BASE_URL}/TrafficIncidents`;
  return fetchLtaEndpoint(url);
}

/**
 * 4. Train service status & disruptions
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts
 */
export async function getLtaTrainServiceAlerts() {
  const url = `${LTA_BASE_URL}/TrainServiceAlerts`;
  return fetchLtaEndpoint(url);
}
