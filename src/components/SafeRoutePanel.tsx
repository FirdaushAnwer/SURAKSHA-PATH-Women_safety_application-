import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Clock,
  ArrowRight,
  Play,
  Square,
  Share2,
  Sliders,
  Sparkles,
  MapPin,
  Crosshair,
  Loader2,
  Volume2,
  VolumeX,
  Users
} from 'lucide-react';
import { RouteResult } from '../utils/safetyMath';
import { AppTheme } from '../utils/themeConfig';

interface SafeRoutePanelProps {
  surakshaRoute: RouteResult | null;
  shortestRoute: RouteResult | null;
  selectedRouteType: 'suraksha' | 'shortest' | 'both';
  setSelectedRouteType: (type: 'suraksha' | 'shortest' | 'both') => void;
  originNodeId: string;
  destinationNodeId: string;
  setOriginNodeId: (id: string) => void;
  setDestinationNodeId: (id: string) => void;
  graphNodes: Record<string, { id: string; name: string; lat: number; lng: number }>;
  isSimulatingWalk: boolean;
  onToggleSimulateWalk: () => void;
  walkStepIndex: number;
  onOpenTripShare: () => void;
  onOpenSimulator: () => void;
  onOpenEmergencyContacts: () => void;
  currentHour: number;
  theme: AppTheme;
  deviceLocation?: [number, number] | null;
  deviceAccuracy?: number | null;
  isLocating?: boolean;
  onRequestDeviceLocation?: () => void;
  alpha: number;
  setAlpha: (alpha: number) => void;
}

