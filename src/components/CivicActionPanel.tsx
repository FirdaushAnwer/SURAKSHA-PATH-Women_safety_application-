import React, { useState } from 'react';
import {
  Building2,
  Wrench,
  ShieldAlert,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Check,
  X,
  FileCode,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CivicWorkOrder } from '../data/mockData';

interface CivicActionPanelProps {
  civicOrders: CivicWorkOrder[];
  onVerifyCivicFix: (orderId: string, isFixed: boolean) => void;
  onExportGeoJson: () => void;
}

export const CivicActionPanel: React.FC<CivicActionPanelProps> = ({
  civicOrders,
  onVerifyCivicFix,
  onExportGeoJson,
}) => {
  const [filterDept, setFilterDept] = useState<'ALL' | 'PWD_LIGHTING' | 'POLICE_PCR' | 'MUNICIPAL_MCD'>('ALL');
  const [answeredPrompt, setAnsweredPrompt] = useState<string | null>(null);

  const awaitingVerificationOrder = civicOrders.find(
    (wo) => wo.status === 'REPAIRED_AWAITING_VERIFICATION'
  );

  const filteredOrders = filterDept === 'ALL'
    ? civicOrders
    : civicOrders.filter((wo) => wo.department === filterDept);

  const handlePromptAnswer = (orderId: string, isFixed: boolean) => {
    onVerifyCivicFix(orderId, isFixed);
    setAnsweredPrompt(isFixed ? 'fixed' : 'still_dark');
    if (isFixed) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8'],
        });
      } catch (_) {}
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 text-slate-100 overflow-y-auto">
      {/* Header Bar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Building2 size={15} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100">
                Civic Action & "Fix & Audit" Loop
              </h2>
              <p className="text-[10px] text-slate-400">
                PWD Lighting, MCD & Police PCR Patrol Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onExportGeoJson}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm transition cursor-pointer"
            title="Download Standardized GeoJSON Work Orders for Municipal GIS"
          >
            <Download size={12} />
            <span>GeoJSON</span>
          </button>
        </div>

        {/* Closed-Loop Commuter Micro-Prompt (Slide 8 & 21 Key Novelty) */}
        {awaitingVerificationOrder && !answeredPrompt && (
          <div className="bg-gradient-to-r from-blue-950 to-slate-950 border border-blue-500/50 rounded-2xl p-3 space-y-2 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> Closed-Loop Verification Micro-Prompt
              </span>
              <span className="text-[9px] bg-blue-900/60 text-blue-300 font-mono px-1.5 py-0.2 rounded border border-blue-800">
                500m Geofenced
              </span>
            </div>

            <div className="text-xs text-slate-200">
              <strong>PWD Electrical</strong> marked street lamp pole{' '}
              <span className="text-blue-300 font-mono font-bold">#L-104</span> on{' '}
              <span className="font-semibold text-white">{awaitingVerificationOrder.location}</span> as repaired.
            </div>

            <div className="text-[11px] font-semibold text-slate-300">
              "Are you passing through this evening? Is this street lit tonight?"
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handlePromptAnswer(awaitingVerificationOrder.id, true)}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/30 transition cursor-pointer"
              >
                <Check size={14} />
                <span>Yes, Well Lit (Fixed!)</span>
              </button>

              <button
                onClick={() => handlePromptAnswer(awaitingVerificationOrder.id, false)}
                className="py-2 px-3 rounded-xl bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <X size={14} />
                <span>Still Dark / Flickering</span>
              </button>
            </div>
          </div>
        )}

        {answeredPrompt && (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>
                {answeredPrompt === 'fixed'
                  ? 'Thank you! Street safety score upgraded in real-time.'
                  : 'Re-inspection ticket flagged to Municipal Ward Engineer.'}
              </span>
            </div>
            <button
              onClick={() => setAnsweredPrompt(null)}
              className="text-[10px] text-slate-400 underline cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}

        {/* Department Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
          {(['ALL', 'PWD_LIGHTING', 'POLICE_PCR', 'MUNICIPAL_MCD'] as const).map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`py-1 px-2.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                filterDept === dept
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {dept === 'ALL' ? 'All Tickets' : dept.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders List */}
      <div className="p-3 space-y-2.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Active Civic Hotspot Work Orders ({filteredOrders.length})</span>
          <span className="text-[10px] text-slate-500 font-mono">Weekly GeoJSON Batch</span>
        </div>

        {filteredOrders.map((wo) => {
          const isResolved = wo.status === 'RESOLVED';
          const isPendingVerification = wo.status === 'REPAIRED_AWAITING_VERIFICATION';

          return (
            <div
              key={wo.id}
              className={`p-3 rounded-2xl border text-xs space-y-2 transition ${
                isResolved
                  ? 'bg-emerald-950/20 border-emerald-800/40 opacity-80'
                  : isPendingVerification
                  ? 'bg-blue-950/30 border-blue-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-sky-400">{wo.id}</span>
                  <span className="text-[9px] bg-slate-900 text-slate-300 px-1.5 py-0.2 rounded border border-slate-800">
                    {wo.department.replace('_', ' ')}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    isResolved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : isPendingVerification
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : wo.priority === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {wo.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-100 text-xs">{wo.title}</h3>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-slate-500 shrink-0" />
                  <span>{wo.location}</span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80 text-[10px] space-y-1">
                <div className="text-slate-300">
                  <strong>Action Required:</strong> {wo.actionRequired}
                </div>
                <div className="flex items-center gap-3 text-slate-400 font-mono">
                  <span>Lux Deficit: <strong>{wo.averageLuxLevel} lux</strong> (Min: 30 lux)</span>
                  <span>Incidents: <strong>{wo.reportedIncidentsCount}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
