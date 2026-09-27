import React from "react";

interface YieldNestLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function YieldNestLogo({
  className = "",
  size = "md",
  showTagline = true,
}: YieldNestLogoProps) {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Top Graphic Mark + Title */}
      <div className="flex items-center gap-3 sm:gap-4.5">
        {/* SVG Nest with 3 Golden Eggs & Sprouting Leaves */}
        <div className={`shrink-0 ${isSmall ? "w-14 h-10" : isLarge ? "w-28 sm:w-32 h-18 sm:h-20" : "w-20 sm:w-24 h-14 sm:h-16"}`}>
          <svg
            viewBox="0 0 160 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            {/* Sprouting Green Leaves behind right egg */}
            <path
              d="M118 42 C120 20, 142 12, 145 14 C146 28, 134 38, 124 45 Z"
              fill="#22C55E"
            />
            <path
              d="M125 44 C128 32, 148 24, 153 26 C153 38, 138 46, 128 48 Z"
              fill="#16A34A"
            />

            {/* Black Nest / Dish Base */}
            <ellipse cx="78" cy="84" rx="72" ry="20" fill="#1C1A17" />
            <ellipse cx="78" cy="80" rx="68" ry="16" fill="#292622" />
            <path
              d="M12 82 C24 95, 132 95, 144 82 C132 98, 24 98, 12 82 Z"
              fill="#423E38"
            />

            {/* Egg 1 (Left): Bar Chart */}
            <g transform="translate(18, 16)">
              <ellipse cx="25" cy="44" rx="22" ry="30" fill="url(#goldEggGrad1)" />
              <ellipse cx="25" cy="44" rx="22" ry="30" stroke="#EAB308" strokeWidth="1.5" />
              {/* Bar Chart Icon */}
              <rect x="14" y="50" width="5" height="15" rx="1" fill="#1A1A1A" />
              <rect x="22" y="40" width="5" height="25" rx="1" fill="#1A1A1A" />
              <rect x="30" y="32" width="5" height="33" rx="1" fill="#1A1A1A" />
            </g>

            {/* Egg 2 (Center): Pie Chart */}
            <g transform="translate(53, 10)">
              <ellipse cx="25" cy="44" rx="22" ry="30" fill="url(#goldEggGrad2)" />
              <ellipse cx="25" cy="44" rx="22" ry="30" stroke="#EAB308" strokeWidth="1.5" />
              {/* Pie Chart Icon */}
              <circle cx="25" cy="44" r="13" fill="#1A1A1A" />
              {/* Pie Slice highlighted in Emerald Green */}
              <path
                d="M25 44 L25 31 A13 13 0 0 1 38 44 Z"
                fill="#16A34A"
              />
              <path
                d="M25 44 L34 35 A13 13 0 0 1 38 44 Z"
                fill="#22C55E"
              />
            </g>

            {/* Egg 3 (Right): Line Chart with Arrow */}
            <g transform="translate(88, 18)">
              <ellipse cx="25" cy="44" rx="22" ry="30" fill="url(#goldEggGrad3)" />
              <ellipse cx="25" cy="44" rx="22" ry="30" stroke="#EAB308" strokeWidth="1.5" />
              {/* Line Chart & Arrow Icon */}
              <path
                d="M14 55 L22 47 L28 52 L36 37"
                stroke="#1A1A1A"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30 36 L37 36 L37 43"
                stroke="#1A1A1A"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Gradients */}
            <defs>
              <linearGradient id="goldEggGrad1" x1="12" y1="20" x2="38" y2="70" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="0.6" stopColor="#EAB308" />
                <stop offset="1" stopColor="#CA8A04" />
              </linearGradient>
              <linearGradient id="goldEggGrad2" x1="12" y1="20" x2="38" y2="70" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF08A" />
                <stop offset="0.5" stopColor="#FACC15" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="goldEggGrad3" x1="12" y1="20" x2="38" y2="70" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="0.6" stopColor="#EAB308" />
                <stop offset="1" stopColor="#CA8A04" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Wordmark Typography */}
        <div className="flex flex-col text-left">
          <div className="flex items-baseline font-display-title">
            <span
              className={`font-serif font-black tracking-tight text-[#1A1A1A] ${
                isSmall
                  ? "text-xl sm:text-2xl"
                  : isLarge
                  ? "text-4xl sm:text-5xl md:text-6xl"
                  : "text-3xl sm:text-4xl md:text-[42px]"
              }`}
            >
              Yield
            </span>
            <span
              className={`font-serif font-black italic tracking-tight text-[#16A34A] ${
                isSmall
                  ? "text-xl sm:text-2xl"
                  : isLarge
                  ? "text-4xl sm:text-5xl md:text-6xl"
                  : "text-3xl sm:text-4xl md:text-[42px]"
              }`}
            >
              Nest
            </span>
          </div>
          <span
            className={`font-sans font-semibold text-[#5A6474] tracking-normal -mt-1 sm:-mt-2 ${
              isSmall ? "text-[10px] pl-1" : isLarge ? "text-sm sm:text-base pl-2" : "text-xs sm:text-sm pl-1.5"
            }`}
          >
            .online
          </span>
        </div>
      </div>

      {/* Subtitles & Divider Rules */}
      {showTagline && (
        <div className="w-full mt-3 sm:mt-4 text-center max-w-xl">
          <div
            className={`font-sans font-bold tracking-[0.16em] sm:tracking-[0.22em] text-[#1C1A17] uppercase ${
              isSmall ? "text-[9px]" : "text-[11px] sm:text-xs md:text-[13px]"
            }`}
          >
            MUTUAL FUND RESEARCH &amp; ANALYTICS
          </div>

          <div className="flex items-center justify-center gap-3 mt-1.5 px-2">
            <div className="h-[1px] bg-stone-300 flex-1 max-w-[80px] sm:max-w-[120px]"></div>
            <span
              className={`font-sans font-semibold tracking-wider text-stone-600 uppercase whitespace-nowrap ${
                isSmall ? "text-[8px]" : "text-[9.5px] sm:text-[11px]"
              }`}
            >
              FUND COMPARISON | PERFORMANCE AUDITS | SIP INSIGHTS
            </span>
            <div className="h-[1px] bg-stone-300 flex-1 max-w-[80px] sm:max-w-[120px]"></div>
          </div>
        </div>
      )}
    </div>
  );
}
