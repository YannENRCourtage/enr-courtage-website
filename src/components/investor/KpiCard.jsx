import React from 'react';
import { Sun, Battery, FileText, Tags, ShieldCheck, Zap, TrendingUp, Landmark } from 'lucide-react';

const iconMap = {
  Sun,
  Battery,
  FileText,
  Tags,
  ShieldCheck,
  Zap,
  TrendingUp,
  Landmark,
};

export default function KpiCard({
  title,
  value,
  subtitle,
  badge,
  icon,
  variant = 'amber', // 'amber' | 'cyan' | 'emerald' | 'blue'
  className = '',
}) {
  const IconComponent = typeof icon === 'string' ? (iconMap[icon] || TrendingUp) : icon;

  const colorStyles = {
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/50',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]',
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/50',
      text: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      glow: 'shadow-[0_0_20px_-5px_rgba(6,182,212,0.2)]',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/50',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/50',
      text: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      glow: 'shadow-[0_0_20px_-5px_rgba(37,99,235,0.2)]',
    },
  };

  const currentStyle = colorStyles[variant] || colorStyles.amber;

  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border transition-all duration-200 ${currentStyle.border} ${currentStyle.glow} ${className}`}
    >
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-1.5">
        <span className={currentStyle.text}>{title}</span>
        {IconComponent && <IconComponent className={`w-4 h-4 ${currentStyle.text}`} />}
      </div>

      <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {value}
      </div>

      <div className="text-xs text-gray-400 mt-1 flex items-center justify-between gap-2">
        {subtitle && <span>{subtitle}</span>}
        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentStyle.badgeBg}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
