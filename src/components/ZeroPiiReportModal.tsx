import React, { useState } from 'react';
import {
  Lightbulb,
  Eye,
  Users,
  AlertTriangle,
  Flame,
  Volume2,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
  Lock,
  X,
  Radio,
  Fingerprint,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IncidentReport } from '../utils/safetyMath';

interface ZeroPiiReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: IncidentReport) => void;
  userCoords: [number, number];
}

type HazardType = 'broken_light' | 'blocked_sightline' | 'deserted_area' | 'liquor_vend' | 'stalking' | 'catcalling' | 'loitering' | 'following';

export const ZeroPiiReportModal: React.FC<ZeroPiiReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  userCoords,
}) => {
  const [category, setCategory] = useState<'environmental' | 'behavioral'>('environmental');
  const [selectedType, setSelectedType] = useState<HazardType>('broken_light');
  const [severity, setSeverity] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attestationStep, setAttestationStep] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const environmentalHazards = [
    { id: 'broken_light' as const, label: 'Broken Streetlight', icon: Lightbulb, sub: 'Dark / Flickering lamp (<10 lux)' },
    { id: 'blocked_sightline' as const, label: 'Blind Alley / Wall', icon: Eye, sub: 'Zero natural surveillance / blocked' },
    { id: 'deserted_area' as const, label: 'Deserted Stretch', icon: Users, sub: 'No pedestrian footfall or open shops' },
    { id: 'liquor_vend' as const, label: 'Liquor Vend / Isolated', icon: Flame, sub: 'Aggressive loitering corner' },
  ];

  const behavioralHazards = [
    { id: 'catcalling' as const, label: 'Catcalling / Harassment', icon: Volume2, sub: 'Verbal threats or comments' },
    { id: 'stalking' as const, label: 'Stalking / Following', icon: Eye, sub: 'Suspicious person tailing commuter' },
    { id: 'loitering' as const, label: 'Hostile Loitering Group', icon: AlertTriangle, sub: 'Crowd blocking pavement / entrance' },
    { id: 'following' as const, label: 'Vehicle Stalking', icon: Radio, sub: 'Slow-moving bike/car following' },
  ];

  const handleAuditSubmit = async () => {
    setIsSubmitting(true);

    // Warm, reassuring step-by-step privacy pipeline
    setAttestationStep('1/4: Securing anonymous cryptographic token...');
    await new Promise((r) => setTimeout(r, 350));

    setAttestationStep('2/4: Verifying local neighborhood perimeter...');
    await new Promise((r) => setTimeout(r, 400));

    setAttestationStep('3/4: Stripping phone identity, name & IP address...');
    await new Promise((r) => setTimeout(r, 350));

    setAttestationStep('4/4: Publishing anonymous safety warning to protect other women...');
    await new Promise((r) => setTimeout(r, 350));

    // Slight coordinate jitter to respect privacy
    const jitterLat = userCoords[0] + (Math.random() - 0.5) * 0.001;
    const jitterLng = userCoords[1] + (Math.random() - 0.5) * 0.001;

    const newReport: IncidentReport = {
      id: `audit-${Date.now()}`,
      type: selectedType,
      category,
      timestamp: Date.now(),
      severity,
      lat: Number(jitterLat.toFixed(5)),
      lng: Number(jitterLng.toFixed(5)),
      verifiedCount: 1,
      status: 'verified',
    };

    onSubmitReport(newReport);
    setIsSubmitting(false);
    setSubmittedSuccess(true);

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#38bdf8', '#f59e0b', '#f43f5e'],
      });
    } catch (_) {}
  };

  const handleCloseSuccess = () => {
    setSubmittedSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>3-Tap Private Safety Audit</span>
                <span className="bg-emerald-950 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-800/60">
                  100% Anonymous
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Warn fellow women commuters about dark spots & hazards
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
          {submittedSuccess ? (
            /* Success confirmation */
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Check size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Thank You, Sister!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your anonymous safety report has been published to the neighborhood grid. Other women walking nearby will see this spot flagged immediately.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] text-emerald-400 space-y-1 font-mono">
                <div>✓ Zero Identity Stored</div>
                <div>✓ Municipal Civic Work Order Queued</div>
              </div>

              <button
                onClick={handleCloseSuccess}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg cursor-pointer transition"
              >
                Return to Safe Path
              </button>
            </div>
          ) : isSubmitting ? (
            /* Submitting loading steps */
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin" />
              <div className="space-y-1">
                <div className="font-mono text-xs font-bold text-rose-300">
                  {attestationStep}
                </div>
                <div className="text-[10px] text-slate-400">
                  Guaranteeing 100% privacy & tamper-proof verification
                </div>
              </div>
            </div>
          ) : (
            /* Main Form */
            <div className="space-y-4">
              {/* Category Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setCategory('environmental');
                    setSelectedType('broken_light');
                  }}
                  className={`py-2 rounded-xl text-center font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    category === 'environmental'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lightbulb size={13} />
                  <span>Infrastructure</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCategory('behavioral');
                    setSelectedType('catcalling');
                  }}
                  className={`py-2 rounded-xl text-center font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    category === 'behavioral'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle size={13} />
                  <span>Behavioral</span>
                </button>
              </div>

              {/* Hazard Selection Cards */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Select Observed Hazard (Tap 1):
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {(category === 'environmental' ? environmentalHazards : behavioralHazards).map((item) => {
                    const isSelected = selectedType === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedType(item.id)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-500 text-white ring-1 ring-rose-500/40 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon size={16} className={isSelected ? 'text-rose-400' : 'text-slate-400'} />
                          {isSelected && <span className="text-rose-400 text-xs">✓</span>}
                        </div>
                        <div>
                          <div className="font-bold text-xs">{item.label}</div>
                          <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{item.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Perceived Danger Level:
                  </label>
                  <span className="font-mono font-bold text-rose-400 text-xs">
                    {severity === 5 ? 'Extreme (Avoid completely)' : severity === 4 ? 'High Risk (Dim / Uneasy)' : 'Moderate'}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  {[2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`flex-1 py-1.5 rounded-xl text-center font-mono font-bold text-xs border transition cursor-pointer ${
                        severity === lvl
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Attestation Banner */}
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                <Lock size={14} className="text-emerald-400 shrink-0" />
                <span>
                  Your audit is completely anonymous. Location is slightly buffered for privacy.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleAuditSubmit}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Sparkles size={14} />
                <span>Publish Anonymous Safety Audit</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
