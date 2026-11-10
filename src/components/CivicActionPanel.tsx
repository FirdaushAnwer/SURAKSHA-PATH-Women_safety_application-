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
                Civic Action & "Fix & Confirm" Loop
              </h2>
              <p className="text-[10px] text-slate-400">
                Direct bridge to PWD Lighting, MCD & Police PCR Patrol
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

        {/* Closed-Loop Commuter Micro-Prompt */}
        {awaitingVerificationOrder && !answeredPrompt && (
          <div className="bg-gradient-to-r from-blue-950 to-slate-950 border border-blue-500/50 rounded-2xl p-3 space-y-2 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> Community Verification Micro-Prompt
              </span>
              <span className="text-[9px] bg-blue-900/60 text-blue-300 font-mono px-1.5 py-0.2 rounded border border-blue-800">
                Walking Nearby
              </span>
            </div>

            <div className="text-xs text-slate-200">
              <strong>PWD Electrical</strong> reported street lamp pole{' '}
              <span className="text-blue-300 font-mono font-bold">#L-104</span> on{' '}
              <span className="text-white font-bold">{awaitingVerificationOrder.location}</span> repaired.
              Can you confirm it is brightly lit?
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handlePromptAnswer(awaitingVerificationOrder.id, true)}
                className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow-md shadow-emerald-700/30"
              >
                <Check size={13} />
                <span>Yes, It's Lit!</span>
              </button>

              <button
                onClick={() => handlePromptAnswer(awaitingVerificationOrder.id, false)}
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition border border-slate-700"
              >
                <X size={13} />
                <span>Still Dark / Broken</span>
              </button>
            </div>
          </div>
        )}

        {answeredPrompt && (
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>
              {answeredPrompt === 'fixed'
                ? 'Thank you! PWD verified. Safety rating for this road has been updated.'
                : 'Thank you! Municipal re-inspection ticket has been generated.'}
            </span>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'ALL' as const, label: 'All Orders' },
            { id: 'PWD_LIGHTING' as const, label: 'PWD Streetlights' },
            { id: 'POLICE_PCR' as const, label: 'Police PCR' },
            { id: 'MUNICIPAL_MCD' as const, label: 'MCD Sanitation' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setFilterDept(flt.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                filterDept === flt.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-3 space-y-2.5">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    order.department === 'PWD_LIGHTING'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : order.department === 'POLICE_PCR'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {order.department === 'PWD_LIGHTING' && <Lightbulb size={14} />}
                  {order.department === 'POLICE_PCR' && <ShieldAlert size={14} />}
                  {order.department === 'MUNICIPAL_MCD' && <Wrench size={14} />}
                </div>

                <div>
                  <h3 className="font-bold text-white text-xs leading-tight">
                    {order.title}
                  </h3>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    <span>{order.location}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    order.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : order.status === 'REPAIRED_AWAITING_VERIFICATION'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {order.status === 'REPAIRED_AWAITING_VERIFICATION'
                    ? 'Awaiting Verification'
                    : order.status}
                </span>
                <div className="text-[9px] font-mono text-slate-500 mt-1">
                  Priority: {order.priority}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-xl text-[11px] text-slate-300 border border-slate-800/80">
              {order.actionRequired}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
              <span>Lux Level: <strong className="text-slate-200">{order.averageLuxLevel} lx</strong></span>
              <span>Reports: <strong className="text-rose-400">{order.reportedIncidentsCount}</strong></span>
              <span>Dept: <strong className="text-blue-300">{order.department.replace('_', ' ')}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
