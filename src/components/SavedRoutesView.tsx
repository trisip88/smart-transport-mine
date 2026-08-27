import React from 'react';
import { SavedRoute, TransportMode } from '../types';

interface SavedRoutesViewProps {
  savedRoutes: SavedRoute[];
  onPlanSavedRoute: (origin: string, dest: string, mode: TransportMode) => void;
  onDeleteSavedRoute: (id: string) => void;
  onAddCustomSave: () => void;
}

export const SavedRoutesView: React.FC<SavedRoutesViewProps> = ({
  savedRoutes,
  onPlanSavedRoute,
  onDeleteSavedRoute,
  onAddCustomSave,
}) => {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">
      <div className="bg-white border border-[#c1c6d3] rounded-2xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1c1b1f]">Saved Commutes & Favorite Places</h2>
          <p className="text-sm text-[#414751] mt-1">
            Quick 1-tap route planner launch for frequent journeys, airport transfers, and daily transit.
          </p>
        </div>
        <button
          onClick={onAddCustomSave}
          className="bg-[#004481] hover:bg-[#005baa] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Favorite
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedRoutes.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-5 border border-[#c1c6d3] hover:border-[#004481] hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-[#1c1b1f]">{item.title}</h3>
                <button
                  onClick={() => onDeleteSavedRoute(item.id)}
                  title="Remove saved commute"
                  className="text-[#727783] hover:text-[#ba1a1a] transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-1.5 text-xs text-[#414751]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#727783]">my_location</span>
                  <span>From: <strong className="text-[#1c1b1f]">{item.origin}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">location_on</span>
                  <span>To: <strong className="text-[#1c1b1f]">{item.destination}</strong></span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="bg-[#f1ecf2] text-[#414751] text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  >
                    #{t}
                  </span>
                ))}
                <span className="bg-[#d5e3ff] text-[#001c3b] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  ⏱ {item.usualDuration}
                </span>
              </div>
            </div>

            <button
              onClick={() => onPlanSavedRoute(item.origin, item.destination, item.preferredMode)}
              className="w-full bg-[#f7f2f8] hover:bg-[#004481] hover:text-white text-[#004481] py-2 rounded-lg text-xs font-bold border border-[#c1c6d3] hover:border-[#004481] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">directions</span>
              Plan This Journey
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
