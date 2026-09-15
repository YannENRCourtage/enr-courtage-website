import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Battery, ArrowRight, Lock, CheckCircle2, ShieldCheck, FileCheck, Landmark, Tags, Zap } from 'lucide-react';

const iconMap = {
  Sun,
  Battery,
  ShieldCheck,
  FileCheck,
  Landmark,
  Tags,
  Zap,
  Lock,
  CheckCircle2,
};

export default function PortfolioCard({ portfolio, onOpenDataRoom }) {
  const navigate = useNavigate();

  const isPv = portfolio.type === 'PV';
  const IconComponent = isPv ? Sun : Battery;

  const accentColor = isPv
    ? {
        border: 'border-amber-500/30 hover:border-amber-500/60',
        glow: 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]',
        badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        iconBox: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        textAccent: 'text-amber-400',
        button: 'text-amber-400 hover:text-amber-300',
      }
    : {
        border: 'border-cyan-500/30 hover:border-cyan-500/60',
        glow: 'shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]',
        badgeBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
        iconBox: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
        textAccent: 'text-cyan-400',
        button: 'text-cyan-400 hover:text-cyan-300',
      };

  const handleNavigate = () => {
    navigate(`/investisseurs/portefeuille/${portfolio.id}`);
  };

  return (
    <section
      className={`rounded-2xl bg-gradient-to-b from-[#111827] to-[#0c1220] border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${accentColor.border} ${accentColor.glow}`}
    >
      {/* Background glow circle */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isPv ? 'bg-amber-500/10' : 'bg-cyan-500/10'
        }`}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${accentColor.badgeBg}`}>
                {portfolio.typeBadge}
              </span>
              <span className="text-xs text-gray-400">
                Vendeur : <strong className="text-gray-200">{portfolio.seller}</strong>
              </span>
            </div>
            <h3 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              {portfolio.name}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shadow-inner ${accentColor.iconBox}`}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 text-xs text-gray-300 leading-relaxed space-y-2">
          <p>{portfolio.description}</p>
          {portfolio.descriptionShort && (
            <p className="text-gray-400">{portfolio.descriptionShort}</p>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 my-5 py-4 border-y border-gray-800/80 bg-gray-900/60 rounded-xl px-3">
          <div className="text-center">
            <div className="text-[11px] text-gray-400 uppercase font-medium">{portfolio.kpis.totalPowerLabel}</div>
            <div className={`text-xl font-bold ${accentColor.textAccent}`}>
              {portfolio.kpis.totalPower}
            </div>
            {portfolio.kpis.totalPowerSub && (
              <div className="text-[10px] text-gray-500">{portfolio.kpis.totalPowerSub}</div>
            )}
          </div>
          <div className="text-center border-x border-gray-800">
            <div className="text-[11px] text-gray-400 uppercase font-medium">{portfolio.kpis.metric1.label}</div>
            <div className="text-xl font-bold text-white">{portfolio.kpis.metric1.value}</div>
            <div className="text-[10px] text-gray-400">{portfolio.kpis.metric1.sub}</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-gray-400 uppercase font-medium">{portfolio.kpis.metric2.label}</div>
            <div className="text-xl font-bold text-emerald-400">{portfolio.kpis.metric2.value}</div>
            <div className="text-[10px] text-gray-400">{portfolio.kpis.metric2.sub}</div>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-3">
          <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${accentColor.textAccent}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Points Clés d'Investissement
          </h4>

          <ul className="space-y-2.5 text-xs text-gray-300">
            {portfolio.highlights.map((hl, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">{hl.title} : </strong>
                  {hl.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Lock className="w-3 h-3 text-emerald-400" />
          {portfolio.footerNote}
        </span>
        <div className="flex items-center space-x-2">
          {onOpenDataRoom && (
            <button
              onClick={() => onOpenDataRoom(portfolio)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" /> Data Room
            </button>
          )}
          <button
            onClick={handleNavigate}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition flex items-center gap-1.5 ${accentColor.button}`}
          >
            <span>Détail & Sites ({portfolio.sites.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </section>
  );
}
