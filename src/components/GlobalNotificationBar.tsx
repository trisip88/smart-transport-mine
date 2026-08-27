import React, { useState, useEffect } from 'react';
import { TransitAlert } from '../types';

export interface GlobalIncident {
  id: string;
  category: 'traffic' | 'weather' | 'rail' | 'advisory';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  affectedCorridor: string;
  impactBadge: string;
  actionLabel?: string;
  time: string;
}

interface GlobalNotificationBarProps {
  onOpenAlertsTab?: () => void;
  onOpenIncidentDetail?: (incident: GlobalIncident) => void;
}

export const DEFAULT_INCIDENTS: GlobalIncident[] = [
  {
    id: 'inc-1',
    category: 'traffic',
    severity: 'warning',
    title: 'Expressway Congestion (TPE toward Changi Airport)',
    detail: 'Heavy traffic volume from Pungool Flyover to Tampines Ave 10. Bus 858 & 168 running +6-8 mins behind schedule.',
    affectedCorridor: 'TPE / PIE Expressway',
    impactBadge: '+7 min delay on Bus 858',
    actionLabel: 'View Route Alternatives',
    time: '2 mins ago',
  },
  {
    id: 'inc-2',
    category: 'weather',
    severity: 'warning',
    title: 'Heavy Rain & Wet Platform Advisory (East & North-East)',
    detail: 'Thunderstorms detected across Tampines, Bedok, and Changi. MRT platform speed restricted to safety protocols.',
    affectedCorridor: 'East & Changi Corridors',
    impactBadge: 'Sheltered Walkways Active',
    actionLabel: 'Check Weather Radar',
    time: '5 mins ago',
  },
  {
    id: 'inc-3',
    category: 'rail',
    severity: 'info',
    title: 'Normal Headway on All Main MRT Lines (NSL, EWL, CCL, DTL, TEL)',
    detail: 'Peak period train frequency running every 2 to 3 minutes. All gantry taps and SimplyGo processing at 100% capacity.',
    affectedCorridor: 'Islandwide Rail Network',
    impactBadge: 'Optimal Flow',
    actionLabel: 'View Line Radar',
    time: 'Just now',
  },
];

