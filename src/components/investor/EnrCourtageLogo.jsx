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
        src="/logo-enr-courtage.png"
        alt="Logo ENR COURTAGE"
        className={`${heightClass} w-auto object-contain`}
        loading="eager"
      />
    </div>
  );
}
