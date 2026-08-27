import React, { useState } from 'react';
import { RouteOption, SortOption } from '../types';

interface SuggestedRoutesListProps {
  routes: RouteOption[];
  onSelectRoute: (route: RouteOption) => void;
  origin: string;
  destination: string;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
  isPlanning?: boolean;
  onRefresh?: () => void;
}

export const SuggestedRoutesList: React.FC<SuggestedRoutesListProps> = ({
  routes,
  onSelectRoute,
  origin,
  destination,
  sortBy,
  onSortChange,
  isPlanning = false,
  onRefresh,
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortLabels: Record<SortOption, string> = {
    best_match: 'Best Match',
    fastest: 'Fastest Route',
    least_transfers: 'Least Transfers',
    least_walking: 'Least Walking',
  };

  const sortedRoutes = [...routes].sort((a, b) => {
    if (sortBy === 'fastest') return a.totalDurationMinutes - b.totalDurationMinutes;
    if (sortBy === 'least_transfers') return a.segments.length - b.segments.length;
    if (sortBy === 'least_walking') {
      const walkA = a.segments.filter((s) => s.mode === 'walk').reduce((acc, s) => acc + s.durationMinutes, 0);
      const walkB = b.segments.filter((s) => s.mode === 'walk').reduce((acc, s) => acc + s.durationMinutes, 0);
      return walkA - walkB;
    }
    return (b.isOptimal ? 1 : 0) - (a.isOptimal ? 1 : 0);
  });

  return (
    <section className="w-full md:w-8/12 bg-[#fdf8fd] p-4 md:p-6 overflow-y-auto flex flex-col gap-3">
      {/* Header with Sort Selector */}
      <div className="flex justify-between items-end mb-2 relative">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1c1b1f] tracking-tight">
            Suggested Routes
          </h2>
          <p className="text-xs text-[#727783] mt-0.5">
            Real-time live departures from <span className="text-[#1c1b1f] font-medium">{origin}</span> to <span className="text-[#1c1b1f] font-medium">{destination}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isPlanning}
              title="Refresh routes"
              className="p-1.5 rounded-lg border border-[#c1c6d3] bg-white text-[#414751] hover:text-[#004481] hover:border-[#004481] transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${isPlanning ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}

          <div className="relative">
            <span className="text-sm text-[#727783]">
              Sorted by:{' '}
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="text-[#1c1b1f] font-semibold cursor-pointer hover:text-[#004481] inline-flex items-center gap-0.5"
              >
                {sortLabels[sortBy]}
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </span>

            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#c1c6d3] rounded-lg shadow-xl py-1 z-30 min-w-[160px] animate-in fade-in zoom-in-95 duration-100">
                {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      onSortChange(key);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#f1ecf2] transition-colors ${
                      sortBy === key ? 'text-[#004481] bg-[#d5e3ff]/30 font-bold' : 'text-[#1c1b1f]'
                    }`}
                  >
                    {sortLabels[key]}
                    {sortBy === key && (
                      <span className="material-symbols-outlined text-[16px] text-[#004481]">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isPlanning && (
        <div className="flex flex-col gap-3 py-2 animate-in fade-in duration-200">
          {[1, 2, 3].map((skeletonId) => (
            <div
              key={`skeleton-${skeletonId}`}
              className="bg-white rounded-xl p-5 border border-[#c1c6d3]/60 flex flex-col gap-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-7 bg-slate-200 rounded w-28"></div>
                <div className="h-5 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-slate-200 rounded-md w-20"></div>
                <div className="h-6 bg-slate-200 rounded-md w-24"></div>
                <div className="h-6 bg-slate-200 rounded-md w-20"></div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-48 mt-1"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isPlanning && sortedRoutes.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-[#c1c6d3] text-center flex flex-col items-center gap-3 my-4 shadow-xs">
          <span className="p-3 bg-[#f1ecf2] text-[#414751] rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">directions</span>
          </span>
          <div>
            <h3 className="font-bold text-base text-[#1c1b1f]">No Routes Found</h3>
            <p className="text-xs text-[#727783] mt-1 max-w-sm">
              We couldn't compute a direct itinerary between &quot;{origin}&quot; and &quot;{destination}&quot;. Try selecting another station or resetting preferences.
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-2 px-4 py-2 bg-[#004481] text-white text-xs font-semibold rounded-lg hover:bg-[#005baa] transition-colors cursor-pointer"
            >
              Recalculate Routes
            </button>
          )}
        </div>
      )}

      {/* Routes List */}
      {!isPlanning && sortedRoutes.length > 0 && (
        <div className="flex flex-col gap-4">
        {sortedRoutes.map((route) => {
          const isOptimal = route.isOptimal;

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              id={`route-card-${route.id}`}
              className={`bg-white rounded-xl p-4 relative overflow-hidden flex flex-col gap-3 cursor-pointer transition-all border ${
                isOptimal
                  ? 'border-[#004481] shadow-[0_4px_12px_rgba(0,68,129,0.1)] hover:shadow-[0_6px_18px_rgba(0,68,129,0.18)] ring-1 ring-[#004481]/20'
                  : 'border-[#c1c6d3] hover:border-[#727783] hover:bg-[#f7f2f8] shadow-xs'
              }`}
            >
              {/* Left Color Bar */}
              <div
                className={`absolute top-0 left-0 w-2 h-full ${
                  isOptimal ? 'bg-[#004481]' : 'bg-[#006e2a]'
                }`}
              />

              {/* Optimal / Badge at top right */}
              {isOptimal && (
                <div className="absolute top-0 right-0 bg-[#005baa] text-[#bbd4ff] text-[10px] font-bold px-2 py-1 rounded-bl-lg tracking-wide uppercase">
                  Most Optimal
                </div>
              )}

              {/* Top Row: Arrival Time & Status */}
              <div className="flex justify-between items-start pl-2">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold tracking-tight text-[#1c1b1f] leading-none">
                    {route.totalDurationMinutes}
                    <span className="text-xl font-semibold text-[#414751] ml-1">min</span>
                  </span>
                  <span className="text-sm text-[#414751] mt-1.5 font-normal">
                    {route.departureTime} — {route.arrivalTime}
                  </span>
                </div>

                <div className="text-right flex flex-col items-end">
                  {route.status === 'On Time' ? (
                    <span className="text-xs font-semibold text-[#006e2a] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#006e2a] animate-pulse"></span>
                      On Time
                    </span>
                  ) : (
                    <div className="bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 border border-[#ffb4ab]">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Minor Delay
                    </div>
                  )}
                  <div className="flex items-baseline gap-1 mt-1.5 bg-[#f1ecf2] px-2.5 py-1 rounded-lg border border-[#c1c6d3]">
                    <span className="text-xs font-medium text-[#727783]">Fare</span>
                    <span className="text-lg md:text-xl font-extrabold text-[#004481] font-mono tracking-tight tabular-nums">
                      {route.fare}
                    </span>
                  </div>
                </div>
              </div>

              {/* Segment Chips Row */}
              <div className="flex items-center gap-2 pl-2 overflow-x-auto pb-1 no-scrollbar">
                {route.segments.map((seg, idx) => (
                  <React.Fragment key={seg.id || idx}>
                    {/* Walk Segment */}
                    {seg.mode === 'walk' && (
                      <div className="flex items-center gap-1 bg-[#f1ecf2] px-2 py-1 rounded-md border border-[#c1c6d3] shrink-0">
                        <span className="material-symbols-outlined text-[16px] text-[#414751]">
                          directions_walk
                        </span>
                        <span className="text-[13px] font-semibold text-[#414751] font-mono">
                          {seg.label}
                        </span>
                      </div>
                    )}

                    {/* Train Segment */}
                    {seg.mode === 'train' && (
                      <div
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md border shrink-0 font-bold"
                        style={{
                          backgroundColor: seg.colorBg || '#FDECE8',
                          borderColor: seg.colorBorder || '#F4A261',
                          color: seg.colorText || '#E76F51',
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">train</span>
                        <span className="text-[13px] font-mono">{seg.label}</span>
                      </div>
                    )}

                    {/* Bus Segment */}
                    {seg.mode === 'bus' && (
                      <div
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md border shrink-0 font-bold"
                        style={{
                          backgroundColor: seg.colorBg || '#83fc94',
                          borderColor: seg.colorBorder || '#006e2a',
                          color: seg.colorText || '#00752d',
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                        <span className="text-[13px] font-mono">{seg.label}</span>
                      </div>
                    )}

                    {/* Chevron Divider between segments */}
                    {idx < route.segments.length - 1 && (
                      <span className="material-symbols-outlined text-[#727783] text-[16px] shrink-0">
                        chevron_right
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* View Step By Step Navigation Preview Footer */}
              <div className="pl-2 pt-1 border-t border-[#f1ecf2] flex items-center justify-between text-xs text-[#004481] font-medium">
                <span className="flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-[16px]">timeline</span>
                  Tap to view live step-by-step & stop radar
                </span>
                <span className="text-[#727783] text-[11px]">
                  {route.segments.length - 1} transfer{route.segments.length > 2 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </section>
  );
};
