import React, { useState } from 'react';
import { LineStatus, LiveVehicle, LiveBusArrival, LiveStreamPacket } from '../types';

interface LiveStatusViewProps {
  lineStatuses?: LineStatus[];
  vehicles?: LiveVehicle[];
  arrivals?: Record<string, LiveBusArrival[]>;
  packet?: LiveStreamPacket | null;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
  streamCount?: number;
}

export const LiveStatusView: React.FC<LiveStatusViewProps> = ({
  lineStatuses = [],
  vehicles = [],
  arrivals = {},
  packet,
  connectionStatus = 'connected',
  streamCount = 0,
}) => {
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [busStopSearch, setBusStopSearch] = useState('04111');
  const [activeTab, setActiveTab] = useState<'mrt' | 'bus' | 'vehicles'>('mrt');

  const currentBusArrivals = arrivals[busStopSearch] || arrivals['04111'] || [
    { service: '168', destination: 'Changi Airport PTB3', nextBus: '2 min', nextBusSeconds: 120, nextNextBus: '9 min', nextNextBusSeconds: 540, type: 'Double Deck', crowd: 'Seats Available', wheelchairAccessible: true },
    { service: '858', destination: 'Changi Airport T2/T3', nextBus: '5 min', nextBusSeconds: 300, nextNextBus: '14 min', nextNextBusSeconds: 840, type: 'Single Deck', crowd: 'Standing Available', wheelchairAccessible: true },
    { service: '36', destination: 'Changi Airport T1/T3/T4', nextBus: '8 min', nextBusSeconds: 480, nextNextBus: '16 min', nextNextBusSeconds: 960, type: 'Single Deck', crowd: 'Seats Available', wheelchairAccessible: true },
    { service: '143', destination: 'Jurong East Int', nextBus: '1 min', nextBusSeconds: 60, nextNextBus: '11 min', nextNextBusSeconds: 660, type: 'Double Deck', crowd: 'Seats Available', wheelchairAccessible: true },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-white border border-[#c1c6d3] rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-[#006e2a] animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-[#fa9e0d] animate-ping'
                  : 'bg-[#ba1a1a]'
              }`}
            ></span>
            <h2 className="text-2xl font-bold text-[#1c1b1f]">MRT & Bus Live Network Telemetry</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#414751]">
            <span>Real-time train line frequencies, platform congestion, and live vehicle GPS telemetry.</span>
            <span className="inline-flex items-center gap-1 font-mono px-2 py-0.5 bg-[#f1ecf2] rounded-md text-[11px] text-[#004481] font-semibold">
              <span className="material-symbols-outlined text-[14px]">sensors</span>
              SSE Stream #{streamCount} {connectionStatus === 'connected' ? '• Active (2.0s push)' : '• Reconnecting...'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('mrt')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'mrt'
                ? 'bg-[#004481] text-white'
                : 'bg-[#f1ecf2] text-[#414751] hover:bg-[#e5e1e7]'
            }`}
          >
            Train Network ({lineStatuses.length})
          </button>
          <button
            onClick={() => setActiveTab('bus')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'bus'
                ? 'bg-[#004481] text-white'
                : 'bg-[#f1ecf2] text-[#414751] hover:bg-[#e5e1e7]'
            }`}
          >
            Bus Arrival Radar
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vehicles'
                ? 'bg-[#004481] text-white'
                : 'bg-[#f1ecf2] text-[#414751] hover:bg-[#e5e1e7]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">directions_transit</span>
            Live GPS Vehicles ({vehicles.length})
          </button>
        </div>
      </div>

      {/* MRT Lines View */}
      {activeTab === 'mrt' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lineStatuses.map((line) => {
            const isNormal = line.status === 'Normal Service';

            return (
              <div
                key={line.lineCode}
                onClick={() => setSelectedLine(selectedLine === line.lineCode ? null : line.lineCode)}
                className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-xs ${
                  selectedLine === line.lineCode
                    ? 'border-[#004481] ring-2 ring-[#004481]/20'
                    : 'border-[#c1c6d3] hover:border-[#727783]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="px-3 py-1 rounded-md text-xs font-bold font-mono text-white shadow-xs"
                      style={{ backgroundColor: line.color, color: line.textColor }}
                    >
                      {line.lineCode}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1c1b1f] text-sm">{line.name}</h3>
                      <span className="text-xs text-[#727783]">Frequency: {line.frequency}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isNormal
                        ? 'bg-[#83fc94]/40 text-[#00752d]'
                        : 'bg-[#ffdad6] text-[#93000a]'
                    }`}
                  >
                    {line.status}
                  </span>
                </div>

                {line.delayNotice && (
                  <div className="mt-3 bg-[#ffdad6]/60 border border-[#ffb4ab] rounded-lg p-2 text-xs text-[#93000a]">
                    {line.delayNotice}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-[#f1ecf2] flex justify-between items-center text-[11px] text-[#727783]">
                  <span>Live Updated {line.lastUpdated}</span>
                  <span className="text-[#004481] font-medium flex items-center gap-0.5">
                    {selectedLine === line.lineCode ? 'Hide details' : 'View line map'}
                    <span className="material-symbols-outlined text-[16px]">
                      {selectedLine === line.lineCode ? 'expand_less' : 'chevron_right'}
                    </span>
                  </span>
                </div>

                {selectedLine === line.lineCode && (
                  <div className="mt-3 pt-2 border-t border-[#f1ecf2] text-xs flex flex-col gap-1 text-[#414751]">
                    <div className="font-semibold text-[#1c1b1f]">Key Interchanges:</div>
                    <p className="text-[11px] text-[#727783]">
                      Jurong East, Bishan, City Hall, Raffles Place, Dhoby Ghaut, Marina Bay.
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#006e2a]"></span>
                      <span className="text-[11px]">All platform screen doors operating normally.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bus Arrival Radar View */}
      {activeTab === 'bus' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#c1c6d3] flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="material-symbols-outlined text-[#727783]">directions_bus</span>
              <span className="text-sm font-bold text-[#1c1b1f]">Bus Stop Code:</span>
              <input
                type="text"
                value={busStopSearch}
                onChange={(e) => setBusStopSearch(e.target.value)}
                placeholder="e.g. 04111, 09022"
                className="border border-[#c1c6d3] rounded-lg px-3 py-1 text-sm outline-none focus:border-[#004481]"
              />
            </div>
            <div className="text-xs text-[#727783] w-full sm:w-auto text-right">
              Showing arrivals for <strong className="text-[#1c1b1f]">Opp City Hall Stn ({busStopSearch})</strong> • Live countdown syncing via SSE
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBusArrivals.map((bus) => (
              <div
                key={bus.service}
                className="bg-white border border-[#c1c6d3] rounded-xl p-4 flex justify-between items-center shadow-xs hover:border-[#727783] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#83fc94] text-[#00752d] border border-[#006e2a] rounded-lg font-bold font-mono text-lg flex items-center justify-center">
                    {bus.service}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1c1b1f]">{bus.destination}</h4>
                    <span className="text-xs text-[#727783]">{bus.type} • {bus.crowd}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className={`text-white text-xs font-bold px-2.5 py-1 rounded-md font-mono ${
                    bus.nextBus === 'Arr' ? 'bg-[#006e2a] animate-pulse' : 'bg-[#005baa]'
                  }`}>
                    {bus.nextBus}
                  </div>
                  <span className="text-[11px] text-[#727783] font-mono">
                    Next: {bus.nextNextBus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live GPS Vehicles Stream View */}
      {activeTab === 'vehicles' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#c1c6d3] flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004481]">satellite_alt</span>
              <span className="text-sm font-bold text-[#1c1b1f]">Active Fleet Telemetry Stream:</span>
              <span className="text-xs text-[#727783]">{vehicles.length} active trains & buses reporting live coordinates</span>
            </div>
            <div className="text-xs font-mono text-[#00752d] bg-[#83fc94]/30 px-3 py-1 rounded-md font-semibold">
              Live Coordinate Updates Active (±0.0001° resolution)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white border border-[#c1c6d3] rounded-xl p-4 flex flex-col gap-3 shadow-xs hover:border-[#004481] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-[#f1ecf2] rounded-lg text-[#004481]">
                      <span className="material-symbols-outlined text-[20px]">
                        {v.type === 'train' ? 'train' : 'directions_bus'}
                      </span>
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#1c1b1f]">{v.service}</h4>
                      <span className="text-[11px] text-[#727783] font-mono">ID: {v.id}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    v.crowdLevel === 'Low'
                      ? 'bg-[#83fc94]/40 text-[#00752d]'
                      : v.crowdLevel === 'Moderate'
                      ? 'bg-[#ffca85]/40 text-[#7f5100]'
                      : 'bg-[#ffdad6] text-[#93000a]'
                  }`}>
                    {v.crowdLevel} Load
                  </span>
                </div>

                <div className="bg-[#f7f2f8] p-2.5 rounded-lg text-xs flex flex-col gap-1.5 border border-[#c1c6d3]/60">
                  <div className="flex justify-between items-center">
                    <span className="text-[#727783]">Heading to:</span>
                    <span className="font-bold text-[#1c1b1f]">{v.currentOrNextStop}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#727783]">Destination:</span>
                    <span className="font-semibold text-[#414751]">{v.destination}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-[11px] pt-1 border-t border-[#c1c6d3]/40">
                    <span className="text-[#004481] font-semibold">ETA to Stop: ~{v.etaSecondsToNextStop}s</span>
                    <span className="text-[#727783]">{v.speedKmH} km/h • {v.headingDeg}°</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#727783] font-mono">
                  <span>GPS: {v.lat.toFixed(4)}, {v.lng.toFixed(4)}</span>
                  {v.isElectric && (
                    <span className="text-[#00752d] font-sans font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">bolt</span>
                      Electric Bus
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
