import React from 'react';
import {
  Grid3X3,
  ShieldCheck,
  Lightbulb,
  Users,
  AlertTriangle,
  Clock,
  EyeOff,
  Sparkles,
  Info
} from 'lucide-react';
import { H3HexCell } from '../data/mockData';

interface H3HeatmapPanelProps {
  hexCells: H3HexCell[];
  selectedHexCell: H3HexCell | null;
  onSelectHexCell: (cell: H3HexCell) => void;
  activeHeatmapLayer: 'safety' | 'lighting' | 'crowd' | 'incidents';
  setActiveHeatmapLayer: (layer: 'safety' | 'lighting' | 'crowd' | 'incidents') => void;
  currentHour: number;
  setCurrentHour: (hour: number) => void;
}

export const H3HeatmapPanel: React.FC<H3HeatmapPanelProps> = ({
  hexCells,
  selectedHexCell,
  onSelectHexCell,
  activeHeatmapLayer,
  setActiveHeatmapLayer,
  currentHour,
  setCurrentHour,
}) => {
  const layerOptions = [
    { id: 'safety' as const, label: 'Safety Index', icon: ShieldCheck, desc: 'Composite safety rating' },
    { id: 'lighting' as const, label: 'Street Lighting', icon: Lightbulb, desc: 'Illumination & lux levels' },
    { id: 'crowd' as const, label: 'Active Footfall', icon: Users, desc: 'Open shops & pedestrians' },
    { id: 'incidents' as const, label: 'Reported Hazards', icon: AlertTriangle, desc: 'Recent audit alerts' },
  ];

  const getHourLabel = (h: number) => {
    if (h === 14) return '14:00 (Afternoon)';
    if (h === 18) return '18:30 (Sunset / Dusk)';
    if (h === 21) return '21:00 (Evening Peak Risk)';
    if (h === 1) return '01:00 (Late Night)';
    return `${h.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 text-slate-100 overflow-y-auto">
      {/* Header Bar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Grid3X3 size={15} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100">
                Hyper-Local Safety Grid
              </h2>
              <p className="text-[10px] text-slate-400">
                150-meter neighborhood zones · Privacy-protected & anonymous
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-full border border-slate-800 text-[10px] text-slate-300">
            <EyeOff size={11} className="text-emerald-400" />
            <span>Zero-PII</span>
          </div>
        </div>

        {/* Heatmap Layer Selector */}
        <div className="grid grid-cols-2 gap-1.5">
          {layerOptions.map((opt) => {
            const isSelected = activeHeatmapLayer === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveHeatmapLayer(opt.id)}
                className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon size={13} />
                </div>
                <div>
                  <div className={`text-xs ${isSelected ? 'font-bold text-white' : 'font-medium'}`}>
                    {opt.label}
                  </div>
                  <div className="text-[9px] text-slate-400">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Time of Day Simulation Bar */}
        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Clock size={11} className="text-rose-400" />
              <span>Simulated Hour:</span>
            </span>
            <span className="font-mono text-rose-300 font-bold">
              {getHourLabel(currentHour)}
            </span>
          </div>

          <div className="flex gap-1">
            {[14, 18, 21, 1].map((h) => (
              <button
                key={h}
                onClick={() => setCurrentHour(h)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                  currentHour === h
                    ? 'bg-rose-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {h === 1 ? '1 AM' : `${h}:00`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hex Grid Cell Details / Inspector */}
      <div className="p-3 space-y-3">
        {selectedHexCell ? (
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                Zone #{selectedHexCell.id.slice(0, 10)}
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  selectedHexCell.riskLevel === 'safe'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : selectedHexCell.riskLevel === 'caution'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}
              >
                {selectedHexCell.riskLevel.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block">Safety Score</span>
                <strong className="text-white font-mono text-sm">
                  {(selectedHexCell.safetyScore * 100).toFixed(0)}%
                </strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block">Street Lighting</span>
                <strong className="text-white font-mono text-sm">
                  {(selectedHexCell.lightingIndex * 100).toFixed(0)}%
                </strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block">Active Footfall</span>
                <strong className="text-white font-mono text-sm">
                  {(selectedHexCell.crowdIndex * 100).toFixed(0)}%
                </strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block">Reported Incidents</span>
                <strong className="text-white font-mono text-sm">
                  {selectedHexCell.incidentCount} reports
                </strong>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
              {selectedHexCell.lastAuditedText}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs space-y-1">
            <Info size={16} className="mx-auto text-slate-600" />
            <p>Tap any hexagon on the map to inspect its real-time lighting and safety rating.</p>
          </div>
        )}

        {/* Legend */}
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
          <div className="font-bold text-xs text-white mb-1">Safety Level Legend:</div>
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-3 h-3 rounded-md bg-emerald-500/40 border border-emerald-400 shrink-0" />
            <span>Well-Lit Safe Corridor (&gt;75% safety)</span>
          </div>
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-3 h-3 rounded-md bg-amber-500/40 border border-amber-400 shrink-0" />
            <span>Moderate / Quiet Evening Stretch (45–75%)</span>
          </div>
          <div className="flex items-center gap-2 text-red-300">
            <span className="w-3 h-3 rounded-md bg-red-500/40 border border-red-400 shrink-0" />
            <span>High Risk / Unlit Spot / Reported Hazard (&lt;45%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
