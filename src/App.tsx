/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, TransportMode, ScheduleType, SortOption, RouteOption, SavedRoute } from './types';
import { DEFAULT_ROUTES, SAVED_ROUTES } from './data/mockTransitData';
import { GlobalNotificationBar, GlobalIncident } from './components/GlobalNotificationBar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { TripPlannerPanel } from './components/TripPlannerPanel';
import { SuggestedRoutesList } from './components/SuggestedRoutesList';
import { RouteDetailModal } from './components/RouteDetailModal';
import { LiveStatusView } from './components/LiveStatusView';
import { SavedRoutesView } from './components/SavedRoutesView';
import { AlertsView } from './components/AlertsView';
import { CommunityView } from './components/CommunityView';
import { AppModals } from './components/AppModals';
import { useTransitStream } from './hooks/useTransitStream';
import { useGeolocationTracker } from './hooks/useGeolocationTracker';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  const [origin, setOrigin] = useState<string>('Current Location');
  const [destination, setDestination] = useState<string>('Changi Airport T3');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('depart');
  const [dateString, setDateString] = useState<string>('Today');
  const [timeString, setTimeString] = useState<string>('Now');
  const [transportMode, setTransportMode] = useState<TransportMode>('mixed');
  const [sortBy, setSortBy] = useState<SortOption>('best_match');

  const [routes, setRoutes] = useState<RouteOption[]>(DEFAULT_ROUTES);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>(SAVED_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<GlobalIncident | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  // Modal dialog states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Real-time backend SSE data stream
  const {
    connectionStatus,
    packet,
    vehicles,
    lineStatuses,
    alerts,
    arrivals,
    streamCount,
  } = useTransitStream();

  // High-precision Geolocation tracker & GPS simulator
  const {
    userLocation,
    isLiveGpsActive,
    isSimulating,
    permissionError,
    startLiveGps,
    stopLiveGps,
    toggleSimulation,
    simWaypointName,
  } = useGeolocationTracker();

  // Swap origin and destination
  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Plan Route calculation calling backend API
  const handlePlanRoute = async (overrideOrigin?: string, overrideDest?: string, overrideMode?: TransportMode) => {
    setIsPlanning(true);
    const planOrigin = overrideOrigin || origin;
    const planDest = overrideDest || destination;
    const planMode = overrideMode || transportMode;

    try {
      const res = await fetch('/api/transit/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: planOrigin,
          destination: planDest,
          transportMode: planMode,
          sortBy,
          userLat: userLocation?.lat,
          userLng: userLocation?.lng,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          setRoutes(data.routes);
        } else {
          setRoutes(DEFAULT_ROUTES);
        }
      } else {
        // Fallback filter
        let filtered = [...DEFAULT_ROUTES];
        if (planMode === 'bus_only') {
          filtered = DEFAULT_ROUTES.filter((r) => r.transportType === 'bus_only' || r.segments.some((s) => s.mode === 'bus'));
        } else if (planMode === 'train_only') {
          filtered = DEFAULT_ROUTES.filter((r) => r.transportType === 'train_only' || r.segments.some((s) => s.mode === 'train'));
        }
        setRoutes(filtered);
      }
    } catch (e) {
      console.warn('Backend plan route fallback:', e);
      let filtered = [...DEFAULT_ROUTES];
      if (planMode === 'bus_only') {
        filtered = DEFAULT_ROUTES.filter((r) => r.transportType === 'bus_only' || r.segments.some((s) => s.mode === 'bus'));
      } else if (planMode === 'train_only') {
        filtered = DEFAULT_ROUTES.filter((r) => r.transportType === 'train_only' || r.segments.some((s) => s.mode === 'train'));
      }
      setRoutes(filtered);
    } finally {
      setIsPlanning(false);
    }
  };

  // Initial Route Plan on mount
  useEffect(() => {
    handlePlanRoute();
  }, []);

  // Re-plan when sort by changes
  useEffect(() => {
    if (routes.length > 0) {
      const sorted = [...routes];
      if (sortBy === 'fastest') {
        sorted.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
      } else if (sortBy === 'least_transfers') {
        sorted.sort((a, b) => a.segments.length - b.segments.length);
      } else if (sortBy === 'least_walking') {
        const walkDur = (r: RouteOption) =>
          r.segments.filter((s) => s.mode === 'walk').reduce((acc, s) => acc + s.durationMinutes, 0);
        sorted.sort((a, b) => walkDur(a) - walkDur(b));
      }
      setRoutes(sorted);
    }
  }, [sortBy]);

  // Toggle Save Route
  const handleSaveRoute = (route: RouteOption) => {
    const existing = savedRoutes.find((s) => s.id === `sav-${route.id}`);
    if (existing) {
      setSavedRoutes((prev) => prev.filter((s) => s.id !== existing.id));
    } else {
      const newSaved: SavedRoute = {
        id: `sav-${route.id}`,
        title: `${origin} → ${destination}`,
        origin,
        destination,
        preferredMode: transportMode,
        usualDuration: `${route.totalDurationMinutes} mins`,
        tags: ['Custom Commute'],
      };
      setSavedRoutes((prev) => [newSaved, ...prev]);
    }
  };

  const handlePlanSavedRoute = (from: string, to: string, mode: TransportMode) => {
    setOrigin(from);
    setDestination(to);
    setTransportMode(mode);
    setActiveTab('plan');
    handlePlanRoute(from, to, mode);
  };

  const handleDeleteSavedRoute = (id: string) => {
    setSavedRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddCustomSave = () => {
    const newSaved: SavedRoute = {
      id: `sav-${Date.now()}`,
      title: `${origin} → ${destination}`,
      origin,
      destination,
      preferredMode: transportMode,
      usualDuration: '45 mins',
      tags: ['Personal'],
    };
    setSavedRoutes((prev) => [newSaved, ...prev]);
  };

  const unreadAlertsCount = alerts.filter((a) => a.type === 'warning' || a.type === 'critical').length;

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf8fd] text-[#1c1b1f] font-sans antialiased">
      {/* Persistent Global Disruption & Weather Notification Bar */}
      <GlobalNotificationBar
        onOpenAlertsTab={() => setActiveTab('alerts')}
        onOpenIncidentDetail={(incident) => setSelectedIncident(incident)}
      />

      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAccount={() => setShowAccountModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        unreadAlertsCount={unreadAlertsCount}
        connectionStatus={connectionStatus}
        isGpsActive={isLiveGpsActive || isSimulating}
      />

      {/* Main Body View Switching */}
      <main className="flex-grow flex flex-col w-full overflow-hidden pb-16 md:pb-0">
        {activeTab === 'plan' && (
          <div className="flex-grow flex flex-col md:flex-row w-full max-w-[1440px] mx-auto overflow-hidden">
            {/* Left Panel: Search & Filters */}
            <TripPlannerPanel
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onSwapLocations={handleSwapLocations}
              scheduleType={scheduleType}
              onScheduleTypeChange={setScheduleType}
              dateString={dateString}
              timeString={timeString}
              onDateTimeChange={(date, time) => {
                setDateString(date);
                setTimeString(time);
              }}
              transportMode={transportMode}
              onTransportModeChange={(mode) => {
                setTransportMode(mode);
                handlePlanRoute(origin, destination, mode);
              }}
              onPlanRoute={() => handlePlanRoute()}
              isPlanning={isPlanning}
              userLocation={userLocation}
              isLiveGpsActive={isLiveGpsActive}
              isSimulating={isSimulating}
              simWaypointName={simWaypointName}
              permissionError={permissionError}
              onStartLiveGps={startLiveGps}
              onStopLiveGps={stopLiveGps}
              onToggleSimulation={toggleSimulation}
            />

            {/* Right Panel: Suggested Routes Results */}
            <SuggestedRoutesList
              routes={routes}
              onSelectRoute={(route) => setSelectedRoute(route)}
              origin={origin}
              destination={destination}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        )}

        {activeTab === 'live_status' && (
          <LiveStatusView
            lineStatuses={lineStatuses}
            vehicles={vehicles}
            arrivals={arrivals}
            packet={packet}
            connectionStatus={connectionStatus}
            streamCount={streamCount}
          />
        )}

        {activeTab === 'saved' && (
          <SavedRoutesView
            savedRoutes={savedRoutes}
            onPlanSavedRoute={handlePlanSavedRoute}
            onDeleteSavedRoute={handleDeleteSavedRoute}
            onAddCustomSave={handleAddCustomSave}
          />
        )}

        {activeTab === 'alerts' && <AlertsView alerts={alerts} />}

        {activeTab === 'community' && <CommunityView />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Route Detail & Turn-by-turn Navigation Drawer / Modal */}
      {selectedRoute && (
        <RouteDetailModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
          onSaveRoute={handleSaveRoute}
          isSaved={savedRoutes.some((s) => s.id === `sav-${selectedRoute.id}`)}
        />
      )}

      {/* Incident Detail Advisory Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#c1c6d3] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-[#c1c6d3] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#ffdad6] text-[#ba1a1a] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">warning</span>
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a]">
                    Disruption & Operations Advisory
                  </span>
                  <h3 className="font-bold text-base text-[#1c1b1f] leading-snug">
                    {selectedIncident.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-[#727783] hover:text-[#1c1b1f] p-1 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-[#f7f2f8] p-4 rounded-xl border border-[#c1c6d3] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-[#414751]">
                <span className="font-semibold">Corridor: {selectedIncident.affectedCorridor}</span>
                <span className="font-mono text-[11px]">{selectedIncident.time}</span>
              </div>
              <p className="text-sm text-[#1c1b1f] leading-relaxed">
                {selectedIncident.detail}
              </p>
              <div className="mt-1 inline-flex items-center gap-1.5 self-start px-2.5 py-1 bg-[#83fc94]/30 text-[#00752d] rounded-md text-xs font-bold font-mono">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Impact Status: {selectedIncident.impactBadge}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 text-xs font-bold text-[#414751] hover:bg-[#f1ecf2] rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedIncident(null);
                  setActiveTab('alerts');
                }}
                className="px-4 py-2 text-xs font-bold bg-[#004481] hover:bg-[#005baa] text-white rounded-xl flex items-center gap-1 cursor-pointer"
              >
                Open Full Operations Center
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account, Settings, Help Modals */}
      <AppModals
        showAccount={showAccountModal}
        showSettings={showSettingsModal}
        showHelp={showHelpModal}
        onClose={() => {
          setShowAccountModal(false);
          setShowSettingsModal(false);
          setShowHelpModal(false);
        }}
      />
    </div>
  );
}
