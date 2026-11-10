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
  Clock
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>Slide 9 Mathematical Safety Engine</span>
                <span className="bg-emerald-950 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-800/60">
                  A* Cost Model
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Seva First 2026 Analytical Simulation Workbench
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
        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          {/* Formula Display Box */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-sans">
              1. Street Safety Score Formula:
            </div>
            <div className="p-2 bg-slate-900 rounded-xl text-slate-200 overflow-x-auto text-[11px]">
              S(e,t) = 0.35·L(e) + 0.25·O(e) + 0.20·C(e,t) − 0.20·min(1, I(e,t)/Imax)
            </div>

            <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider font-sans pt-1">
              2. Routing Edge Cost Formula:
            </div>
            <div className="p-2 bg-slate-900 rounded-xl text-slate-200 overflow-x-auto text-[11px]">
              W(e,t) = d(e) · (1 + α · (1 − S(e,t))²)
            </div>
          </div>

          {/* Live Output Card */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Calculated Safety Score S(e,t)
              </span>
              <div className="font-extrabold text-2xl text-emerald-300 font-mono mt-1">
                {currentSafetyScore.toFixed(3)}
              </div>
              <span
                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                  currentSafetyScore >= 0.7
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : currentSafetyScore >= 0.45
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {currentSafetyScore >= 0.7 ? 'Safe Lit Corridor' : currentSafetyScore >= 0.45 ? 'Moderate Caution' : 'High Risk Alley'}
              </span>
            </div>

            <div className="bg-sky-950/40 border border-sky-500/40 p-3 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                A* Edge Cost W(e,t)
              </span>
              <div className="font-extrabold text-2xl text-sky-300 font-mono mt-1">
                {currentCost.toFixed(1)}
              </div>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                Multiplier: {impedanceMultiplier}x
              </span>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <div className="font-bold text-slate-200 text-xs">
              Interactive Parameter Tweaks
            </div>

            {/* Alpha slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">
                  Safety Aversion Coefficient (α):
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  α = {alpha} {alpha === 0 ? '(Standard GPS)' : alpha === 3 ? '(SurakshaPath Recommended)' : '(Extreme)'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Lighting slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">
                  Street Lighting L(e):
                </span>
                <span className="font-mono text-sky-400">
                  {(lighting * 100).toFixed(0)}% ({lighting < 0.3 ? 'Dark Alleys' : 'Bright LED'})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={lighting}
                onChange={(e) => setLighting(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Openness slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">
                  Sightline Openness O(e):
                </span>
                <span className="font-mono text-cyan-400">
                  {(openness * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={openness}
                onChange={(e) => setOpenness(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Crowd slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">
                  Crowd Diversity & Density C(e,t):
                </span>
                <span className="font-mono text-purple-400">
                  {(crowd * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={crowd}
                onChange={(e) => setCrowd(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Incidents slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">
                  Time-Decayed Incident Score I(e,t):
                </span>
                <span className="font-mono text-red-400">
                  {incidentScore.toFixed(1)} / 5.0
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.2}
                value={incidentScore}
                onChange={(e) => setIncidentScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>

          {/* Simulation Benchmark Preset buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Load Slide 9 Benchmark Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setLighting(0.15);
                  setOpenness(0.25);
                  setCrowd(0.10);
                  setIncidentScore(4.2);
                  setAlpha(0);
                  setDistanceMeters(1200);
                }}
                className="p-2.5 rounded-xl bg-slate-950 border border-red-500/40 text-left hover:bg-slate-900 transition cursor-pointer"
              >
                <div className="font-bold text-red-400 text-xs">Shortest Path (GPS)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  1,200m · Avg Safety 0.38 (High Risk)
                </div>
              </button>

              <button
                onClick={() => {
                  setLighting(0.95);
                  setOpenness(0.90);
                  setCrowd(0.85);
                  setIncidentScore(0.0);
                  setAlpha(3);
                  setDistanceMeters(1380);
                }}
                className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-left hover:bg-slate-900 transition cursor-pointer"
              >
                <div className="font-bold text-emerald-400 text-xs">SurakshaPath Route</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  1,380m · Avg Safety 0.86 (Safe Corridor)
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
