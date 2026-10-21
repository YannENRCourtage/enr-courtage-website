import React, { useState, useEffect, useRef } from 'react';

export type PeriodType = 'NUIT' | 'AUBE' | 'PLEIN JOUR' | 'SOIR';
export type MissionId = 'FCR' | 'CAPACITE' | 'DAY_AHEAD' | 'INTRADAY';
export type ActionColorType = 'BLUE' | 'AMBER' | 'CORAL' | 'EMERALD';

export interface HourEntry {
  hour: number;
  period: PeriodType;
  state: 'VEILLE ACTIVE • 50 HZ' | 'SE CHARGE' | 'INJECTE DANS LE RÉSEAU' | 'PRÊTE POUR LA POINTE';
  soc: number;
  mission: MissionId;
  action: ActionColorType;
  priceColor: string;
  narrativeHtml: string;
}

export const OFFICIAL_24H_DATA: HourEntry[] = [
  {
    hour: 0,
    period: 'NUIT',
    state: 'VEILLE ACTIVE • 50 HZ',
    soc: 40,
    mission: 'FCR',
    action: 'BLUE',
    priceColor: '#65a30d',
    narrativeHtml:
      'La nuit est calme. La batterie veille sur le réseau : elle corrige en continu les petits écarts de fréquence, pour que le courant reste exactement à <strong>50 Hz</strong>.',
  },
  {
    hour: 1,
    period: 'NUIT',
    state: 'VEILLE ACTIVE • 50 HZ',
    soc: 40,
    mission: 'FCR',
    action: 'BLUE',
    priceColor: '#65a30d',
    narrativeHtml:
      "Toujours en veille active — c'est elle qui aide le réseau à rester parfaitement stable pendant que le pays dort.",
  },
  {
    hour: 2,
    period: 'NUIT',
    state: 'SE CHARGE',
    soc: 55,
    mission: 'DAY_AHEAD',
    action: 'AMBER',
    priceColor: '#4d7c0f',
    narrativeHtml:
      "L'électricité est <strong>abondante et bon marché</strong>. La batterie fait le plein — un achat programmé la veille, sur le marché <strong>Day-Ahead</strong>.",
  },
  {
    hour: 3,
    period: 'NUIT',
    state: 'SE CHARGE',
    soc: 70,
    mission: 'DAY_AHEAD',
    action: 'AMBER',
    priceColor: '#3f6212',
    narrativeHtml:
      'Elle continue de se remplir tranquillement, au meilleur prix de la nuit.',
  },
  {
    hour: 4,
    period: 'NUIT',
    state: 'SE CHARGE',
    soc: 82,
    mission: 'DAY_AHEAD',
    action: 'AMBER',
    priceColor: '#4d7c0f',
    narrativeHtml:
      'Fin de la recharge nocturne : la batterie est bien remplie.',
  },
  {
    hour: 5,
    period: 'NUIT',
    state: 'VEILLE ACTIVE • 50 HZ',
    soc: 82,
    mission: 'FCR',
    action: 'BLUE',
    priceColor: '#65a30d',
    narrativeHtml:
      'En attendant le réveil du pays, elle reprend sa mission de <strong>stabilisation du réseau</strong>.',
  },
  {
    hour: 6,
    period: 'AUBE',
    state: 'INJECTE DANS LE RÉSEAU',
    soc: 68,
    mission: 'DAY_AHEAD',
    action: 'CORAL',
    priceColor: '#a16207',
    narrativeHtml:
      "La France se réveille, la demande grimpe : la batterie commence à <strong>restituer</strong> l'énergie stockée cette nuit.",
  },
  {
    hour: 7,
    period: 'AUBE',
    state: 'INJECTE DANS LE RÉSEAU',
    soc: 52,
    mission: 'DAY_AHEAD',
    action: 'CORAL',
    priceColor: '#b45309',
    narrativeHtml:
      "Pointe du matin — elle injecte l'énergie achetée pas chère, au moment où le réseau en a besoin.",
  },
  {
    hour: 8,
    period: 'AUBE',
    state: 'INJECTE DANS LE RÉSEAU',
    soc: 42,
    mission: 'DAY_AHEAD',
    action: 'CORAL',
    priceColor: '#b45309',
    narrativeHtml:
      "Dernières ventes de la matinée, avant l'arrivée massive du solaire.",
  },
  {
    hour: 9,
    period: 'PLEIN JOUR',
    state: 'VEILLE ACTIVE • 50 HZ',
    soc: 42,
    mission: 'FCR',
    action: 'BLUE',
    priceColor: '#a16207',
    narrativeHtml:
      'Pause sur les marchés : la batterie <strong>stabilise la fréquence</strong> du réseau.',
  },
  {
    hour: 10,
    period: 'PLEIN JOUR',
    state: 'SE CHARGE',
    soc: 58,
    mission: 'DAY_AHEAD',
    action: 'AMBER',
    priceColor: '#4d7c0f',
    narrativeHtml:
      "<strong>Plein soleil</strong> : les panneaux produisent en masse, l'électricité redevient très bon marché — la batterie se recharge.",
  },
  {
    hour: 11,
    period: 'PLEIN JOUR',
    state: 'SE CHARGE',
    soc: 74,
    mission: 'DAY_AHEAD',
    action: 'AMBER',
    priceColor: '#15803d',
    narrativeHtml: 'Elle continue de stocker ce surplus solaire...',
  },
  {
    hour: 12,
    period: 'PLEIN JOUR',
    state: 'SE CHARGE',
    soc: 90,
    mission: 'DAY_AHEAD',
    action: 'AMBER',
    priceColor: '#166534',
    narrativeHtml: '...et se remplit pendant que les prix sont au plus bas.',
  },
  {
    hour: 13,
    period: 'PLEIN JOUR',
    state: 'SE CHARGE',
    soc: 100,
    mission: 'INTRADAY',
    action: 'AMBER',
    priceColor: '#14532d',
    narrativeHtml:
      "Il y a même <strong>trop</strong> d'électricité : les prix deviennent négatifs. Sur le marché <strong>Intraday</strong>, la batterie est <strong>payée pour se charger</strong> !",
  },
  {
    hour: 14,
    period: 'PLEIN JOUR',
    state: 'PRÊTE POUR LA POINTE',
    soc: 100,
    mission: 'CAPACITE',
    action: 'EMERALD',
    priceColor: '#15803d',
    narrativeHtml:
      "Batterie pleine. Elle se déclare <strong>disponible pour la pointe du soir</strong> : c'est le mécanisme de capacité.",
  },
  {
    hour: 15,
    period: 'PLEIN JOUR',
    state: 'INJECTE DANS LE RÉSEAU',
    soc: 90,
    mission: 'INTRADAY',
    action: 'CORAL',
    priceColor: '#65a30d',
    narrativeHtml:
      'Une occasion se présente en temps réel : petite vente sur le marché <strong>Intraday</strong>.',
  },
  {
    hour: 16,
    period: 'PLEIN JOUR',
    state: 'VEILLE ACTIVE • 50 HZ',
    soc: 90,
    mission: 'FCR',
    action: 'BLUE',
    priceColor: '#a16207',
    narrativeHtml:
      'Retour en veille active : elle stabilise la fréquence en attendant le soir.',
  },
  {
    hour: 17,
    period: 'SOIR',
    state: 'PRÊTE POUR LA POINTE',
    soc: 90,
    mission: 'CAPACITE',
    action: 'EMERALD',
    priceColor: '#b45309',
    narrativeHtml:
      'Avant la grande pointe, elle reste <strong>en réserve</strong> — son engagement de capacité envers le réseau.',
  },
  {
    hour: 18,
    period: 'SOIR',
    state: 'INJECTE DANS LE RÉSEAU',
    soc: 68,
    mission: 'DAY_AHEAD',
    action: 'CORAL',
    priceColor: '#c2410c',
    narrativeHtml:
      "Toute la France rentre à la maison, cuisine et s'éclaire : la batterie <strong>injecte massivement</strong> son énergie.",
  },
  {
    hour: 19,
    period: 'SOIR',
    state: 'INJECTE DANS LE RÉSEAU',
    soc: 44,
    mission: 'DAY_AHEAD',
    action: 'CORAL',
    priceColor: '#b91c1c',
    narrativeHtml:
      "<strong>Pic de consommation</strong> : c'est maintenant que son énergie est la plus précieuse pour le réseau.",
  },
  {
    hour: 20,
    period: 'SOIR',
    state: 'INJECTE DANS LE RÉSEAU',
    soc: 24,
    mission: 'DAY_AHEAD',
    action: 'CORAL',
    priceColor: '#991b1b',
    narrativeHtml:
      "La pointe se prolonge — elle continue d'alimenter le réseau.",
  },
  {
    hour: 21,
    period: 'NUIT',
    state: 'INJECTE DANS LE RÉSEAU',
    soc: 12,
    mission: 'INTRADAY',
    action: 'CORAL',
    priceColor: '#b45309',
    narrativeHtml:
      'Fin de soirée : derniers ajustements sur le marché <strong>Intraday</strong>.',
  },
  {
    hour: 22,
    period: 'NUIT',
    state: 'VEILLE ACTIVE • 50 HZ',
    soc: 12,
    mission: 'FCR',
    action: 'BLUE',
    priceColor: '#a16207',
    narrativeHtml:
      'Le calme revient. La batterie, presque vide, reprend la surveillance de la fréquence.',
  },
  {
    hour: 23,
    period: 'NUIT',
    state: 'VEILLE ACTIVE • 50 HZ',
    soc: 12,
    mission: 'FCR',
    action: 'BLUE',
    priceColor: '#65a30d',
    narrativeHtml:
      "Minuit approche. Demain, tout recommence : <strong>charger quand l'électricité abonde, la restituer quand le pays en a besoin.</strong>",
  },
];