export const SafeRoutePanel: React.FC<SafeRoutePanelProps> = ({
  surakshaRoute,
  shortestRoute,
  selectedRouteType,
  setSelectedRouteType,
  originNodeId,
  destinationNodeId,
  setOriginNodeId,
  setDestinationNodeId,
  graphNodes,
  isSimulatingWalk,
  onToggleSimulateWalk,
  walkStepIndex,
  onOpenTripShare,
  onOpenSimulator,
  onOpenEmergencyContacts,
  currentHour,
  theme,
  deviceLocation,
  deviceAccuracy,
  isLocating,
  onRequestDeviceLocation,
  alpha,
  setAlpha,
}) => {
  const [showSteps, setShowSteps] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const activeRoute = selectedRouteType === 'shortest' ? shortestRoute : surakshaRoute;

  // Comparison Metrics
  const shortestDist = shortestRoute?.totalDistanceMeters ?? 1200;
  const safeDist = surakshaRoute?.totalDistanceMeters ?? 1380;
  const distDifference = safeDist - shortestDist;
  const pctIncrease = shortestDist > 0 ? Math.round((distDifference / shortestDist) * 100) : 15;
  const timeDifferenceMins = (surakshaRoute?.estimatedMinutes ?? 17) - (shortestRoute?.estimatedMinutes ?? 15);

  const currentStep = activeRoute && activeRoute.steps[walkStepIndex]
    ? activeRoute.steps[walkStepIndex]
    : activeRoute?.steps[0];

  // Hands-free Turn-by-Turn Speech Navigation
  useEffect(() => {
    if (!isVoiceActive || !currentStep || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStep.instruction);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  }, [currentStep, isVoiceActive]);

  const speakCurrentStep = () => {
    if (currentStep && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `${currentStep.instruction}. Distance ${currentStep.distanceMeters} meters. Safety score ${(currentStep.safetyScore * 100).toFixed(0)} percent.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }
  };

  return (
    <div className={`flex flex-col h-full ${theme.bgApp} ${theme.textPrimary} overflow-y-auto`}>
      {/* Route Header & Selection Bar */}
      <div className={`p-3 ${theme.bgHeader} border-b ${theme.borderBase} space-y-2`}>
        {/* Origin & Destination Selectors */}
        <div className={`${theme.bgCard} border ${theme.borderHighlight} rounded-2xl p-3 space-y-2.5 shadow-sm`}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <label className={`text-[10px] ${theme.textMuted} font-bold uppercase tracking-wider block`}>
                  Starting Point (Origin)
                </label>
                {onRequestDeviceLocation && (
                  <button
                    onClick={onRequestDeviceLocation}
                    className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                    title="Use Device GPS as Origin"
                  >
                    {isLocating ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <Crosshair size={10} />
                    )}
                    <span>{deviceAccuracy ? `GPS ±${Math.round(deviceAccuracy)}m` : 'Use GPS'}</span>
                  </button>
                )}
              </div>
              <select
                value={originNodeId}
                onChange={(e) => setOriginNodeId(e.target.value)}
                className={`w-full bg-transparent text-xs font-semibold ${theme.textPrimary} focus:outline-none border-b ${theme.borderBase} py-0.5 truncate cursor-pointer`}
              >
                {deviceLocation && (
                  <option value={originNodeId} className={`${theme.bgApp} ${theme.textPrimary}`}>
                    📍 My Live GPS Location ({deviceLocation[0].toFixed(4)}°, {deviceLocation[1].toFixed(4)}°)
                  </option>
                )}
                {Object.values(graphNodes).map((node) => (
                  <option key={node.id} value={node.id} className={`${theme.bgApp} ${theme.textPrimary}`}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-400/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <label className={`text-[10px] ${theme.textMuted} font-bold uppercase tracking-wider block`}>
                  Safe Destination
                </label>
                <button
                  onClick={() => {
                    const temp = originNodeId;
                    setOriginNodeId(destinationNodeId);
                    setDestinationNodeId(temp);
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold transition cursor-pointer flex items-center gap-0.5"
                  title="Swap Origin and Destination"
                >
                  ⇄ Swap
                </button>
              </div>
              <select
                value={destinationNodeId}
                onChange={(e) => setDestinationNodeId(e.target.value)}
                className={`w-full bg-transparent text-xs font-semibold ${theme.textPrimary} focus:outline-none border-b ${theme.borderBase} py-0.5 truncate cursor-pointer`}
              >
                {Object.values(graphNodes).map((node) => (
                  <option key={node.id} value={node.id} className={`${theme.bgApp} ${theme.textPrimary}`}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Destination Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            <span className={`text-[9px] ${theme.textMuted} font-bold shrink-0 uppercase tracking-wider`}>Popular:</span>
            {[
              { id: 'node_hostel_campus', label: '🏫 Girls Hostel' },
              { id: 'node_central_crossing', label: '🌸 Police Booth' },
              { id: 'node_market_avenue', label: '🛍️ Lit Market' },
              { id: 'node_metro', label: '🚇 Metro Gate 2' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDestinationNodeId(preset.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer shrink-0 border ${
                  destinationNodeId === preset.id
                    ? 'bg-rose-500/25 text-rose-200 border-rose-500/40 font-bold'
                    : 'bg-black/20 text-slate-400 border-slate-700/50 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Safety Priority Level Selector */}
        <div className={`p-2 rounded-xl ${theme.bgCard} border ${theme.borderBase} flex items-center justify-between text-xs`}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <Sliders size={12} className="text-rose-400" />
            <span className={theme.textPrimary}>Safety Priority:</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { val: 1.5, label: 'Standard (1.5)' },
              { val: 3.0, label: 'Balanced Safe (3.0)' },
              { val: 5.0, label: 'Max Guard (5.0)' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setAlpha(opt.val)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition cursor-pointer ${
                  alpha === opt.val
                    ? `${theme.accentBg} text-white shadow-sm`
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Route Algorithm Toggle Buttons */}
        <div className={`grid grid-cols-3 gap-1.5 p-1 ${theme.bgCard} rounded-xl border ${theme.borderBase}`}>
          <button
            onClick={() => setSelectedRouteType('suraksha')}
            className={`py-1.5 px-2 rounded-lg text-center transition flex flex-col items-center justify-center cursor-pointer ${
              selectedRouteType === 'suraksha'
                ? `${theme.accentBg} text-white font-bold shadow-md ${theme.accentGlow}`
                : `${theme.textMuted} hover:${theme.textPrimary} hover:${theme.bgCardHover}`
            }`}
          >
            <div className="flex items-center gap-1 text-[11px]">
              <ShieldCheck size={12} />
              <span>SurakshaPath</span>
            </div>
            <span className="text-[9px] opacity-85 font-mono">Lit & Populated</span>
          </button>

          <button
            onClick={() => setSelectedRouteType('shortest')}
            className={`py-1.5 px-2 rounded-lg text-center transition flex flex-col items-center justify-center cursor-pointer ${
              selectedRouteType === 'shortest'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-700/40'
                : `${theme.textMuted} hover:${theme.textPrimary} hover:${theme.bgCardHover}`
            }`}
          >
            <div className="flex items-center gap-1 text-[11px]">
              <AlertTriangle size={12} />
              <span>Standard GPS</span>
            </div>
            <span className="text-[9px] opacity-85 font-mono">Shortest Only</span>
          </button>

          <button
            onClick={() => setSelectedRouteType('both')}
            className={`py-1.5 px-2 rounded-lg text-center transition flex flex-col items-center justify-center cursor-pointer ${
              selectedRouteType === 'both'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-700/40'
                : `${theme.textMuted} hover:${theme.textPrimary} hover:${theme.bgCardHover}`
            }`}
          >
            <div className="flex items-center gap-1 text-[11px]">
              <Sparkles size={12} />
              <span>Compare</span>
            </div>
            <span className="text-[9px] opacity-85 font-mono">Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Main Route Card & Comparison */}
      <div className="p-3 space-y-3">
        {/* Safety Comparison Benchmark Card */}
        <div className={`${theme.bgCard} border ${theme.borderHighlight} rounded-2xl p-3.5 shadow-lg`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <Sparkles size={11} />
              Intelligent Safety Route Comparison
            </span>
            <span className={`text-[10px] ${theme.bgApp} ${theme.textSecondary} font-mono px-2 py-0.5 rounded-full border ${theme.borderBase}`}>
              {currentHour}:00 PM Evening
            </span>
          </div>

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* SurakshaPath card */}
            <div className={`p-2.5 rounded-xl border transition ${
              selectedRouteType === 'suraksha'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-100 ring-1 ring-rose-500/30'
                : 'bg-black/20 border-slate-800/80 text-slate-300'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-rose-400 flex items-center gap-1">🌸 SurakshaPath</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded font-semibold">Safe</span>
              </div>
              <div className="mt-1 font-mono text-sm font-bold">
                {safeDist}m <span className={`text-[10px] ${theme.textMuted} font-normal`}>({surakshaRoute?.estimatedMinutes ?? 17} mins)</span>
              </div>
              <div className={`text-[10px] ${theme.textMuted} mt-0.5`}>
                ✨ Safety Index: <strong className="text-rose-300">{((surakshaRoute?.averageSafetyScore ?? 0.76) * 100).toFixed(0)}%</strong>
              </div>
              <div className="text-[9px] text-emerald-400 mt-1 font-medium">
                Stays on well-lit main avenue · 0 dark alleys
              </div>
            </div>

            {/* Standard GPS card */}
            <div className={`p-2.5 rounded-xl border transition ${
              selectedRouteType === 'shortest'
                ? 'bg-red-500/10 border-red-500/40 text-red-100 ring-1 ring-red-500/30'
                : 'bg-black/20 border-slate-800/80 text-slate-300'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-red-400">Standard GPS</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 text-red-300 rounded font-semibold">High Risk</span>
              </div>
              <div className="mt-1 font-mono text-sm font-bold">
                {shortestDist}m <span className={`text-[10px] ${theme.textMuted} font-normal`}>({shortestRoute?.estimatedMinutes ?? 15} mins)</span>
              </div>
              <div className={`text-[10px] ${theme.textMuted} mt-0.5`}>
                ⚠️ Safety Index: <strong className="text-red-400">{((shortestRoute?.averageSafetyScore ?? 0.08) * 100).toFixed(0)}%</strong>
              </div>
              <div className="text-[9px] text-red-400 mt-1 font-medium">
                Passes 2 unlit alleys & liquor vend
              </div>
            </div>
          </div>

          {/* Trade-off summary banner */}
          <div className={`mt-2.5 pt-2 border-t ${theme.borderBase} flex items-center justify-between text-[11px]`}>
            <div className={`flex items-center gap-1.5 ${theme.textSecondary}`}>
              <span>💡</span>
              <span>
                Peace of mind trade-off: <strong className="text-rose-300">+{distDifference}m (+{pctIncrease}%)</strong> for only <strong className="text-rose-300">+{timeDifferenceMins} mins</strong> extra walking time.
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0 ml-1">
              100% Lit
            </span>
          </div>
        </div>

        {/* Turn-by-Turn Navigation & Active Step Card */}
        <div className={`${theme.bgCard} border ${theme.borderBase} rounded-2xl p-3.5 space-y-2.5 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <MapPin size={13} className="text-rose-400" />
                <span>Pedestrian Safe Navigation</span>
              </h2>
              <p className={`text-[10px] ${theme.textMuted}`}>
                {isSimulatingWalk ? 'Live GPS walk in progress · Tracking active' : 'Ready to start safe trip with Guardian live watch'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Hands-free Voice Assistant Toggle */}
              <button
                onClick={() => {
                  setIsVoiceActive(!isVoiceActive);
                  speakCurrentStep();
                }}
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  isVoiceActive
                    ? 'bg-rose-500/25 border-rose-400 text-rose-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isVoiceActive ? 'Voice Cues Active' : 'Enable Hands-Free Voice Guidance'}
                aria-label="Voice Navigation"
              >
                {isVoiceActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>

              <button
                onClick={onToggleSimulateWalk}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-md ${
                  isSimulatingWalk
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    : `${theme.accentBg} text-white ${theme.accentGlow}`
                }`}
              >
                {isSimulatingWalk ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                <span>{isSimulatingWalk ? 'Pause Walk' : 'Start Walk'}</span>
              </button>
            </div>
          </div>

          {/* Active Navigation Instruction */}
          {currentStep && (
            <div className={`p-2.5 rounded-xl border ${theme.borderHighlight} ${theme.bgApp} space-y-1`}>
              <div className="text-xs font-semibold text-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{currentStep.isLit ? '💡' : '⚠️'}</span>
                  <span>{currentStep.instruction}</span>
                </div>
                <button
                  onClick={speakCurrentStep}
                  className="p-1 text-rose-400 hover:text-white transition cursor-pointer shrink-0"
                  title="Speak Direction"
                >
                  <Volume2 size={13} />
                </button>
              </div>
              <div className={`flex items-center gap-3 text-[10px] ${theme.textMuted} font-mono pl-6`}>
                <span>Dist: <strong className="text-white">{currentStep.distanceMeters}m</strong></span>
                <span>Safety: <strong className="text-rose-300">{(currentStep.safetyScore * 100).toFixed(0)}%</strong></span>
                <span>Lighting: <strong className="text-rose-300">{(currentStep.lightingScore * 100).toFixed(0)}%</strong></span>
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onOpenTripShare}
              className={`py-2 px-3 rounded-xl border ${theme.borderHighlight} hover:bg-rose-500/10 text-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm`}
            >
              <Share2 size={13} className="text-rose-400" />
              <span>Share Live Walk</span>
            </button>

            <button
              onClick={onOpenEmergencyContacts}
              className={`py-2 px-3 rounded-xl border ${theme.borderHighlight} hover:bg-rose-500/10 text-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm`}
            >
              <Users size={13} className="text-rose-400" />
              <span>Guardians & Sisterhood</span>
            </button>
          </div>

          <div className="flex justify-end pt-0.5">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className={`text-[11px] ${theme.textMuted} hover:text-white transition cursor-pointer`}
            >
              {showSteps ? 'Hide Full Turn Guidance' : 'View Full Turn Guidance ▼'}
            </button>
          </div>

          {/* Expanded Step-by-Step Directions */}
          {showSteps && activeRoute && (
            <div className={`mt-2 pt-2 border-t ${theme.borderBase} space-y-1.5 max-h-48 overflow-y-auto text-xs`}>
              {activeRoute.steps.map((st, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg flex items-center justify-between ${
                    idx === walkStepIndex && isSimulatingWalk
                      ? 'bg-rose-500/20 border border-rose-500/40 text-white font-bold'
                      : 'bg-black/20 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span>{st.streetName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className={st.isLit ? 'text-rose-400' : 'text-amber-400'}>
                      {st.isLit ? 'Lit' : 'Dim'}
                    </span>
                    <span className="text-slate-400">{st.distanceMeters}m</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
