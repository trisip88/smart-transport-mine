import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './api/routes';
import { isLtaConfigured, isOneMapConfigured } from './api/credentials';
import {
  startTelemetrySimulation,
  registerSseClient,
  unregisterSseClient,
  getLiveVehicles,
  getLineStatuses,
  getActiveAlerts,
  getBusArrivals,
} from './server/transit-service';
import {
  findNearestTransitStops,
  reverseGeocodeLocation,
  trackJourneyProgress,
} from './server/geolocation-service';
import { DEFAULT_ROUTES } from './src/data/mockTransitData';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount API router for Weather (Data.gov.sg v2) & LTA DataMall
  app.use('/api', apiRouter);

  // Start real-time background telemetry engine
  startTelemetrySimulation();

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Smart Transport Navigator Backend Engine',
      realtimeStreaming: 'active',
      geolocationTracking: 'active',
      weatherProvider: 'Singapore Data.gov.sg (Live v2)',
      transitProvider: isLtaConfigured() ? 'LTA DataMall Singapore (Configured)' : 'LTA Simulation & RT Streamer',
      oneMapProvider: isOneMapConfigured() ? 'OneMap Singapore (Configured)' : 'OneMap SLA (Token Ready)',
      uptime: process.uptime(),
    });
  });

  // Config & API status check
  app.get('/api/config', (req, res) => {
    res.json({
      status: 'ok',
      streamUrl: '/api/stream/live-transit',
      ltaConfigured: isLtaConfigured(),
      oneMapConfigured: isOneMapConfigured(),
      weatherLive: true,
      weatherEndpoints: [
        '/api/weather/two-hr-forecast',
        '/api/weather/twenty-four-hr-forecast',
        '/api/weather/four-day-outlook',
        '/api/weather/air-temperature',
        '/api/weather/rainfall',
        '/api/weather/psi',
        '/api/weather/pm25',
        '/api/weather/uv',
        '/api/weather/relative-humidity',
        '/api/weather/wind-speed',
        '/api/weather/summary',
      ],
      ltaEndpoints: [
        '/api/lta/bus-arrival?BusStopCode=83139&ServiceNo=15',
        '/api/lta/carpark',
        '/api/lta/traffic-incidents',
        '/api/lta/train-alerts',
      ],
      oneMapEndpoints: [
        '/api/onemap/token',
        '/api/onemap/search?searchVal=raffles%20place&returnGeom=Y&getAddrDetails=Y&pageNum=1',
        '/api/onemap/reverse-geocode?lat=1.3&lng=103.8&buffer=40&addressType=All',
        '/api/onemap/route?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk',
      ],
      geolocationEndpoints: [
        '/api/geolocation/reverse-geocode',
        '/api/geolocation/nearby-stops',
        '/api/geolocation/track-progress',
      ],
    });
  });

  // 1. Real-Time Data Streaming via Server-Sent Events (SSE)
  app.get('/api/stream/live-transit', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders?.();

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    registerSseClient(clientId, res);

    // Keep alive ping every 15s
    const pingInterval = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(pingInterval);
      unregisterSseClient(clientId);
      res.end();
    });
  });

  // 2. REST Transit Endpoints
  app.get('/api/transit/lines', (req, res) => {
    res.json(getLineStatuses());
  });

  app.get('/api/transit/vehicles', (req, res) => {
    res.json(getLiveVehicles());
  });

  app.get('/api/transit/arrivals/:stopCode', (req, res) => {
    const { stopCode } = req.params;
    res.json(getBusArrivals(stopCode));
  });

  app.get('/api/transit/alerts', (req, res) => {
    res.json(getActiveAlerts());
  });

  app.post('/api/transit/plan', async (req, res) => {
    try {
      const { planTransitRoute } = await import('./server/transit-planner');
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

  // 3. High-Precision Geolocation Endpoints
  app.post('/api/geolocation/reverse-geocode', (req, res) => {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Valid latitude and longitude numbers required' });
    }
    const result = reverseGeocodeLocation(lat, lng);
    res.json(result);
  });

  app.post('/api/geolocation/nearby-stops', (req, res) => {
    const { lat, lng, limit } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Valid latitude and longitude numbers required' });
    }
    const stops = findNearestTransitStops(lat, lng, limit ? Number(limit) : 5);
    res.json({ stops });
  });

  app.post('/api/geolocation/track-progress', (req, res) => {
    const { routeId, lat, lng, currentStepIndex } = req.body;
    const route = DEFAULT_ROUTES.find((r) => r.id === routeId) || DEFAULT_ROUTES[0];
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Valid latitude and longitude numbers required' });
    }

    const progress = trackJourneyProgress(route, lat, lng, currentStepIndex || 0);
    res.json(progress);
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Transport Navigator server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
