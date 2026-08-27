import React, { useState } from 'react';
import { TransitAlert } from '../types';

interface AlertsViewProps {
  alerts: TransitAlert[];
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts }) => {
  const [filter, setFilter] = useState<'all' | 'warning' | 'info'>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'all') return true;
    return a.type === filter;
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">
      <div className="bg-white border border-[#c1c6d3] rounded-2xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1c1b1f]">Official Transit Advisories & Alerts</h2>
          <p className="text-sm text-[#414751] mt-1">
            Real-time notifications issued by Land Transport Authority (LTA) and SMRT Operations Control Centre.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#004481] text-white'
                : 'bg-[#f1ecf2] text-[#414751] hover:bg-[#e5e1e7]'
            }`}
          >
            All Advisories
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'warning'
                ? 'bg-[#ba1a1a] text-white'
                : 'bg-[#f1ecf2] text-[#414751] hover:bg-[#e5e1e7]'
            }`}
          >
            Delays Only
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'info'
                ? 'bg-[#005baa] text-white'
                : 'bg-[#f1ecf2] text-[#414751] hover:bg-[#e5e1e7]'
            }`}
          >
            Notices
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-xl p-5 border transition-all flex flex-col gap-2 shadow-xs ${
              alert.type === 'warning'
                ? 'border-[#ffb4ab] border-l-4 border-l-[#ba1a1a]'
                : 'border-[#c1c6d3] border-l-4 border-l-[#005baa]'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    alert.type === 'warning' ? 'text-[#ba1a1a]' : 'text-[#005baa]'
                  }`}
                >
                  {alert.type === 'warning' ? 'warning' : 'info'}
                </span>
                <h3 className="font-bold text-base text-[#1c1b1f]">{alert.title}</h3>
              </div>
              <span className="text-xs font-mono text-[#727783] bg-[#f1ecf2] px-2 py-0.5 rounded">
                {alert.timestamp}
              </span>
            </div>

            <p className="text-sm text-[#414751] pl-7">{alert.description}</p>

            <div className="pl-7 pt-2 flex items-center justify-between text-xs text-[#727783]">
              <span>Affected: <strong className="text-[#1c1b1f]">{alert.affectedLine}</strong></span>
              {alert.bridgingBus && (
                <span className="bg-[#83fc94] text-[#00752d] font-bold px-2 py-0.5 rounded text-[11px]">
                  Free Bridging Bus Deployed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
