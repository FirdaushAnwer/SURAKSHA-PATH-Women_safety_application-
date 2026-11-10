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
    { id: 'safety' as const, label: 'Safety Index', icon: ShieldCheck, desc: 'Composite S(e,t) metric' },
    { id: 'lighting' as const, label: 'Lighting / Lux', icon: Lightbulb, desc: 'Street illumination' },
    { id: 'crowd' as const, label: 'Crowd Density', icon: Users, desc: 'Diurnal pedestrian presence' },
    { id: 'incidents' as const, label: 'Incident Heat', icon: AlertTriangle, desc: 'Decayed reports' },
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
                Uber H3 Resolution 9 Heatmap
              </h2>
              <p className="text-[10px] text-slate-400">
                150m Hexagonal cells · k-anonymity ≥ 3
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

        {/* Time of Day Slider (Diurnal Decay Simulation) */}
        <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Clock size={11} /> Diurnal Time Filter (t)
            </span>
            <span className="text-emerald-400 font-bold font-mono text-[11px]">
              {getHourLabel(currentHour)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={23}
            value={currentHour}
            onChange={(e) => setCurrentHour(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>00:00 (Dark)</span>
            <span>08:00 (Morning)</span>
            <span>14:00 (Day)</span>
            <span>21:00 (Night Risk)</span>
          </div>
        </div>
      </div>

      {/* Hex Cell Details & Quick List */}
      <div className="p-3 space-y-3">
        {selectedHexCell ? (
          /* Detailed Inspector for Selected Hexagon */
          <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-3.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 uppercase">
                  H3 Res 9 · {selectedHexCell.id.slice(0, 9)}...
                </span>
                <h3 className="font-bold text-sm text-slate-100 mt-1">
                  {selectedHexCell.wardNumber}
                </h3>
              </div>

              <div
                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono uppercase ${
                  selectedHexCell.riskLevel === 'safe'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : selectedHexCell.riskLevel === 'caution'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {selectedHexCell.riskLevel.replace('_', ' ')}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Safety Score</div>
                <div className="font-extrabold text-base text-emerald-300 font-mono mt-0.5">
                  {(selectedHexCell.safetyScore * 10).toFixed(1)}/10
                </div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Lighting</div>
                <div className="font-extrabold text-base text-sky-300 font-mono mt-0.5">
                  {(selectedHexCell.lightingIndex * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Crowd</div>
                <div className="font-extrabold text-base text-cyan-300 font-mono mt-0.5">
                  {(selectedHexCell.crowdIndex * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Privacy & K-Anonymity Attestation Details */}
            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  k-Anonymity Verified Count:
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  k = {selectedHexCell.kAnonymityCount} (Threshold ≥ 3 passed)
                </span>
              </div>

              <div className="text-[10px] text-slate-400">
                {selectedHexCell.lastAuditedText}
              </div>

              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>30-min cloaking delay active</span>
                <span>Hardware Attestation: Valid</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            Tap any hexagon on the map to inspect aggregated spatial risk metrics and k-anonymity status.
          </div>
        )}

        {/* All Cells Quick Summary List */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Locality H3 Cells ({hexCells.length})
          </div>

          {hexCells.map((cell) => {
            const isSelected = selectedHexCell?.id === cell.id;
            return (
              <div
                key={cell.id}
                onClick={() => onSelectHexCell(cell)}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      cell.riskLevel === 'safe'
                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                        : cell.riskLevel === 'caution'
                        ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                        : 'bg-red-500 shadow-sm shadow-red-500/50'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-slate-200">{cell.wardNumber}</div>
                    <div className="text-[10px] text-slate-400">
                      k={cell.kAnonymityCount} commuters · {cell.incidentCount} incidents
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-slate-100">
                    {(cell.safetyScore * 10).toFixed(1)}/10
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    {cell.riskLevel.replace('_', ' ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
