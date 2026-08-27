import React, { useState } from 'react';
import { DiscussionEmbed } from 'disqus-react';
import { RouteOption } from '../types';

interface RouteDetailModalProps {
  route: RouteOption | null;
  onClose: () => void;
  onSaveRoute: (route: RouteOption) => void;
  isSaved?: boolean;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({
  route,
  onClose,
  onSaveRoute,
  isSaved = false,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showComments, setShowComments] = useState(false);

  if (!route) return null;

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/route/${route.id}`
    : `https://smarttransport.sg/route/${route.id}`;

  const routeDisqusConfig = {
    url: currentUrl,
    identifier: `smarttransport-route-${route.id}`,
    title: `Route Itinerary: ${route.departureTime} to ${route.arrivalTime} (${route.totalDurationMinutes} mins)`,
    language: 'en',
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `SMRT Journey: ${route.totalDurationMinutes} mins (${route.departureTime} - ${route.arrivalTime}) • Fare: ${route.fare}`
    );
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#c1c6d3] overflow-hidden"
        id="route-detail-dialog"
      >
        {/* Header */}
        <div className="bg-[#f7f2f8] p-4 md:p-5 border-b border-[#c1c6d3] flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-bold text-[#1c1b1f] tracking-tight">
                {route.totalDurationMinutes} <span className="text-lg font-normal text-[#414751]">mins</span>
              </span>
              {route.isOptimal && (
                <span className="bg-[#005baa] text-[#bbd4ff] text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Most Optimal
                </span>
              )}
              {route.status === 'Minor Delay' && (
                <span className="bg-[#ffdad6] text-[#93000a] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#ffb4ab]">
                  Minor Delay (+7m)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-sm font-medium text-[#414751]">
                {route.departureTime} — {route.arrivalTime}
              </span>
              <span className="text-[#c1c6d3]">•</span>
              <div className="inline-flex items-baseline gap-1 bg-[#d5e3ff]/50 px-2.5 py-0.5 rounded-lg border border-[#a6c8ff]">
                <span className="text-xs font-semibold text-[#004787]">Fare</span>
                <span className="text-lg md:text-xl font-extrabold text-[#004481] font-mono tracking-tight tabular-nums">
                  {route.fare}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSaveRoute(route)}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#004481] text-white border-[#004481]'
                  : 'bg-white text-[#414751] border-[#c1c6d3] hover:bg-[#f1ecf2]'
              }`}
              title={isSaved ? 'Saved to commute' : 'Save route'}
            >
              <span 
                className="material-symbols-outlined text-[20px]"
                style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                bookmark
              </span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white text-[#414751] border border-[#c1c6d3] hover:bg-[#f1ecf2] transition-colors cursor-pointer"
              title="Share itinerary"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#727783] hover:text-[#1c1b1f] hover:bg-[#e5e1e7] transition-colors cursor-pointer"
              title="Close modal"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Share Toast */}
        {showShareToast && (
          <div className="bg-[#006e2a] text-white text-xs font-semibold px-4 py-2 text-center animate-in slide-in-from-top duration-150">
            Itinerary details copied to clipboard!
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Schematic Route Overview Bar */}
          <div className="bg-[#f1ecf2] p-3 rounded-xl border border-[#c1c6d3] flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold text-[#414751]">
              <span>Transit Segments Overview</span>
              <span className="text-xs text-[#727783] font-mono">{route.segments.length - 1} transfer{route.segments.length > 2 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 h-6 w-full rounded-lg overflow-hidden bg-white p-1 border border-[#c1c6d3]">
              {route.segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="h-full rounded text-[10px] font-bold flex items-center justify-center px-1 truncate text-white"
                  style={{
                    flex: seg.durationMinutes,
                    backgroundColor:
                      seg.mode === 'walk'
                        ? '#727783'
                        : seg.mode === 'train'
                        ? '#d42e12'
                        : '#006e2a',
                  }}
                  title={`${seg.label} (${seg.durationMinutes} min)`}
                >
                  {seg.label}
                </div>
              ))}
            </div>
          </div>

          {/* Step by Step Timeline */}
          <div className="flex flex-col gap-0 relative">
            <h3 className="text-sm font-bold text-[#1c1b1f] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004481] text-[20px]">directions</span>
              Turn-by-Turn Commuter Steps
            </h3>

            <div className="flex flex-col relative pl-6 border-l-2 border-[#c1c6d3] ml-3 gap-6">
              {route.detailedSteps.map((step, idx) => {
                const isActive = isNavigating && activeStepIndex === idx;

                return (
                  <div key={idx} className="relative flex flex-col gap-1">
                    {/* Node Dot on vertical line */}
                    <div
                      className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                        isActive
                          ? 'border-[#004481] ring-4 ring-[#d5e3ff]'
                          : step.mode === 'destination'
                          ? 'border-[#ba1a1a] bg-[#ba1a1a]'
                          : 'border-[#004481]'
                      }`}
                    >
                      {step.mode === 'destination' ? (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      ) : (
                        <div className="w-1.5 h-1.5 bg-[#004481] rounded-full"></div>
                      )}
                    </div>

                    {/* Step Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#727783]">
                          {step.time}
                        </span>
                        {step.badge && (
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-bold text-white font-mono"
                            style={{ backgroundColor: step.badgeColor || '#004481' }}
                          >
                            {step.badge}
                          </span>
                        )}
                        <span className="text-sm font-bold text-[#1c1b1f]">
                          {step.instruction}
                        </span>
                      </div>
                      {step.duration && (
                        <span className="text-xs font-mono text-[#727783] bg-[#f1ecf2] px-2 py-0.5 rounded border border-[#c1c6d3]">
                          {step.duration}
                        </span>
                      )}
                    </div>

                    {/* Step Detail */}
                    {step.detail && (
                      <p className="text-xs text-[#414751] mt-0.5 bg-[#fdf8fd] p-2 rounded-lg border border-[#e5e1e7]">
                        {step.detail}
                      </p>
                    )}

                    {/* Intermediate stops list if train or bus */}
                    {step.intermediateStops && step.intermediateStops.length > 0 && (
                      <div className="mt-1 bg-white p-2.5 rounded-lg border border-[#c1c6d3] text-xs">
                        <div className="text-[11px] font-semibold text-[#727783] mb-1.5 flex items-center justify-between">
                          <span>{step.stopsCount || step.intermediateStops.length} Intermediate Stops</span>
                          <span className="text-[10px] text-[#006e2a]">● Low Crowding Expected</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {step.intermediateStops.map((stn, sIdx) => (
                            <span
                              key={sIdx}
                              className="bg-[#f7f2f8] text-[#414751] text-[11px] px-2 py-0.5 rounded border border-[#e5e1e7]"
                            >
                              {stn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Commuter Discussion / Reviews Toggle & Embed */}
            <div className="mt-6 pt-4 border-t border-[#c1c6d3]">
              <button
                onClick={() => setShowComments(!showComments)}
                className="w-full py-2.5 px-4 bg-[#f7f2f8] hover:bg-[#ece6ee] rounded-xl border border-[#c1c6d3] flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-[#004481]/10 text-[#004481] rounded-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">forum</span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[#1c1b1f]">Route Reviews & Commuter Tips</span>
                    <p className="text-[11px] text-[#414751]">Share transfer shortcuts or crowded car tips for this route</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-[#727783]">
                  {showComments ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showComments && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-[#c1c6d3] shadow-xs">
                  <DiscussionEmbed
                    key={`modal-route-${route.id}`}
                    shortname="smarttransport"
                    config={routeDisqusConfig}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f7f2f8] p-4 border-t border-[#c1c6d3] flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-medium text-[#727783]">Estimated EZ-Link Tap Fare:</span>
            <span className="text-xl font-extrabold text-[#004481] font-mono tabular-nums">{route.fare}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!isNavigating) {
                  setIsNavigating(true);
                  setActiveStepIndex(0);
                } else {
                  if (activeStepIndex < route.detailedSteps.length - 1) {
                    setActiveStepIndex(activeStepIndex + 1);
                  } else {
                    setIsNavigating(false);
                    alert('You have reached your destination: Changi Airport T3!');
                  }
                }
              }}
              className="bg-[#004481] hover:bg-[#005baa] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isNavigating ? 'check_circle' : 'navigation'}
              </span>
              {isNavigating
                ? activeStepIndex < route.detailedSteps.length - 1
                  ? 'Next Step'
                  : 'Complete Trip'
                : 'Start Live Guidance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
