import React from 'react';

export default function EnrCourtageLogo({
  size = 'md',
  showSubtitle = true,
  subtitle = 'M&A • Cession de Portefeuilles PV & BESS',
  className = '',
  onClick,
}) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const svgSize = isSm ? 'h-7 w-7' : isLg ? 'h-11 w-11' : 'h-9 w-9';
  const titleSize = isSm ? 'text-base' : isLg ? 'text-2xl' : 'text-xl';
  const subSize = isSm ? 'text-[9px]' : isLg ? 'text-[11px]' : 'text-[10px]';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Croix Multicolore Officielle ENR COURTAGE */}
      <svg
        className={`${svgSize} shrink-0`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo ENR Courtage"
      >
        {/* Chevron Ambre gauche */}
        <path d="M15 35 L30 50 L15 65 L25 75 L50 50 L25 25 Z" fill="#f59e0b" />
        {/* Branche Bleue / Cyan diagonale */}
        <path
          d="M25 80 L50 55 L75 80 L88 67 L63 42 L88 17 L75 5 L50 30 L38 18 L25 30 L40 45 L15 70 Z"
          fill="#0284c7"
        />
        {/* Chevron Magenta supérieur */}
        <path d="M50 30 L75 5 L88 18 L63 42 L75 54 L62 67 L38 42 Z" fill="#c026d3" />
      </svg>

      <div className="leading-tight">
        <span className={`${titleSize} font-black tracking-tight text-[#0b192c] leading-none block`}>
          ENR<span className="text-[#0284c7] font-extrabold ml-1">COURTAGE</span>
        </span>
        {showSubtitle && (
          <span className={`${subSize} tracking-wider uppercase font-bold text-slate-500 block mt-0.5`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
