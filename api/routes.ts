import { Router } from 'express';
import {
  getTwoHrForecast,
  getTwentyFourHrForecast,
  getFourDayOutlook,
  getAirTemperature,
  getRainfall,
  getPsi,
  getPm25,
  getUv,
  getRelativeHumidity,
  getWindSpeed,
  getAggregatedWeatherSummary,
} from './weather';
import {
  getLtaBusArrivals,
  getLtaCarParkAvailability,
  getLtaTrafficIncidents,
  getLtaTrainServiceAlerts,
  LtaCredentialError,
} from './lta';
import {
  searchOneMapPlaces,
  reverseGeocodeOneMap,
  getOneMapRoute,
  getOneMapToken,
  OneMapCredentialError,
  OneMapRouteType,
} from './onemap';
import { isLtaConfigured, isOneMapConfigured } from './credentials';

export const apiRouter = Router();

// -------------------------------------------------------------
// WEATHER & ENVIRONMENT (Data.gov.sg v2 - Keyless, Live)
// -------------------------------------------------------------

apiRouter.get('/weather/two-hr-forecast', async (req, res) => {
  try {
    const data = await getTwoHrForecast();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/twenty-four-hr-forecast', async (req, res) => {
  try {
    const data = await getTwentyFourHrForecast();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/four-day-outlook', async (req, res) => {
  try {
    const data = await getFourDayOutlook();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/air-temperature', async (req, res) => {
  try {
    const data = await getAirTemperature();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/rainfall', async (req, res) => {
  try {
    const data = await getRainfall();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/psi', async (req, res) => {
  try {
    const data = await getPsi();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/pm25', async (req, res) => {
  try {
    const data = await getPm25();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/uv', async (req, res) => {
  try {
    const data = await getUv();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/relative-humidity', async (req, res) => {
  try {
    const data = await getRelativeHumidity();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/wind-speed', async (req, res) => {
  try {
    const data = await getWindSpeed();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/weather/summary', async (req, res) => {
  try {
    const summary = await getAggregatedWeatherSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// LTA DATAMALL (Singapore Land Transport Authority)
// -------------------------------------------------------------

apiRouter.get('/lta/status', (req, res) => {
  res.json({
    configured: isLtaConfigured(),
    provider: 'LTA DataMall Singapore',
    endpoints: [
      '/api/lta/bus-arrival?BusStopCode=83139&ServiceNo=15',
      '/api/lta/carpark',
      '/api/lta/traffic-incidents',
      '/api/lta/train-alerts',
    ],
  });
});

apiRouter.get('/lta/bus-arrival', async (req, res) => {
  const busStopCode = (req.query.BusStopCode || req.query.busStopCode || req.query.stopCode) as string;
  const serviceNo = (req.query.ServiceNo || req.query.serviceNo) as string | undefined;

  if (!busStopCode) {
    return res.status(400).json({ error: 'BusStopCode query parameter is required (e.g. ?BusStopCode=83139)' });
  }

  try {
    const data = await getLtaBusArrivals(busStopCode, serviceNo);
    res.json(data);
  } catch (err: any) {
    if (err instanceof LtaCredentialError || err.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/lta/carpark', async (req, res) => {
  try {
    const data = await getLtaCarParkAvailability();
    res.json(data);
  } catch (err: any) {
    if (err instanceof LtaCredentialError || err.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/lta/traffic-incidents', async (req, res) => {
  try {
    const data = await getLtaTrafficIncidents();
    res.json(data);
  } catch (err: any) {
    if (err instanceof LtaCredentialError || err.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/lta/train-alerts', async (req, res) => {
  try {
    const data = await getLtaTrainServiceAlerts();
    res.json(data);
  } catch (err: any) {
    if (err instanceof LtaCredentialError || err.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ONEMAP SINGAPORE (Singapore Land Authority - SLA)
// -------------------------------------------------------------

apiRouter.get('/onemap/status', (req, res) => {
  res.json({
    configured: isOneMapConfigured(),
    provider: 'OneMap Singapore (SLA)',
    endpoints: [
      '/api/onemap/token (Mint/verify token)',
      '/api/onemap/search?searchVal=raffles%20place&returnGeom=Y&getAddrDetails=Y&pageNum=1',
      '/api/onemap/reverse-geocode?lat=1.3&lng=103.8&buffer=40&addressType=All',
      '/api/onemap/route?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk',
    ],
  });
});

apiRouter.post('/onemap/token', async (req, res) => {
  try {
    const token = await getOneMapToken();
    res.json({
      status: 'authenticated',
      tokenPreview: `${token.substring(0, 12)}...`,
      expiresIn: '3 days',
    });
  } catch (err: any) {
    if (err instanceof OneMapCredentialError || err.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/onemap/search', async (req, res) => {
  const searchVal = (req.query.searchVal || req.query.q || req.query.query) as string;
  const returnGeom = ((req.query.returnGeom as string)?.toUpperCase() === 'N' ? 'N' : 'Y') as 'Y' | 'N';
  const getAddrDetails = ((req.query.getAddrDetails as string)?.toUpperCase() === 'N' ? 'N' : 'Y') as 'Y' | 'N';
  const pageNum = parseInt(req.query.pageNum as string, 10) || 1;

  if (!searchVal) {
    return res.status(400).json({ error: 'searchVal query parameter is required (e.g. ?searchVal=raffles%20place)' });
  }

  try {
    const data = await searchOneMapPlaces(searchVal, returnGeom, getAddrDetails, pageNum);
    res.json(data);
  } catch (err: any) {
    if (err instanceof OneMapCredentialError || err.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/onemap/reverse-geocode', async (req, res) => {
  const lat = req.query.lat || (req.query.location as string)?.split(',')[0];
  const lng = req.query.lng || (req.query.location as string)?.split(',')[1];
  const buffer = parseInt(req.query.buffer as string, 10) || 40;
  const addressType = (req.query.addressType as 'All' | 'HDB' | 'Other') || 'All';

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat & lng or location parameter is required (e.g. ?lat=1.3&lng=103.8 or ?location=1.3,103.8)' });
  }

  try {
    const data = await reverseGeocodeOneMap(lat as string, lng as string, buffer, addressType);
    res.json(data);
  } catch (err: any) {
    if (err instanceof OneMapCredentialError || err.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/onemap/route', async (req, res) => {
  let startLat = req.query.startLat as string;
  let startLng = req.query.startLng as string;
  let endLat = req.query.endLat as string;
  let endLng = req.query.endLng as string;

  if (req.query.start && typeof req.query.start === 'string') {
    const parts = req.query.start.split(',');
    if (parts.length === 2) {
      startLat = parts[0];
      startLng = parts[1];
    }
  }

  if (req.query.end && typeof req.query.end === 'string') {
    const parts = req.query.end.split(',');
    if (parts.length === 2) {
      endLat = parts[0];
      endLng = parts[1];
    }
  }

  const routeType = ((req.query.routeType as string)?.toLowerCase() || 'walk') as OneMapRouteType;
  const date = req.query.date as string | undefined;
  const time = req.query.time as string | undefined;
  const mode = req.query.mode as 'TRANSIT' | 'BUS' | 'RAIL' | undefined;
  const maxWalkDistance = req.query.maxWalkDistance ? parseInt(req.query.maxWalkDistance as string, 10) : undefined;

  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({
      error: 'start and end parameters are required (e.g. ?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk)',
    });
  }

  try {
    const data = await getOneMapRoute(startLat, startLng, endLat, endLng, routeType, {
      date,
      time,
      mode,
      maxWalkDistance,
    });
    res.json(data);
  } catch (err: any) {
    if (err instanceof OneMapCredentialError || err.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// TRANSIT TRIP PLANNER (Multimodal OneMap + Singapore Rail/Bus)
// -------------------------------------------------------------

apiRouter.post('/transit/plan', async (req, res) => {
  try {
    const { planTransitRoute } = await import('../server/transit-planner');
    const { origin, destination, transportMode, sortBy, userLat, userLng } = req.body || {};
    const result = await planTransitRoute({
      origin,
      destination,
      transportMode,
      sortBy,
      userLat,
      userLng,
    });

    res.json({
      status: 'ok',
      origin: result.origin,
      destination: result.destination,
      source: result.source,
      routesCount: result.routes.length,
      routes: result.routes,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to calculate transit route' });
  }
});

apiRouter.get('/transit/plan', async (req, res) => {
  try {
    const { planTransitRoute } = await import('../server/transit-planner');
    const origin = (req.query.origin as string) || 'Current Location';
    const destination = (req.query.destination as string) || 'Changi Airport T3';
    const transportMode = (req.query.transportMode as any) || 'mixed';
    const sortBy = (req.query.sortBy as any) || 'best_match';
    const userLat = req.query.userLat ? parseFloat(req.query.userLat as string) : undefined;
    const userLng = req.query.userLng ? parseFloat(req.query.userLng as string) : undefined;

    const result = await planTransitRoute({
      origin,
      destination,
      transportMode,
      sortBy,
      userLat,
      userLng,
    });

    res.json({
      status: 'ok',
      origin: result.origin,
      destination: result.destination,
      source: result.source,
      routesCount: result.routes.length,
      routes: result.routes,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to calculate transit route' });
  }
});