const ACTION_COLOR_HEX: Record<ActionColorType, string> = {
  BLUE: '#2997ff',
  AMBER: '#f59e0b',
  CORAL: '#f45b69',
  EMERALD: '#10b981',
};

interface MissionCardConfig {
  id: MissionId;
  title: string;
  description: string;
  dotColor: string;
  borderColor: string;
  badgeColor: string;
}

const MISSION_CARDS: MissionCardConfig[] = [
  {
    id: 'FCR',
    title: 'Régulation de fréquence',
    description:
      'La batterie stabilise le réseau seconde par seconde, pour maintenir le courant exactement à 50 Hz.',
    dotColor: '#0ea5e9',
    borderColor: '#0ea5e9',
    badgeColor: '#0ea5e9',
  },
  {
    id: 'CAPACITE',
    title: 'Mécanisme de capacité',
    description:
      "Elle garantit d'être disponible et chargée aux heures où la France consomme le plus.",
    dotColor: '#10b981',
    borderColor: '#10b981',
    badgeColor: '#10b981',
  },
  {
    id: 'DAY_AHEAD',
    title: 'Marché Day-Ahead',
    description:
      "La veille, elle programme ses achats quand l'électricité est abondante — et ses ventes aux heures chères.",
    dotColor: '#f59e0b',
    borderColor: '#f59e0b',
    badgeColor: '#f59e0b',
  },
  {
    id: 'INTRADAY',
    title: 'Marché Intraday',
    description:
      "En cours de journée, elle saisit les occasions de dernière minute, au fil de l'eau.",
    dotColor: '#f59e0b',
    borderColor: '#f59e0b',
    badgeColor: '#f59e0b',
  },
];

