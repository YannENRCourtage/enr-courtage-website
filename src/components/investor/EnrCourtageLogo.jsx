import React from 'react';

export default function EnrCourtageLogo({
  size = 'md',
  className = '',
  onClick,
}) {
  const heightClass = size === 'sm' ? 'h-9' : size === 'lg' ? 'h-13' : 'h-10 sm:h-11';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
    >
      <img
        src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/7bd0f511a5866b092d723a1035903e1a.png"
        alt="Logo ENR COURTAGE"
        className={`${heightClass} w-auto object-contain`}
        loading="eager"
      />
    </div>
  );
}
