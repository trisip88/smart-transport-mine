import React, { useState, useRef, useEffect } from 'react';
import { TransportMode, ScheduleType, PlaceItem, UserGeolocation } from '../types';
import { POPULAR_PLACES } from '../data/mockTransitData';

interface TripPlannerPanelProps {
  origin: string;
  destination: string;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSwapLocations: () => void;
  scheduleType: ScheduleType;
  onScheduleTypeChange: (type: ScheduleType) => void;
  dateString: string;
  timeString: string;
  onDateTimeChange: (date: string, time: string) => void;
  transportMode: TransportMode;
  onTransportModeChange: (mode: TransportMode) => void;
  onPlanRoute: () => void;
  isPlanning: boolean;
  userLocation?: UserGeolocation;
  isLiveGpsActive?: boolean;
  isSimulating?: boolean;
  simWaypointName?: string;
  permissionError?: string | null;
  onStartLiveGps?: () => void;
  onStopLiveGps?: () => void;
  onToggleSimulation?: () => void;
}

export const TripPlannerPanel: React.FC<TripPlannerPanelProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwapLocations,
  scheduleType,
  onScheduleTypeChange,
  dateString,
  timeString,
  onDateTimeChange,
  transportMode,
  onTransportModeChange,
  onPlanRoute,
  isPlanning,
  userLocation,
  isLiveGpsActive = false,
  isSimulating = false,
  simWaypointName,
  permissionError,
  onStartLiveGps,
  onStopLiveGps,
  onToggleSimulation,
}) => {
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState<'sunny' | 'rain'>('sunny');
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);
  const [showGpsDetails, setShowGpsDetails] = useState(false);

  // Live OneMap Search Results state
  const [liveOriginResults, setLiveOriginResults] = useState<PlaceItem[]>([]);
  const [liveDestResults, setLiveDestResults] = useState<PlaceItem[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#origin-container')) setShowOriginDropdown(false);
      if (!target.closest('#dest-container')) setShowDestDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced OneMap search for Origin
  useEffect(() => {
    if (!origin || origin.length < 2 || origin.toLowerCase().includes('current')) {
      setLiveOriginResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingOrigin(true);
      try {
        const res = await fetch(`/api/onemap/search?searchVal=${encodeURIComponent(origin)}&pageNum=1`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const places: PlaceItem[] = data.results.slice(0, 6).map((r: any, idx: number) => ({
              id: `onemap-orig-${idx}`,
              name: r.BUILDING && r.BUILDING !== 'NIL' ? r.BUILDING : r.SEARCHVAL || r.ROAD_NAME,
              address: r.ADDRESS || r.ROAD_NAME || 'Singapore',
              code: r.POSTAL && r.POSTAL !== 'NIL' ? r.POSTAL : undefined,
              category: 'station',
            }));
            setLiveOriginResults(places);
          }
        }
      } catch (e) {
        // Fallback silently to static list
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [origin]);

  // Debounced OneMap search for Destination
  useEffect(() => {
    if (!destination || destination.length < 2) {
      setLiveDestResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const res = await fetch(`/api/onemap/search?searchVal=${encodeURIComponent(destination)}&pageNum=1`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const places: PlaceItem[] = data.results.slice(0, 6).map((r: any, idx: number) => ({
              id: `onemap-dest-${idx}`,
              name: r.BUILDING && r.BUILDING !== 'NIL' ? r.BUILDING : r.SEARCHVAL || r.ROAD_NAME,
              address: r.ADDRESS || r.ROAD_NAME || 'Singapore',
              code: r.POSTAL && r.POSTAL !== 'NIL' ? r.POSTAL : undefined,
              category: 'landmark',
            }));
            setLiveDestResults(places);
          }
        }
      } catch (e) {
        // Fallback silently to static list
      } finally {
        setIsSearchingDest(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destination]);

  const filteredOriginPlaces = liveOriginResults.length > 0
    ? liveOriginResults
    : POPULAR_PLACES.filter((p) =>
        p.name.toLowerCase().includes(origin.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(origin.toLowerCase()))
      );

  const filteredDestPlaces = liveDestResults.length > 0
    ? liveDestResults
    : POPULAR_PLACES.filter((p) =>
        p.name.toLowerCase().includes(destination.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(destination.toLowerCase()))
      );

  const handleSnapGpsToOrigin = () => {
    if (userLocation?.formattedAddress) {
      onOriginChange(userLocation.formattedAddress);
    } else {
      onOriginChange('Current Location');
    }
  };

  return (
    <aside className="w-full md:w-4/12 bg-[#f7f2f8] p-4 md:p-6 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-[#c1c6d3] overflow-y-auto shrink-0 select-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-[30px] font-bold text-[#1c1b1f] tracking-tight leading-tight">
          Trip Planner
        </h1>
        <button
          onClick={() => setShowGpsDetails(!showGpsDetails)}
          title="Geolocation Tracking Telemetry"
          className="text-xs font-mono px-2.5 py-1 rounded-md bg-white border border-[#c1c6d3] text-[#004481] hover:bg-[#e5e1e7] flex items-center gap-1 cursor-pointer"
        >
          <span className={`material-symbols-outlined text-[14px] ${isLiveGpsActive || isSimulating ? 'text-[#00752d] animate-pulse' : ''}`}>
            location_searching
          </span>
          GPS Tracker
        </button>
      </div>

      {/* Geolocation Telemetry Pill */}
      {showGpsDetails && userLocation && (
        <div className="bg-white border border-[#004481]/30 rounded-xl p-3.5 shadow-xs flex flex-col gap-2.5 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#1c1b1f]">
              <span className="w-2 h-2 rounded-full bg-[#006e2a] animate-pulse"></span>
              Live Geolocation Engine
            </div>
            <span className="font-mono text-[10px] text-[#727783]">±{userLocation.accuracy}m Accuracy</span>
          </div>

          <div className="bg-[#f7f2f8] p-2 rounded-lg font-mono text-[11px] flex flex-col gap-1 text-[#414751]">
            <div className="flex justify-between">
              <span>Coordinates:</span>
              <span className="font-bold text-[#1c1b1f]">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Speed / Heading:</span>
              <span>{userLocation.speed || 0} km/h • {userLocation.heading || 0}°</span>
            </div>
            {userLocation.nearestStation && (
              <div className="flex justify-between text-[#004481] font-semibold pt-1 border-t border-[#c1c6d3]/40">
                <span>Nearest Hub:</span>
                <span>{userLocation.nearestStation.name} ({userLocation.nearestStation.distanceMeters}m)</span>
              </div>
            )}
          </div>

          {permissionError && (
            <div className="text-[11px] text-[#ba1a1a] bg-[#ffdad6] p-1.5 rounded">
              {permissionError}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={isLiveGpsActive ? onStopLiveGps : onStartLiveGps}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                isLiveGpsActive ? 'bg-[#006e2a] text-white' : 'bg-[#f1ecf2] text-[#414751] hover:bg-[#e5e1e7]'
              }`}
            >
              {isLiveGpsActive ? 'Stop Live GPS' : 'Enable Device GPS'}
            </button>
            <button
              onClick={onToggleSimulation}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                isSimulating ? 'bg-[#004481] text-white' : 'bg-[#f1ecf2] text-[#414751] hover:bg-[#e5e1e7]'
              }`}
            >
              {isSimulating ? `Simulating (${simWaypointName || 'Moving'})` : 'Simulate Commute GPS'}
            </button>
            <button
              onClick={handleSnapGpsToOrigin}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-[#e5e1e7] text-[#1c1b1f] hover:bg-[#c1c6d3] cursor-pointer"
            >
              Set as Origin
            </button>
          </div>
        </div>
      )}

      {/* Origin & Destination Inputs with Connector */}
      <div className="flex flex-col gap-2 relative">
        <div className="absolute left-[18px] top-[30px] bottom-[30px] w-px bg-[#c1c6d3] z-0"></div>

        {/* Origin Container */}
        <div id="origin-container" className="relative z-10">
          <div className="flex items-center gap-2 bg-[#fdf8fd] border border-[#c1c6d3] rounded-lg p-2 focus-within:border-[#004481] focus-within:ring-1 focus-within:ring-[#004481] transition-all">
            <button
              type="button"
              onClick={handleSnapGpsToOrigin}
              title="Snap to Current Geolocation"
              className="text-[#727783] hover:text-[#004481] ml-1 p-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">
                my_location
              </span>
            </button>
            <input
              ref={originInputRef}
              className="flex-grow bg-transparent border-none outline-none text-[15px] text-[#1c1b1f] focus:ring-0 p-1 placeholder:text-[#727783]"
              placeholder="Origin or current location"
              type="text"
              value={origin}
              onChange={(e) => {
                onOriginChange(e.target.value);
                setShowOriginDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowOriginDropdown(false);
                  onPlanRoute();
                }
              }}
              onFocus={() => setShowOriginDropdown(true)}
            />
            {origin && (
              <button
                type="button"
                onClick={() => {
                  onOriginChange('');
                  originInputRef.current?.focus();
                }}
                className="text-[#727783] hover:text-[#1c1b1f] p-1 cursor-pointer"
                title="Clear origin"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Origin Autocomplete Dropdown */}
          {showOriginDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#c1c6d3] rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold text-[#727783] uppercase tracking-wider bg-[#f1ecf2] flex justify-between items-center">
                <span>Suggested Locations</span>
                <span className="text-[10px] font-mono text-[#004481]">Live GPS ready</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleSnapGpsToOrigin();
                  setShowOriginDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#f1ecf2] flex items-center gap-2 border-b border-[#f1ecf2] text-[#004481] font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">near_me</span>
                Use Current GPS Location ({userLocation?.formattedAddress || 'Nearby'})
              </button>
              {filteredOriginPlaces.length > 0 ? (
                filteredOriginPlaces.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => {
                      onOriginChange(place.name);
                      setShowOriginDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#f1ecf2] flex items-center justify-between border-b border-[#f1ecf2] last:border-0 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-[#1c1b1f]">{place.name}</span>
                      <span className="block text-xs text-[#414751]">{place.address}</span>
                    </div>
                    {place.code && (
                      <span className="text-[11px] font-mono bg-[#e5e1e7] text-[#414751] px-1.5 py-0.5 rounded">
                        {place.code}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-[#727783]">No places found. Press enter to use custom input.</div>
              )}
            </div>
          )}
        </div>

        {/* Destination Container */}
        <div id="dest-container" className="relative z-10 mt-1">
          <div className="flex items-center gap-2 bg-[#fdf8fd] border border-[#c1c6d3] rounded-lg p-2 focus-within:border-[#004481] focus-within:ring-1 focus-within:ring-[#004481] transition-all">
            <span 
              className="material-symbols-outlined text-[#ba1a1a] ml-1 text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
            <input
              ref={destInputRef}
              className="flex-grow bg-transparent border-none outline-none text-[15px] text-[#1c1b1f] focus:ring-0 p-1 placeholder:text-[#727783]"
              placeholder="Destination (e.g. Changi Airport T3)"
              type="text"
              value={destination}
              onChange={(e) => {
                onDestinationChange(e.target.value);
                setShowDestDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowDestDropdown(false);
                  onPlanRoute();
                }
              }}
              onFocus={() => setShowDestDropdown(true)}
            />
            {destination && (
              <button
                type="button"
                onClick={() => {
                  onDestinationChange('');
                  destInputRef.current?.focus();
                }}
                className="text-[#727783] hover:text-[#1c1b1f] p-1 cursor-pointer"
                title="Clear destination"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Destination Autocomplete Dropdown */}
          {showDestDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#c1c6d3] rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold text-[#727783] uppercase tracking-wider bg-[#f1ecf2]">
                Popular Destinations
              </div>
              {filteredDestPlaces.length > 0 ? (
                filteredDestPlaces.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => {
                      onDestinationChange(place.name);
                      setShowDestDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#f1ecf2] flex items-center justify-between border-b border-[#f1ecf2] last:border-0 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-[#1c1b1f]">{place.name}</span>
                      <span className="block text-xs text-[#414751]">{place.address}</span>
                    </div>
                    {place.code && (
                      <span className="text-[11px] font-mono bg-[#e5e1e7] text-[#414751] px-1.5 py-0.5 rounded">
                        {place.code}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-[#727783]">No places found. Press enter to use custom input.</div>
              )}
            </div>
          )}
        </div>

        {/* Swap Button Floating Center Right */}
        <button
          type="button"
          onClick={onSwapLocations}
          title="Swap locations"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white border border-[#c1c6d3] text-[#414751] hover:text-[#004481] hover:border-[#004481] p-1.5 rounded-full shadow-xs transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">swap_vert</span>
        </button>
      </div>

      {/* Quick Destination Pills */}
      <div className="flex flex-wrap items-center gap-1.5 -mt-2">
        <span className="text-[11px] font-medium text-[#727783] mr-0.5">Quick:</span>
        {['Changi Airport T3', 'Marina Bay Sands', 'Orchard', 'Jurong East', 'Tampines'].map((destName) => (
          <button
            key={destName}
            type="button"
            onClick={() => {
              onDestinationChange(destName);
            }}
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
              destination === destName
                ? 'bg-[#004481] text-white border-[#004481]'
                : 'bg-white text-[#414751] border-[#c1c6d3] hover:border-[#727783] hover:bg-[#f1ecf2]'
            }`}
          >
            {destName.replace(' Terminal 3', ' T3')}
          </button>
        ))}
      </div>

      {/* Schedule & Timing Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#414751] uppercase tracking-wider">
          Schedule & Departure
        </label>
        <div className="flex gap-2">
          <div className="flex bg-[#f1ecf2] p-1 rounded-lg border border-[#c1c6d3] w-1/2">
            <button
              type="button"
              onClick={() => onScheduleTypeChange('depart')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                scheduleType === 'depart'
                  ? 'bg-white text-[#1c1b1f] shadow-xs'
                  : 'text-[#414751] hover:text-[#1c1b1f]'
              }`}
            >
              Depart at
            </button>
            <button
              type="button"
              onClick={() => onScheduleTypeChange('arrive')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                scheduleType === 'arrive'
                  ? 'bg-white text-[#1c1b1f] shadow-xs'
                  : 'text-[#414751] hover:text-[#1c1b1f]'
              }`}
            >
              Arrive by
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="flex-1 bg-white border border-[#c1c6d3] rounded-lg px-3 py-1.5 text-xs font-medium text-[#1c1b1f] flex items-center justify-between hover:border-[#727783] cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#727783] text-[16px]">schedule</span>
              {dateString}, {timeString}
            </span>
            <span className="material-symbols-outlined text-[#727783] text-[16px]">expand_more</span>
          </button>
        </div>
      </div>

      {/* Mode Filters */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#414751] uppercase tracking-wider">
          Transport Preference
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onTransportModeChange('mixed')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              transportMode === 'mixed'
                ? 'bg-[#005baa] text-white shadow-sm'
                : 'bg-white border border-[#c1c6d3] text-[#414751] hover:bg-[#e5e1e7]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">directions_transit</span>
            Mixed (All)
          </button>

          <button
            type="button"
            onClick={() => onTransportModeChange('bus_only')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              transportMode === 'bus_only'
                ? 'bg-[#005baa] text-white shadow-sm'
                : 'bg-white border border-[#c1c6d3] text-[#414751] hover:bg-[#e5e1e7]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">directions_bus</span>
            Bus Only
          </button>

          <button
            type="button"
            onClick={() => onTransportModeChange('train_only')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              transportMode === 'train_only'
                ? 'bg-[#005baa] text-white shadow-sm'
                : 'bg-white border border-[#c1c6d3] text-[#414751] hover:bg-[#e5e1e7]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">train</span>
            Train Only
          </button>
        </div>
      </div>

      {/* Plan Route CTA Button */}
      <button
        type="button"
        onClick={onPlanRoute}
        disabled={isPlanning}
        id="plan-route-cta"
        className="w-full bg-[#004481] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#005baa] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75"
      >
        {isPlanning ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Calculating Optimal Routes...
          </>
        ) : (
          'Plan Route'
        )}
      </button>

      {/* Weather Widget */}
      <div 
        onClick={() => setShowWeatherDetail(!showWeatherDetail)}
        className="bg-white border border-[#c1c6d3] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-[#727783] transition-all shadow-xs"
      >
        <div className="flex items-center gap-3">
          <span 
            className="material-symbols-outlined text-[#5f3c00] text-[26px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {weatherCondition === 'sunny' ? 'partly_cloudy_day' : 'rainy'}
          </span>
          <div>
            <div className="text-xs font-semibold text-[#1c1b1f] flex items-center gap-1.5">
              {weatherCondition === 'sunny' ? 'Mostly Sunny' : 'Passing Showers'}
              <span className="text-[10px] text-[#006e2a] font-normal underline">Tap info</span>
            </div>
            <div className="text-xs text-[#414751]">
              {weatherCondition === 'sunny' ? 'Optimal travel conditions' : 'Sheltered MRT walkways recommended'}
            </div>
          </div>
        </div>
        <div className="text-lg font-bold text-[#1c1b1f]">
          {weatherCondition === 'sunny' ? '31°' : '27°'}
        </div>
      </div>

      {/* Weather forecast modal / details */}
      {showWeatherDetail && (
        <div className="bg-[#f1ecf2] border border-[#c1c6d3] rounded-lg p-3 text-xs flex flex-col gap-2">
          <div className="flex justify-between items-center font-bold text-[#1c1b1f]">
            <span>Live Weather & Transit Impact</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setWeatherCondition(weatherCondition === 'sunny' ? 'rain' : 'sunny');
              }}
              className="text-[11px] bg-white border border-[#c1c6d3] px-2 py-0.5 rounded text-[#004481] hover:bg-[#e5e1e7]"
            >
              Simulate {weatherCondition === 'sunny' ? 'Rain' : 'Sunny'}
            </button>
          </div>
          <p className="text-[#414751]">
            {weatherCondition === 'sunny'
              ? 'Clear visibility across expressway bus corridors (PIE/TPE). SMRT trains operating at peak timetable frequency.'
              : 'Wet platform protocols active. Free umbrella sharing lockers available at Bishan, Jurong East, and Changi Airport.'}
          </p>
        </div>
      )}

      {/* Schedule Picker Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-[#c1c6d3] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#c1c6d3] pb-3">
              <h3 className="font-bold text-[#1c1b1f] text-base">Select Departure Time</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-[#727783] hover:text-[#1c1b1f]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-[#414751]">Quick Time Shortcuts</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Now', time: 'Now', date: 'Today' },
                  { label: '+15 min', time: '10:30 AM', date: 'Today' },
                  { label: '+30 min', time: '10:45 AM', date: 'Today' },
                  { label: '12:00 PM', time: '12:00 PM', date: 'Today' },
                  { label: '5:30 PM', time: '5:30 PM', date: 'Today' },
                  { label: 'Tomorrow', time: '08:30 AM', date: 'Tomorrow' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onDateTimeChange(item.date, item.time);
                      setShowScheduleModal(false);
                    }}
                    className="p-2 text-xs font-medium border border-[#c1c6d3] rounded-lg hover:border-[#004481] hover:bg-[#d5e3ff]/30 text-center transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="w-full bg-[#004481] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#005baa]"
            >
              Apply Schedule
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
