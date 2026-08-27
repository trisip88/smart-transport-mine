import React, { useState } from 'react';

interface ModalsProps {
  showAccount: boolean;
  showSettings: boolean;
  showHelp: boolean;
  onClose: () => void;
}

export const AppModals: React.FC<ModalsProps> = ({
  showAccount,
  showSettings,
  showHelp,
  onClose,
}) => {
  const [ezlinkBalance, setEzlinkBalance] = useState<number>(34.80);
  const [topupAmount, setTopupAmount] = useState<number>(10);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [lessWalking, setLessWalking] = useState(false);
  const [liveDisruptionAlerts, setLiveDisruptionAlerts] = useState(true);
  const [topupSuccess, setTopupSuccess] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'preferences' | 'api_backend'>('preferences');

  if (!showAccount && !showSettings && !showHelp) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      {/* Account Modal */}
      {showAccount && (
        <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#c1c6d3] shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center border-b border-[#c1c6d3] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004481] text-[24px]">account_circle</span>
              <h3 className="font-bold text-lg text-[#1c1b1f]">SimplyGo / EZ-Link Account</h3>
            </div>
            <button onClick={onClose} className="text-[#727783] hover:text-[#1c1b1f]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Card Mockup */}
          <div className="bg-gradient-to-tr from-[#004481] to-[#005baa] text-white rounded-xl p-5 shadow-md flex flex-col justify-between h-44 relative overflow-hidden">
            <div className="absolute right-3 -bottom-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#bbd4ff] font-bold">SimplyGo Adult Card</span>
                <div className="font-mono text-sm tracking-wider mt-1">9810 •••• •••• 4209</div>
              </div>
              <span className="material-symbols-outlined text-white/80 text-[28px]">contactless</span>
            </div>

            <div>
              <span className="text-xs text-[#bbd4ff]">Stored Value Balance</span>
              <div className="text-3xl font-bold font-mono tracking-tight">
                ${ezlinkBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {topupSuccess && (
            <div className="bg-[#83fc94]/40 border border-[#006e2a] text-[#00752d] text-xs font-semibold p-2.5 rounded-lg text-center">
              Successfully topped up ${topupAmount.toFixed(2)}!
            </div>
          )}

          {/* Quick Top-up */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#414751]">Quick Stored-Value Top Up</span>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 50].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopupAmount(amt)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    topupAmount === amt
                      ? 'bg-[#004481] text-white border-[#004481]'
                      : 'bg-[#f7f2f8] text-[#414751] border-[#c1c6d3] hover:bg-[#e5e1e7]'
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setEzlinkBalance((prev) => prev + topupAmount);
                setTopupSuccess(true);
                setTimeout(() => setTopupSuccess(false), 2000);
              }}
              className="mt-2 w-full bg-[#006e2a] hover:bg-[#00531e] text-white py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Top Up with PayNow / Credit Card
            </button>
          </div>

          <div className="text-[11px] text-[#727783] text-center border-t border-[#f1ecf2] pt-3">
            Auto Top-up is active via DBS/POSB Mastercard.
          </div>
        </div>
      )}

      {/* Settings & API Backend Modal */}
      {showSettings && (
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#c1c6d3] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-[#c1c6d3] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004481] text-[24px]">settings</span>
              <h3 className="font-bold text-lg text-[#1c1b1f]">Settings & Backend Engine</h3>
            </div>
            <button onClick={onClose} className="text-[#727783] hover:text-[#1c1b1f] cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#f1ecf2] p-1 rounded-lg border border-[#c1c6d3]">
            <button
              onClick={() => setActiveSettingsTab('preferences')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                activeSettingsTab === 'preferences' ? 'bg-white text-[#004481] shadow-xs' : 'text-[#414751]'
              }`}
            >
              Commute Preferences
            </button>
            <button
              onClick={() => setActiveSettingsTab('api_backend')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                activeSettingsTab === 'api_backend' ? 'bg-white text-[#004481] shadow-xs' : 'text-[#414751]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#006e2a]"></span>
              Backend Streaming & API Status
            </button>
          </div>

          {activeSettingsTab === 'preferences' ? (
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3 bg-[#f7f2f8] rounded-xl border border-[#c1c6d3] cursor-pointer">
                <div>
                  <span className="text-sm font-bold text-[#1c1b1f] block">Wheelchair / Stroller Accessible</span>
                  <span className="text-xs text-[#727783]">Prioritize barrier-free MRT lifts and ramped buses</span>
                </div>
                <input
                  type="checkbox"
                  checked={wheelchairAccessible}
                  onChange={(e) => setWheelchairAccessible(e.target.checked)}
                  className="w-5 h-5 rounded text-[#004481] focus:ring-[#004481]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#f7f2f8] rounded-xl border border-[#c1c6d3] cursor-pointer">
                <div>
                  <span className="text-sm font-bold text-[#1c1b1f] block">Sheltered Walkways & Less Walking</span>
                  <span className="text-xs text-[#727783]">Minimize walking distance during rainy weather</span>
                </div>
                <input
                  type="checkbox"
                  checked={lessWalking}
                  onChange={(e) => setLessWalking(e.target.checked)}
                  className="w-5 h-5 rounded text-[#004481] focus:ring-[#004481]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#f7f2f8] rounded-xl border border-[#c1c6d3] cursor-pointer">
                <div>
                  <span className="text-sm font-bold text-[#1c1b1f] block">Live Disruption Push Alerts</span>
                  <span className="text-xs text-[#727783]">Receive instant announcements for your saved commute lines</span>
                </div>
                <input
                  type="checkbox"
                  checked={liveDisruptionAlerts}
                  onChange={(e) => setLiveDisruptionAlerts(e.target.checked)}
                  className="w-5 h-5 rounded text-[#004481] focus:ring-[#004481]"
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-xs">
              {/* Data.gov.sg Live Status */}
              <div className="bg-[#f7f2f8] p-3 rounded-xl border border-[#c1c6d3] flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1c1b1f] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#006e2a] animate-pulse"></span>
                    Singapore Weather & Environment (Data.gov.sg v2)
                  </span>
                  <span className="px-2 py-0.5 bg-[#83fc94]/40 text-[#00752d] rounded font-bold font-mono text-[10px]">
                    10 Live Keyless Feeds Active
                  </span>
                </div>
                <p className="text-[#414751] text-[11px]">
                  Real-time meteorological feeds: 2-hr forecast, 24-hr forecast, 4-day outlook, air temperature, rainfall, PSI, PM2.5, UV index, relative humidity, and wind speed.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-white border border-[#c1c6d3] px-2 py-0.5 rounded font-mono text-[10px] text-[#004481]">
                    GET /api/weather/summary
                  </span>
                  <span className="bg-white border border-[#c1c6d3] px-2 py-0.5 rounded font-mono text-[10px] text-[#004481]">
                    GET /api/weather/rainfall
                  </span>
                  <span className="bg-white border border-[#c1c6d3] px-2 py-0.5 rounded font-mono text-[10px] text-[#004481]">
                    GET /api/weather/psi
                  </span>
                </div>
              </div>

              {/* LTA DataMall Status */}
              <div className="bg-[#f7f2f8] p-3 rounded-xl border border-[#c1c6d3] flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1c1b1f]">LTA DataMall v3 Integration:</span>
                  <span className="px-2 py-0.5 bg-[#d5e3ff] text-[#004481] rounded font-bold font-mono text-[10px]">
                    Header: AccountKey
                  </span>
                </div>
                <p className="text-[#414751] text-[11px]">
                  Proxies next buses at a stop (v3 <code>/v3/BusArrival</code>), carpark lots (<code>/CarParkAvailabilityv2</code>), traffic incidents (<code>/TrafficIncidents</code>), and MRT/LRT alerts (<code>/TrainServiceAlerts</code>).
                </p>
                <div className="bg-white p-2 rounded font-mono text-[10px] text-[#1c1b1f] border border-[#c1c6d3]">
                  <div>LTA_ACCOUNT_KEY="your_datamall_account_key"</div>
                </div>
                <div className="text-[10px] text-[#727783]">
                  * Protected by server-side guardrails: credential is read exclusively in <code>/api</code> on the server.
                </div>
              </div>

              {/* OneMap Singapore Status */}
              <div className="bg-[#f7f2f8] p-3 rounded-xl border border-[#c1c6d3] flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1c1b1f]">OneMap Singapore (SLA):</span>
                  <span className="px-2 py-0.5 bg-[#d5e3ff] text-[#004481] rounded font-bold font-mono text-[10px]">
                    Token / 3-Day Mint
                  </span>
                </div>
                <p className="text-[#414751] text-[11px]">
                  Official SLA geospatial APIs for Elastic search/geocoding (<code>/api/onemap/search</code>), reverse geocoding (<code>/api/onemap/reverse-geocode</code>), and multimodal routing (<code>/api/onemap/route</code> for walk, drive, cycle, pt).
                </p>
                <div className="bg-white p-2 rounded font-mono text-[10px] text-[#1c1b1f] border border-[#c1c6d3] space-y-0.5">
                  <div>ONEMAP_EMAIL="your_onemap_email"</div>
                  <div>ONEMAP_PASSWORD="your_onemap_password"</div>
                  <div className="text-[#727783]"># OR ONEMAP_API_TOKEN="direct_token"</div>
                </div>
                <div className="text-[10px] text-[#727783]">
                  * Protected by server-side guardrails: credentials read exclusively in <code>/api</code>.
                </div>
              </div>

              {/* Real-Time SSE Status */}
              <div className="bg-[#f7f2f8] p-3 rounded-xl border border-[#c1c6d3] flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1c1b1f]">Real-Time Streaming Engine:</span>
                  <span className="px-2 py-0.5 bg-[#83fc94]/40 text-[#00752d] rounded font-bold font-mono text-[10px]">
                    SSE Active (/api/stream/live-transit)
                  </span>
                </div>
                <p className="text-[#414751] text-[11px]">
                  Broadcasts vehicle GPS telemetry, crowd load, train line statuses, disruption alerts, and live weather conditions to connected clients at 2.0s intervals.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-[#004481] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#005baa] cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#c1c6d3] shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center border-b border-[#c1c6d3] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004481] text-[24px]">help_outline</span>
              <h3 className="font-bold text-lg text-[#1c1b1f]">Smart Transport Navigator Guide</h3>
            </div>
            <button onClick={onClose} className="text-[#727783] hover:text-[#1c1b1f] cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="text-xs text-[#414751] flex flex-col gap-3">
            <div className="bg-[#f7f2f8] p-3 rounded-lg border border-[#c1c6d3]">
              <h4 className="font-bold text-[#1c1b1f] mb-1">Real-time Stream & Geolocation</h4>
              <p>
                The backend automatically streams live telemetry for all MRT lines and bus arrivals. You can toggle live device GPS or commute route simulation in the Trip Planner panel.
              </p>
            </div>

            <div className="bg-[#f7f2f8] p-3 rounded-lg border border-[#c1c6d3]">
              <h4 className="font-bold text-[#1c1b1f] mb-1">Fare Structure & Transfer Rules</h4>
              <p>
                Distance-based fares apply seamlessly between MRT, LRT, and public buses within 45 minutes of transferring. Simply tap the same card or mobile contactless device.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#004481] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#005baa] cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      )}
    </div>
  );
};
