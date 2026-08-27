import { useState, useEffect, useRef } from 'react';
import { LiveStreamPacket, LiveVehicle, LineStatus, TransitAlert, LiveBusArrival } from '../types';
import { LINE_STATUSES, ACTIVE_ALERTS } from '../data/mockTransitData';

export function useTransitStream() {
  const [packet, setPacket] = useState<LiveStreamPacket | null>(null);
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [lineStatuses, setLineStatuses] = useState<LineStatus[]>(LINE_STATUSES);
  const [alerts, setAlerts] = useState<TransitAlert[]>(ACTIVE_ALERTS);
  const [arrivals, setArrivals] = useState<Record<string, LiveBusArrival[]>>({});
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [lastStreamTime, setLastStreamTime] = useState<number>(Date.now());
  const [streamCount, setStreamCount] = useState<number>(0);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    function connect() {
      setConnectionStatus('connecting');
      try {
        const es = new EventSource('/api/stream/live-transit');
        eventSourceRef.current = es;

        es.onopen = () => {
          setConnectionStatus('connected');
        };

        es.onmessage = (event) => {
          try {
            const data: LiveStreamPacket = JSON.parse(event.data);
            setPacket(data);
            if (data.vehicles) setVehicles(data.vehicles);
            if (data.lineStatuses) setLineStatuses(data.lineStatuses);
            if (data.alerts) setAlerts(data.alerts);
            if (data.arrivalsSample) setArrivals(data.arrivalsSample);
            setLastStreamTime(Date.now());
            setStreamCount((prev) => prev + 1);
          } catch (err) {
            console.error('Error parsing SSE packet:', err);
          }
        };

        es.onerror = () => {
          setConnectionStatus('disconnected');
          es.close();
          // Retry after 4 seconds
          retryTimeout = setTimeout(connect, 4000);
        };
      } catch (err) {
        setConnectionStatus('disconnected');
        retryTimeout = setTimeout(connect, 4000);
      }
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    connectionStatus,
    packet,
    vehicles,
    lineStatuses,
    alerts,
    arrivals,
    lastStreamTime,
    streamCount,
  };
}
