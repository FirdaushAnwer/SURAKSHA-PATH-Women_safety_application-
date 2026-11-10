import React, { useState } from 'react';
import {
  Sliders,
  X,
  Sparkles,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Eye,
  Users,
  Clock,
  Info
} from 'lucide-react';
import { calculateStreetSafetyScore, calculateEdgeCost } from '../utils/safetyMath';

interface FormulaSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alpha: number;
  setAlpha: (val: number) => void;
  currentHour: number;
  setCurrentHour: (hour: number) => void;
}

export const FormulaSimulationModal: React.FC<FormulaSimulationModalProps> = ({
  isOpen,
  onClose,
  alpha,
  setAlpha,
  currentHour,
  setCurrentHour,
}) => {
  const [lighting, setLighting] = useState<number>(0.85);
  const [openness, setOpenness] = useState<number>(0.80);
  const [crowd, setCrowd] = useState<number>(0.75);
  const [incidentScore, setIncidentScore] = useState<number>(0.5);
  const [distanceMeters, setDistanceMeters] = useState<number>(1000);

  if (!isOpen) return null;

  const currentSafetyScore = calculateStreetSafetyScore(lighting, openness, crowd, incidentScore);
  const currentCost = calculateEdgeCost(distanceMeters, currentSafetyScore, alpha);
  const penaltyFactor = Number((Math.pow(1 - currentSafetyScore, 2)).toFixed(4));
  const impedanceMultiplier = Number((1 + alpha * penaltyFactor).toFixed(3));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>SurakshaPath Mathematical Safety Lab</span>
                <span className="bg-emerald-950 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-800/60">
                  Interactive Model
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Inspect how lighting, crowd, and impedance formulas protect commuters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs text-slate-200">
          {/* Formula Display Box */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles size={11} /> Safety Score Formula: S(e,t)
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl text-emerald-300 font-semibold border border-slate-800">
              S(e,t) = 0.35·L + 0.25·O + 0.20·C − 0.20·min(1, I/Imax)
            </div>
            <div className="text-[10px] text-slate-400 font-sans space-y-0.5">
              <div>• <strong>L</strong> = Lighting Index (0 to 1) · Weight: 35%</div>
              <div>• <strong>O</strong> = Openness & Sightline (0 to 1) · Weight: 25%</div>
              <div>• <strong>C</strong> = Active Crowd & Open Shops (0 to 1) · Weight: 20%</div>
              <div>• <strong>I</strong> = Time-Decayed Verified Hazard Reports · Penalty: 20%</div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Test Edge Parameters:
            </div>

            {/* Lighting Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1 text-amber-300">
                  <Lightbulb size={12} /> Lighting Index (L):
                </span>
                <span className="font-mono font-bold text-white">{(lighting * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={lighting}
                onChange={(e) => setLighting(parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Openness Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1 text-sky-300">
                  <Eye size={12} /> Openness / Sightline (O):
                </span>
                <span className="font-mono font-bold text-white">{(openness * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={openness}
                onChange={(e) => setOpenness(parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Crowd Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1 text-emerald-300">
                  <Users size={12} /> Crowd & Open Shops (C):
                </span>
                <span className="font-mono font-bold text-white">{(crowd * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={crowd}
                onChange={(e) => setCrowd(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Incident Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1 text-rose-300">
                  <AlertTriangle size={12} /> Decayed Incident Score (I):
                </span>
                <span className="font-mono font-bold text-white">{incidentScore.toFixed(1)} / 5.0</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.2"
                value={incidentScore}
                onChange={(e) => setIncidentScore(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Alpha Detour Slider */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1 text-purple-300">
                  <Sliders size={12} /> Safety Aversion Detour (α):
                </span>
                <span className="font-mono font-bold text-white">{alpha.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.5"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Real-time Calculation Result */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Calculated Safety Score</div>
              <div className="font-mono font-bold text-lg text-emerald-400 mt-1">
                {(currentSafetyScore * 100).toFixed(0)}%
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {currentSafetyScore >= 0.75 ? 'Safe Lit Corridor' : currentSafetyScore >= 0.45 ? 'Moderate Caution' : 'High Risk Area'}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">A* Perceived Distance</div>
              <div className="font-mono font-bold text-lg text-rose-300 mt-1">
                {Math.round(currentCost)}m
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Physical {distanceMeters}m × {impedanceMultiplier}x penalty
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
