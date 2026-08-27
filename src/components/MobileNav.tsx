import React from 'react';
import { TabType } from '../types';

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadAlertsCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  unreadAlertsCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 flex justify-around py-2 shadow-lg safe-bottom">
      <button
        onClick={() => onTabChange('plan')}
        id="mobile-nav-plan"
        className={`flex flex-col items-center gap-0.5 py-1 px-3 ${
          activeTab === 'plan' ? 'text-primary font-bold' : 'text-on-surface-variant'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[24px]"
          style={activeTab === 'plan' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          directions_transit
        </span>
        <span className="text-[11px] uppercase tracking-wider font-semibold">Plan</span>
      </button>

      <button
        onClick={() => onTabChange('live_status')}
        id="mobile-nav-live"
        className={`flex flex-col items-center gap-0.5 py-1 px-3 ${
          activeTab === 'live_status' ? 'text-primary font-bold' : 'text-on-surface-variant'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[24px]"
          style={activeTab === 'live_status' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          subway
        </span>
        <span className="text-[11px] uppercase tracking-wider font-semibold">Live Status</span>
      </button>

      <button
        onClick={() => onTabChange('saved')}
        id="mobile-nav-saved"
        className={`flex flex-col items-center gap-0.5 py-1 px-3 ${
          activeTab === 'saved' ? 'text-primary font-bold' : 'text-on-surface-variant'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[24px]"
          style={activeTab === 'saved' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          bookmark
        </span>
        <span className="text-[11px] uppercase tracking-wider font-semibold">Saved</span>
      </button>

      <button
        onClick={() => onTabChange('alerts')}
        id="mobile-nav-alerts"
        className={`flex flex-col items-center gap-0.5 py-1 px-3 relative ${
          activeTab === 'alerts' ? 'text-primary font-bold' : 'text-on-surface-variant'
        }`}
      >
        <div className="relative">
          <span 
            className="material-symbols-outlined text-[24px]"
            style={activeTab === 'alerts' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            notifications
          </span>
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface"></span>
          )}
        </div>
        <span className="text-[11px] uppercase tracking-wider font-semibold">Alerts</span>
      </button>

      <button
        onClick={() => onTabChange('community')}
        id="mobile-nav-community"
        className={`flex flex-col items-center gap-0.5 py-1 px-3 ${
          activeTab === 'community' ? 'text-primary font-bold' : 'text-on-surface-variant'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[24px]"
          style={activeTab === 'community' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          forum
        </span>
        <span className="text-[11px] uppercase tracking-wider font-semibold">Community</span>
      </button>
    </nav>
  );
};
