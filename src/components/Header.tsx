import React from 'react';
import { TabType } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAccount: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  unreadAlertsCount: number;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
  isGpsActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAccount,
  onOpenSettings,
  onOpenHelp,
  unreadAlertsCount,
  connectionStatus = 'connected',
  isGpsActive = false,
}) => {
  return (
    <header className="hidden md:flex flex-col bg-surface border-b border-outline-variant w-full top docked shrink-0 z-30">
      <div className="flex justify-between items-center w-full px-6 lg:px-10 h-16 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <div 
            onClick={() => onTabChange('plan')}
            className="cursor-pointer group py-1"
            id="nav-logo"
          >
            <Logo size="md" />
          </div>

          <nav className="flex gap-6 h-16 items-center">
            <button
              onClick={() => onTabChange('plan')}
              id="tab-plan"
              className={`h-full flex items-center px-2 text-[13px] font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'plan'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent hover:border-outline-variant'
              }`}
            >
              Plan
            </button>
            <button
              onClick={() => onTabChange('live_status')}
              id="tab-live-status"
              className={`h-full flex items-center px-2 text-[13px] font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'live_status'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent hover:border-outline-variant'
              }`}
            >
              Live Status
            </button>
            <button
              onClick={() => onTabChange('saved')}
              id="tab-saved"
              className={`h-full flex items-center px-2 text-[13px] font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'saved'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent hover:border-outline-variant'
              }`}
            >
              Saved
            </button>
            <button
              onClick={() => onTabChange('alerts')}
              id="tab-alerts"
              className={`h-full flex items-center gap-1.5 px-2 text-[13px] font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'alerts'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent hover:border-outline-variant'
              }`}
            >
              Alerts
              {unreadAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-error text-white text-[10px] font-bold rounded-full">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onTabChange('community')}
              id="tab-community"
              className={`h-full flex items-center gap-1.5 px-2 text-[13px] font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'community'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent hover:border-outline-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">forum</span>
              Community
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Status Indicators */}
          <div 
            onClick={onOpenSettings}
            title="Click to view Backend & Stream status"
            className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-outline-variant/60 text-[11px] font-mono cursor-pointer hover:border-primary transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-secondary animate-pulse'
                  : 'bg-tertiary animate-ping'
              }`}
            ></span>
            <span className="text-on-surface-variant font-medium">
              {connectionStatus === 'connected' ? 'Stream: Live' : 'Connecting...'}
            </span>
            {isGpsActive && (
              <span className="text-secondary font-bold flex items-center gap-0.5">
                • GPS On
              </span>
            )}
          </div>

          <button
            onClick={() => onTabChange('alerts')}
            title="Service Notifications"
            id="header-notifications-btn"
            className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors flex items-center justify-center relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            title="Preferences, Backend & API Config"
            id="header-settings-btn"
            className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>

          <button
            onClick={onOpenHelp}
            title="Transit Guide & Fare Calculator"
            id="header-help-btn"
            className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>

          <button
            onClick={onOpenAccount}
            id="header-account-btn"
            className="bg-primary hover:bg-primary-container text-white text-[13px] font-medium px-4 py-2 rounded-full transition-colors ml-1 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            Account
          </button>
        </div>
      </div>
    </header>
  );
};