export const GlobalNotificationBar: React.FC<GlobalNotificationBarProps> = ({
  onOpenAlertsTab,
  onOpenIncidentDetail,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-cycle through incidents every 6 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused || isExpanded || isDismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEFAULT_INCIDENTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, isExpanded, isDismissed]);

  if (isDismissed) {
    return (
      <div className="bg-[#f1ecf2] border-b border-[#c1c6d3] px-4 py-1 flex items-center justify-between text-xs text-[#414751]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
          <span className="font-semibold text-[#1c1b1f]">2 active transit & weather advisories</span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-[#004481] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
          Show Notification Bar
        </button>
      </div>
    );
  }

  const current = DEFAULT_INCIDENTS[currentIndex];

  const categoryStyles = {
    traffic: {
      bg: 'bg-[#ffdad6]',
      border: 'border-[#ffb4ab]',
      text: 'text-[#93000a]',
      icon: 'traffic',
      badge: 'TRAFFIC ALERT',
    },
    weather: {
      bg: 'bg-[#ffddb5]',
      border: 'border-[#ffca85]',
      text: 'text-[#643f00]',
      icon: 'thunderstorm',
      badge: 'WEATHER ADVISORY',
    },
    rail: {
      bg: 'bg-[#d5e3ff]',
      border: 'border-[#a6c8ff]',
      text: 'text-[#004787]',
      icon: 'subway',
      badge: 'RAIL TELEMETRY',
    },
    advisory: {
      bg: 'bg-[#f1ecf2]',
      border: 'border-[#c1c6d3]',
      text: 'text-[#414751]',
      icon: 'campaign',
      badge: 'SYSTEM NOTICE',
    },
  };

  const currentTheme = categoryStyles[current.category] || categoryStyles.advisory;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full bg-[#1c1b1f] text-white border-b border-[#313034] z-40 transition-all shadow-sm"
      id="global-incident-bar"
    >
      {/* Primary Ticker Row */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-2 flex items-center justify-between gap-3 text-xs">
        {/* Left: Indicator Badge + Live Pulsing Node */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#313034] px-2.5 py-1 rounded-full border border-white/10 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />
            <span className="text-white tracking-wide">LIVE DISRUPTIONS</span>
            <span className="bg-[#ba1a1a] text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {DEFAULT_INCIDENTS.length}
            </span>
          </div>

          <span className="hidden lg:inline text-white/40">|</span>
        </div>

        {/* Center: Active Incident Summary */}
        <div className="flex-1 flex items-center gap-2 overflow-hidden min-w-0">
          {/* Category Tag */}
          <span
            className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${currentTheme.bg} ${currentTheme.text}`}
          >
            <span className="material-symbols-outlined text-[13px]">{currentTheme.icon}</span>
            {currentTheme.badge}
          </span>

          {/* Incident Headline & Impact */}
          <div className="flex items-center gap-2 truncate text-[13px]">
            <span className="font-semibold text-white truncate">{current.title}</span>
            <span className="hidden md:inline text-white/50">•</span>
            <span className="hidden md:inline font-normal text-white/80 truncate">{current.detail}</span>
          </div>

          {/* Impact Metric Pill */}
          <span className="hidden xl:inline-flex bg-white/10 text-[#83fc94] font-mono text-[11px] px-2 py-0.5 rounded border border-white/10 shrink-0 font-medium">
            {current.impactBadge}
          </span>
        </div>

        {/* Right: Controls (Carousel Prev/Next, Expand, Open All, Dismiss) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Pagination Counter */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-white/60 mr-1">
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + DEFAULT_INCIDENTS.length) % DEFAULT_INCIDENTS.length)
              }
              title="Previous alert"
              className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <span>
              {currentIndex + 1}/{DEFAULT_INCIDENTS.length}
            </span>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % DEFAULT_INCIDENTS.length)}
              title="Next alert"
              className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {/* Expand Details Drawer Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              isExpanded
                ? 'bg-[#005baa] text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isExpanded ? 'unfold_less' : 'unfold_more'}
            </span>
            <span className="hidden md:inline">{isExpanded ? 'Collapse' : 'All Advisories'}</span>
          </button>

          {/* Jump to Alerts Tab */}
          {onOpenAlertsTab && (
            <button
              onClick={onOpenAlertsTab}
              className="bg-[#004481] hover:bg-[#005baa] text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-colors hidden sm:flex items-center gap-1 cursor-pointer"
            >
              <span>Full Feed</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}

          {/* Dismiss Bar */}
          <button
            onClick={() => setIsDismissed(true)}
            title="Dismiss notification bar"
            className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      {/* Expanded Multi-Incident Grid View */}
      {isExpanded && (
        <div className="bg-[#262529] border-t border-white/10 p-4 md:px-8 max-w-[1440px] mx-auto animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Live Disruption Radar & Weather Station</span>
              <span className="text-xs text-white/50 font-mono">• Updated directly from LTA & SMRT OCC</span>
            </div>
            <button
              onClick={() => onOpenAlertsTab?.()}
              className="text-xs text-[#a6c8ff] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              Open Incident Management Center
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEFAULT_INCIDENTS.map((inc, idx) => {
              const theme = categoryStyles[inc.category];
              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    onOpenIncidentDetail?.(inc);
                  }}
                  className={`bg-[#313034] rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    currentIndex === idx
                      ? 'border-[#a6c8ff] ring-1 ring-[#a6c8ff]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${theme.bg} ${theme.text}`}>
                        {theme.badge}
                      </span>
                      <span className="text-[10px] text-white/50 font-mono">{inc.time}</span>
                    </div>

                    <h4 className="font-bold text-[13px] text-white leading-snug">{inc.title}</h4>
                    <p className="text-xs text-white/70 line-clamp-2">{inc.detail}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
                    <span className="text-white/50">{inc.affectedCorridor}</span>
                    <span className="text-[#83fc94] font-mono font-medium">{inc.impactBadge}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