const TICK_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

export interface Bess24hInteractiveTimelineProps {
  defaultHour?: number;
}

export default function Bess24hInteractiveTimeline({
  defaultHour = 0,
}: Bess24hInteractiveTimelineProps) {
  const [hour, setHour] = useState<number>(defaultHour);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = OFFICIAL_24H_DATA[hour] || OFFICIAL_24H_DATA[0];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setHour((prev) => (prev + 1) % 24);
      }, 1500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const formattedHourLabel = `${String(hour).padStart(2, '0')} h`;
  const formattedTimeCallout = `${String(hour).padStart(2, '0')}:00`;

  const getPeriodDotColor = (period: PeriodType): string => {
    switch (period) {
      case 'NUIT':
        return '#64748b';
      case 'AUBE':
        return '#f97316';
      case 'PLEIN JOUR':
        return '#f59e0b';
      case 'SOIR':
        return '#ea580c';
    }
  };

  return (
    <div className="w-full bg-[#07090e] border border-[#1e293b] rounded-2xl p-5 sm:p-8 text-slate-100 shadow-2xl select-none">
      <style>{`
        @keyframes bessDotCharge {
          0%, 100% { opacity: 0.25; transform: translateX(-4px) scale(0.85); }
          50% { opacity: 1; transform: translateX(4px) scale(1.15); }
        }
        @keyframes bessDotInject {
          0%, 100% { opacity: 0.25; transform: translateX(4px) scale(0.85); }
          50% { opacity: 1; transform: translateX(-4px) scale(1.15); }
        }
        @keyframes bessDotIdle {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 0.95; transform: scale(1.1); }
        }
        .bess-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 3px;
          background: #1e293b;
          border-radius: 9999px;
          outline: none;
        }
        .bess-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #f59e0b;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.55);
          transition: transform 0.15s ease;
        }
        .bess-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .bess-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border: none;
          border-radius: 9999px;
          background: #f59e0b;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.55);
          transition: transform 0.15s ease;
        }
      `}</style>

      {/* A. EN-TÊTE & BARRE DE CONTRÔLE TEMPORELLE */}
      <div className="border-b border-[#161e2e] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"
            style={{ boxShadow: '0 0 8px #10b981' }}
          />
          <h2 className="font-mono text-xs sm:text-sm uppercase tracking-[0.22em] text-amber-500 font-semibold">
            24 HEURES DANS LA VIE D&apos;UNE BATTERIE
          </h2>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Une journée type, expliquée simplement
        </p>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 mb-5">
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          className="bg-[#d97706] hover:bg-[#f59e0b] text-[#05070b] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-md transition cursor-pointer shrink-0 shadow-md"
        >
          {isPlaying ? 'Pause' : 'Suivre la journée'}
        </button>

        <div className="flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={23}
            step={1}
            value={hour}
            onChange={(e) => setHour(parseInt(e.target.value, 10))}
            className="bess-slider"
            aria-label="Sélectionner l'heure de la journée"
          />
        </div>

        <div className="font-mono text-amber-500 text-base sm:text-lg font-medium shrink-0 min-w-[46px] text-right">
          {formattedHourLabel}
        </div>
      </div>

      {/* B. SYNOPTIQUE ANIMÉ (LE RÉSEAU ÉLECTRIQUE <-> BESS) */}
      <div className="bg-[#05070b] border border-[#141b29] rounded-lg px-4 py-6 mb-4 relative flex items-center justify-center">
        {/* Badge d'ambiance en haut à droite */}
        <div className="absolute top-3 right-4 flex items-center gap-2 font-mono text-[10px] sm:text-[11px] tracking-[0.15em] text-slate-400 uppercase">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{
              backgroundColor: getPeriodDotColor(current.period),
              boxShadow: `0 0 6px ${getPeriodDotColor(current.period)}`,
            }}
          />
          <span>{current.period}</span>
        </div>

        <div className="flex items-center justify-center gap-7 sm:gap-14 pt-2 sm:pt-0">
          {/* Gauche : Pylône Haute Tension + Légende */}
          <div className="flex flex-col items-center text-center">
            <svg
              viewBox="0 0 36 44"
              className="w-8 h-10 text-slate-400 stroke-current"
              fill="none"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="3" x2="18" y2="39" />
              <line x1="8" y1="11" x2="28" y2="11" />
              <line x1="5" y1="20" x2="31" y2="20" />
              <line x1="14" y1="5" x2="9" y2="39" />
              <line x1="22" y1="5" x2="27" y2="39" />
              <line x1="13" y1="11" x2="24" y2="20" />
              <line x1="23" y1="11" x2="12" y2="20" />
              <line x1="11" y1="20" x2="25" y2="32" />
              <line x1="25" y1="20" x2="11" y2="32" />
              <line x1="6" y1="39" x2="30" y2="39" />
            </svg>
            <span className="font-mono text-[11px] text-slate-300 mt-2 tracking-wide">
              Le réseau électrique
            </span>
          </div>

          {/* Centre : 3 points lumineux animés + texte d'état */}
          <div className="flex flex-col items-center justify-center text-center min-w-[145px] sm:min-w-[185px]">
            <div className="flex items-center justify-center gap-2.5 mb-2.5 h-4">
              {[0, 1, 2].map((idx) => {
                let dotBg = '#64748b';
                let animStyle: React.CSSProperties = {
                  animation: `bessDotIdle 1.6s infinite ease-in-out ${idx * 0.25}s`,
                };

                if (current.state === 'SE CHARGE') {
                  dotBg = '#f59e0b';
                  animStyle = {
                    animation: `bessDotCharge 1.1s infinite ease-in-out ${idx * 0.22}s`,
                    boxShadow: '0 0 8px rgba(245, 158, 11, 0.8)',
                  };
                } else if (current.state === 'INJECTE DANS LE RÉSEAU') {
                  dotBg = '#10b981';
                  animStyle = {
                    animation: `bessDotInject 1.1s infinite ease-in-out ${(2 - idx) * 0.22}s`,
                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
                  };
                } else if (current.state === 'PRÊTE POUR LA POINTE') {
                  dotBg = '#10b981';
                  animStyle = {
                    animation: `bessDotIdle 1.4s infinite ease-in-out ${idx * 0.25}s`,
                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                  };
                } else {
                  dotBg = '#64748b';
                }

                return (
                  <span
                    key={idx}
                    className="w-2 h-2 rounded-full inline-block"
                    style={{
                      backgroundColor: dotBg,
                      ...animStyle,
                    }}
                  />
                );
              })}
            </div>

            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] text-slate-400 uppercase">
              {current.state}
            </span>
          </div>

          {/* Droite : Batterie verticale avec jauge SoC ambre + label BESS */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex flex-col items-center">
              {/* Borne supérieure */}
              <div className="w-3.5 h-1 bg-slate-400 rounded-t-[2px] mb-[1px]" />

              {/* Corps de la batterie */}
              <div className="relative w-9 h-11 border border-slate-400 rounded-[3px] p-[2px] flex flex-col justify-end bg-[#07090e]">
                {/* Petit connecteur latéral gauche */}
                <div className="absolute -left-2.5 top-1.5 w-2 h-[2px] bg-slate-300 rounded-full" />

                {/* Jauge de remplissage ambre animée */}
                <div
                  className="w-full rounded-[1px] transition-all duration-500 ease-out"
                  style={{
                    height: `${ current.soc }%`,
                    backgroundColor: '#d97706',
                  }}
                />

                {/* Pourcentage au centre */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="font-mono text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {current.soc} %
                  </span>
                </div>
              </div>
            </div>
            <span className="font-mono text-[11px] text-slate-300 mt-2 tracking-wide">
              BESS
            </span>
          </div>
        </div>
      </div>

      {/* C. ENCADRÉ NARRATIF HORODATÉ (CALLOUT) */}
      <div className="bg-[#05070b] border border-[#141b29] border-l-4 border-l-amber-500 rounded-r-lg px-5 py-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
        <span className="font-mono text-lg sm:text-xl font-semibold text-amber-500 shrink-0">
          {formattedTimeCallout}
        </span>
        <p
          className="text-slate-300 text-xs sm:text-sm leading-relaxed [&_strong]:text-white [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: current.narrativeHtml }}
        />
      </div>

      {/* D. GRILLE DES 4 CARTES DE MISSIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {MISSION_CARDS.map((card) => {
          const isActive = current.mission === card.id;
          return (
            <div
              key={card.id}
              className={`rounded-lg p-4 bg-[#05070b] transition-all duration-300 flex flex-col justify-between ${
                isActive ? 'opacity-100 shadow-lg' : 'opacity-45 border border-[#141b29]'
              }`}
              style={
                isActive
                  ? {
                      border: `1px solid ${card.borderColor}`,
                      boxShadow: `0 0 18px -6px ${card.borderColor}`,
                    }
                  : undefined
              }
            >
              <div>
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block mb-2.5"
                  style={{ backgroundColor: card.dotColor }}
                />
                <h3
                  className={`font-serif text-sm font-bold mb-2 ${
                    isActive ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-3 pt-1 min-h-[18px]">
                {isActive && (
                  <span
                    className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold block"
                    style={{ color: card.badgeColor }}
                  >
                    EN MISSION
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* E. DOUBLE FRISE INTERACTIVE DE 24 HEURES (00h à 23h) */}
      <div>
        {/* Ligne supérieure : Prix de l'électricité */}
        <div className="font-mono text-[11px] sm:text-xs text-slate-200 mb-2">
          Prix de l&apos;électricité{' '}
          <span className="text-slate-500">
            • vert = bon marché, rouge = cher — cliquez sur une heure
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
            gap: '3px',
          }}
        >
          {OFFICIAL_24H_DATA.map((item) => {
            const isSelected = item.hour === hour;
            return (
              <button
                key={`price-${item.hour}`}
                type="button"
                onClick={() => setHour(item.hour)}
                className={`h-6 rounded-[2px] cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-white scale-110 z-10' : 'hover:opacity-85'
                }`}
                style={{ backgroundColor: item.priceColor }}
                title={`${String(item.hour).padStart(2, '0')}:00`}
                aria-label={`Prix à ${String(item.hour).padStart(2, '0')} heures`}
              />
            );
          })}
        </div>

        {/* Ligne inférieure : Ce que fait la batterie */}
        <div className="font-mono text-[11px] sm:text-xs text-slate-200 mt-4 mb-2">
          Ce que fait la batterie
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
            gap: '3px',
          }}
        >
          {OFFICIAL_24H_DATA.map((item) => {
            const isSelected = item.hour === hour;
            return (
              <button
                key={`action-${item.hour}`}
                type="button"
                onClick={() => setHour(item.hour)}
                className={`h-6 rounded-[2px] cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-white scale-110 z-10' : 'hover:opacity-85'
                }`}
                style={{ backgroundColor: ACTION_COLOR_HEX[item.action] }}
                title={`${String(item.hour).padStart(2, '0')}:00 — ${item.state}`}
                aria-label={`Action batterie à ${String(item.hour).padStart(2, '0')} heures`}
              />
            );
          })}
        </div>

        {/* Repères horaires sous la 2e barre : 00, 03, 06, 09, 12, 15, 18, 21 */}
        <div
          className="mt-1.5"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
            gap: '3px',
          }}
        >
          {OFFICIAL_24H_DATA.map((item) => (
            <div
              key={`tick-${item.hour}`}
              className="font-mono text-[10px] text-slate-500 text-left"
            >
              {TICK_HOURS.includes(item.hour)
                ? String(item.hour).padStart(2, '0')
                : ''}
            </div>
          ))}
        </div>

        {/* Légende en bas sur une ligne */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-[2px] inline-block shrink-0"
              style={{ backgroundColor: ACTION_COLOR_HEX.AMBER }}
            />
            <span>Se charge quand c&apos;est bon marché</span>
          </span>

          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-[2px] inline-block shrink-0"
              style={{ backgroundColor: ACTION_COLOR_HEX.CORAL }}
            />
            <span>Restitue quand c&apos;est cher</span>
          </span>

          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-[2px] inline-block shrink-0"
              style={{ backgroundColor: ACTION_COLOR_HEX.BLUE }}
            />
            <span>Stabilise la fréquence (50 Hz)</span>
          </span>

          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-[2px] inline-block shrink-0"
              style={{ backgroundColor: ACTION_COLOR_HEX.EMERALD }}
            />
            <span>Se tient prête pour la pointe</span>
          </span>
        </div>
      </div>
    </div>
  );
}
