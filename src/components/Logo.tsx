import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon SVG */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-[#004481] via-[#005baa] to-[#0c5fae] p-1.5 flex items-center justify-center shadow-sm ring-1 ring-black/10 shrink-0 group-hover:shadow transition-all`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Background Grid Pattern */}
          <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="2 2" />
          
          {/* Smart Route Transit Nodes & Line */}
          <path
            d="M8 26L15 19L22 23L28 11"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Compass / Arrow Directional Head */}
          <path
            d="M28 11L22 11.5M28 11L27.5 17"
            stroke="#83fc94"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Node 1 - Origin */}
          <circle cx="8" cy="26" r="2.5" fill="#83fc94" />

          {/* Node 2 - Smart Interchange */}
          <circle cx="15" cy="19" r="2.2" fill="#ffffff" />
          <circle cx="15" cy="19" r="1" fill="#004481" />

          {/* Node 3 - Transfer Hub */}
          <circle cx="22" cy="23" r="2.2" fill="#ffffff" />
          <circle cx="22" cy="23" r="1" fill="#004481" />

          {/* Node 4 - Destination Pulsing Node */}
          <circle cx="28" cy="11" r="3" fill="#ffb957" />
          <circle cx="28" cy="11" r="1.5" fill="#ffffff" />
        </svg>

        {/* Live Active Signal Indicator Dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#83fc94] rounded-full ring-2 ring-white animate-pulse" />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[17px] font-extrabold text-[#004481] tracking-tight">
              Smart Transport
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.2 bg-[#d5e3ff] text-[#004787] rounded font-mono uppercase tracking-wider">
              PRO
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-[#414751] tracking-wider uppercase">
              Navigator
            </span>
            <span className="text-[10px] text-[#006e2a] font-medium flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e2a]"></span>
              Live Telemetry
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
