import { useState, useEffect, useRef, useCallback } from 'react';
import { UserGeolocation } from '../types';

// Pre-defined GPS simulation waypoints across Singapore MRT / Road corridor
const SIMULATION_WAYPOINTS = [
  { lat: 1.3040, lng: 103.8318, name: 'Orchard MRT', speed: 25, heading: 120 },
  { lat: 1.3003, lng: 103.8390, name: 'Somerset MRT', speed: 45, heading: 125 },
  { lat: 1.2989, lng: 103.8456, name: 'Dhoby Ghaut MRT', speed: 52, heading: 110 },
  { lat: 1.2931, lng: 103.8522, name: 'City Hall MRT', speed: 48, heading: 90 },
  { lat: 1.3008, lng: 103.8560, name: 'Bugis MRT', speed: 50, heading: 70 },
  { lat: 1.3182, lng: 103.8931, name: 'Paya Lebar Interchange', speed: 65, heading: 85 },
  { lat: 1.3331, lng: 103.9380, name: 'Bedok MRT', speed: 60, heading: 80 },
  { lat: 1.3573, lng: 103.9885, name: 'Changi Airport Station', speed: 15, heading: 95 },
];

export function useGeolocationTracker() {
  const [userLocation, setUserLocation] = useState<UserGeolocation>({
    lat: 1.3040,
    lng: 103.8318,
    accuracy: 12,
    heading: 120,
    speed: 0,
    timestamp: Date.now(),
    formattedAddress: 'Near Orchard MRT (NS22/TE14)',
    nearestStation: {
      name: 'Orchard MRT Station',
      code: 'NS22/TE14',
      distanceMeters: 25,
      walkingMinutes: 1,
    },
  });

  const [isLiveGpsActive, setIsLiveGpsActive] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simWaypointIndex, setSimWaypointIndex] = useState<number>(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reverse geocode & find nearest stop from backend
  const resolveLocationDetails = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/geolocation/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserLocation((prev) => ({
          ...prev,
          lat,
          lng,
          formattedAddress: data.formattedAddress,
          nearestStation: data.nearestStation,
        }));
      }
    } catch (e) {
      console.warn('Geolocation reverse geocode failed:', e);
    }
  }, []);

  // Real GPS tracking via navigator.geolocation
  const startLiveGps = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setPermissionError('Geolocation is not supported by your browser.');
      return;
    }

    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      setIsSimulating(false);
    }

    setPermissionError(null);
    setIsLiveGpsActive(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, heading, speed } = pos.coords;
        const speedKmH = speed ? Math.round(speed * 3.6) : 0;
        setUserLocation((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          heading: heading || prev.heading,
          speed: speedKmH,
          timestamp: pos.timestamp,
        }));
        resolveLocationDetails(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
        setPermissionError(err.message);
        setIsLiveGpsActive(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      }
    );
  }, [resolveLocationDetails]);

  const stopLiveGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveGpsActive(false);
  }, []);

  // GPS Route Simulator for preview & testing
  const toggleSimulation = useCallback(() => {
    if (isSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulating(false);
    } else {
      stopLiveGps();
      setIsSimulating(true);
      setPermissionError(null);

      simIntervalRef.current = setInterval(() => {
        setSimWaypointIndex((prevIdx) => {
          const nextIdx = (prevIdx + 1) % SIMULATION_WAYPOINTS.length;
          const point = SIMULATION_WAYPOINTS[nextIdx];
          
          setUserLocation({
            lat: point.lat,
            lng: point.lng,
            accuracy: 8,
            heading: point.heading,
            speed: point.speed,
            timestamp: Date.now(),
            formattedAddress: `Simulated at ${point.name}`,
            nearestStation: {
              name: point.name,
              distanceMeters: 15,
              walkingMinutes: 1,
            },
          });
          return nextIdx;
        });
      }, 3000);
    }
  }, [isSimulating, stopLiveGps]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  return {
    userLocation,
    isLiveGpsActive,
    isSimulating,
    permissionError,
    startLiveGps,
    stopLiveGps,
    toggleSimulation,
    simWaypointName: SIMULATION_WAYPOINTS[simWaypointIndex]?.name,
  };
}
