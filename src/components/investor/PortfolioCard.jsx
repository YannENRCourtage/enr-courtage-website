import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Battery, ArrowRight, Lock, CheckCircle2, ShieldCheck, FileCheck, Landmark, Tags, Zap, Filter } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';

export default function PortfolioCard({ portfolio, onOpenDataRoom }) {
  const navigate = useNavigate();
  const { soldSites, deletedSites, customSites } = useInvestorStore();

  const isPv = portfolio.type === 'PV';
  const portfolioKey = isPv ? 'helios' : 'volta';
  const IconComponent = isPv ? Sun : Battery;

  const currentSold = soldSites?.[portfolioKey] || [];
  const currentDeleted = deletedSites?.[portfolioKey] || [];
  const currentCustom = customSites?.[portfolioKey] || [];

  const allSitesCombined = React.useMemo(() => {
    return [...(portfolio.sites || []), ...currentCustom].filter((s) => !currentDeleted.includes(s.id));
  }, [portfolio.sites, currentCustom, currentDeleted]);

  const activeSites = React.useMemo(() => {
    return allSitesCombined.filter((s) => !currentSold.includes(s.id));
  }, [allSitesCombined, currentSold]);

  const displaySitesCount = activeSites.length;

  const displayPower = React.useMemo(() => {
    if (isPv) {
      const totalKwc = activeSites.reduce((sum, s) => sum + (Number(s.kwc) || 315), 0);
      return `${(totalKwc / 1000).toFixed(2).replace('.', ',')} MWc`;
    } else {
      const totalKw = activeSites.reduce((sum, s) => sum + (Number(s.kw) || 500), 0);
      return `${(totalKw / 1000).toFixed(2).replace('.', ',')} MW`;
    }
  }, [isPv, activeSites]);

  const displayPowerSub = isPv
    ? `(${activeSites.length} site${activeSites.length > 1 ? 's' : ''} au total)`
    : `${activeSites.length} site${activeSites.length > 1 ? 's' : ''} de 500 kW`;

  // Dynamic PV metrics
  const pvConstrSites = activeSites.filter((s) => s.type === 'Construction');
  const pvConstrPower = pvConstrSites.reduce((sum, s) => sum + (Number(s.kwc) || 315), 0);
  const pvToitSites = activeSites.filter((s) => s.type === 'Toitures');
  const pvToitPower = pvToitSites.reduce((sum, s) => sum + (Number(s.kwc) || 315), 0);

  const dynamicMetric1 = isPv
    ? {
        label: 'Bâtiments Neufs',
        value: `${(pvConstrPower / 1000).toFixed(2).replace('.', ',')} MWc`,
        sub: `${pvConstrSites.length} projet${pvConstrSites.length > 1 ? 's' : ''} neuf${pvConstrSites.length > 1 ? 's' : ''}`,
      }
    : portfolio.kpis.metric1;

  const dynamicMetric2 = isPv
    ? {
        label: 'Toitures Existantes',
        value: `${(pvToitPower / 1000).toFixed(2).replace('.', ',')} MWc`,
        sub: `${pvToitSites.length} rénovation${pvToitSites.length > 1 ? 's' : ''}`,
      }
    : portfolio.kpis.metric2;

  const accentColor = isPv
    ? {
        border: 'border-slate-200 hover:border-amber-400/80 hover:shadow-lg',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        iconBox: 'bg-amber-50 text-amber-700 border-amber-200',
        textAccent: 'text-amber-700',
        button: 'bg-slate-900 hover:bg-slate-800 text-white font-bold',
        glow: 'shadow-xs',
      }
    : {
        border: 'border-slate-200 hover:border-cyan-400/80 hover:shadow-lg',
        badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        iconBox: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        textAccent: 'text-cyan-700',
        button: 'bg-slate-900 hover:bg-slate-800 text-white font-bold',
        glow: 'shadow-xs',
      };

  const handleNavigate = () => {
    navigate(`/investisseurs/portefeuille/${portfolio.id}`);
  };

  return (
    <section
      className={`rounded-2xl bg-white border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${accentColor.border} ${accentColor.glow}`}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${accentColor.badgeBg}`}>
                {portfolio.typeBadge}
              </span>
              <span className="text-xs text-slate-500">
                Vendeur : <strong className="text-slate-800 font-bold">{portfolio.seller}</strong>
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
              {portfolio.name}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shadow-xs ${accentColor.iconBox}`}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 text-xs text-slate-600 leading-relaxed space-y-1.5">
          <p>{portfolio.description}</p>
          {portfolio.descriptionShort && (
            <p className="text-slate-500 font-medium">{portfolio.descriptionShort}</p>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 my-5 py-4 border-y border-slate-200 bg-slate-50 rounded-xl px-3">
          <div className="text-center">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">{portfolio.kpis.totalPowerLabel}</div>
            <div className={`text-xl font-black ${accentColor.textAccent}`}>
              {displayPower}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">{displayPowerSub}</div>
          </div>
          <div className="text-center border-x border-slate-200">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">{dynamicMetric1.label}</div>
            <div className="text-xl font-black text-slate-900">{dynamicMetric1.value}</div>
            <div className="text-[10px] text-slate-500">{dynamicMetric1.sub}</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">{dynamicMetric2.label}</div>
            <div className="text-xl font-black text-emerald-700">{dynamicMetric2.value}</div>
            <div className="text-[10px] text-slate-500">{dynamicMetric2.sub}</div>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-3">
          <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${accentColor.textAccent}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Points Clés d'Investissement
          </h4>

          <ul className="space-y-2.5 text-xs text-slate-700">
            {portfolio.highlights.map((hl, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">{hl.title} : </strong>
                  {hl.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Lock className="w-3 h-3 text-emerald-600" />
          {portfolio.footerNote}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNavigate}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm ${accentColor.button}`}
          >
            <span>Consulter le Teaser & Data Room ({displaySitesCount} sites)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
