import React from 'react';
import {
  Shield,
  Building,
  Fuel,
  Train,
  PhoneCall,
  Navigation,
  CheckCircle2,
  MapPin,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { SafeHaven, findNearestSafeHavens } from '../utils/safetyMath';
import { AppTheme } from '../utils/themeConfig';

interface SafeHavensPanelProps {
  havens: SafeHaven[];
  userLat: number;
  userLng: number;
  onRerouteToHaven: (haven: SafeHaven) => void;
  theme: AppTheme;
}

export const SafeHavensPanel: React.FC<SafeHavensPanelProps> = ({
  havens,
  userLat,
  userLng,
  onRerouteToHaven,
  theme,
}) => {
  const sortedHavens = findNearestSafeHavens(userLat, userLng, havens);

  const getHavenIcon = (type: SafeHaven['type']) => {
    switch (type) {
      case 'police_pink_booth':
        return <span className="text-lg">🌸</span>;
      case 'pharmacy_247':
        return <Building size={18} className="text-emerald-400" />;
      case 'fuel_station':
        return <Fuel size={18} className="text-amber-400" />;
      case 'metro_cisf':
        return <Train size={18} className="text-sky-400" />;
    }
  };

  const getHavenBadge = (type: SafeHaven['type']) => {
    switch (type) {
      case 'police_pink_booth':
        return { label: '🌸 All-Women Staff Desk', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'pharmacy_247':
        return { label: '24/7 Medical Hub', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'fuel_station':
        return { label: 'Lit 24hr Station', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'metro_cisf':
        return { label: 'CISF Security Gate', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
    }
  };

  return (
    <div className={`flex flex-col h-full ${theme.bgApp} ${theme.textPrimary} overflow-y-auto`}>
      {/* Top Banner */}
      <div className={`p-3.5 ${theme.bgHeader} border-b ${theme.borderBase} space-y-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Shield size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Safe Havens & 24/7 Sanctuaries</span>
              </h2>
              <p className={`text-[10px] ${theme.textMuted}`}>
                Verified staffed & CCTV-monitored safe zones in walking range
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${theme.sisterhoodBadge}`}>
            {sortedHavens.length} Sanctuaries
          </span>
        </div>

        <div className={`p-2.5 rounded-xl text-[11px] border ${theme.borderHighlight} bg-rose-500/10 text-rose-200 flex items-center gap-2`}>
          <HeartHandshake size={15} className="shrink-0 text-rose-400" />
          <span>
            If you ever feel unsafe or followed, head immediately to any of these illuminated safe points. Staff are on duty to shelter you.
          </span>
        </div>
      </div>

      {/* Havens List */}
      <div className="p-3 space-y-2.5">
        {sortedHavens.map((haven) => {
          const badge = getHavenBadge(haven.type);
          const dist = haven.distanceMeters ?? 300;
          const walkMinutes = Math.max(1, Math.round(dist / 75));
          const isPinkBooth = haven.type === 'police_pink_booth';

          return (
            <div
              key={haven.id}
              className={`p-3.5 rounded-2xl ${theme.bgCard} border ${
                isPinkBooth ? 'border-rose-500/50 ring-1 ring-rose-500/30 shadow-rose-500/20' : theme.borderBase
              } hover:${theme.borderHighlight} transition space-y-2.5 text-xs shadow-md`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${isPinkBooth ? 'bg-rose-500/20 border-rose-500/40' : 'bg-black/20 border-slate-800'} border flex items-center justify-center shrink-0 mt-0.5`}>
                    {getHavenIcon(haven.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs leading-tight">
                      {haven.name}
                    </h3>
                    <div className={`text-[10px] ${theme.textMuted} flex items-center gap-1 mt-0.5`}>
                      <MapPin size={10} className="shrink-0" />
                      <span>{haven.address}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <div className="text-[11px] font-mono font-bold text-rose-300 mt-1">
                    {dist}m ({walkMinutes} min walk)
                  </div>
                </div>
              </div>

              {/* Haven security verification markers */}
              <div className={`flex items-center gap-3 text-[10px] ${theme.textMuted} font-medium pt-0.5`}>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={11} /> 24/7 Open
                </span>
                <span className="flex items-center gap-1 text-sky-400">
                  <CheckCircle2 size={11} /> CCTV Monitored
                </span>
                <span className="flex items-center gap-1 text-rose-300">
                  <CheckCircle2 size={11} /> Staff on Duty
                </span>
              </div>

              {/* Action buttons */}
              <div className={`grid grid-cols-2 gap-2 pt-1 border-t ${theme.borderBase}`}>
                <button
                  onClick={() => onRerouteToHaven(haven)}
                  className={`py-2 px-2.5 rounded-xl ${theme.accentBg} text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md ${theme.accentGlow} transition cursor-pointer active:scale-95`}
                >
                  <Navigation size={12} />
                  <span>Escort to Sanctuary</span>
                </button>

                <a
                  href={`tel:${haven.contactPhone.split('/')[0].trim()}`}
                  className={`py-2 px-2.5 rounded-xl ${theme.bgApp} border ${theme.borderBase} hover:bg-slate-800 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer`}
                >
                  <PhoneCall size={12} className="text-rose-400" />
                  <span>Call Desk</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
