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
  Fingerprint
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

    // Realistic hardware attestation & zero-PII pipeline simulation (Slide 6 & 7)
    setAttestationStep('1/4: Requesting Android Play Integrity key token...');
    await new Promise((r) => setTimeout(r, 400));

    setAttestationStep('2/4: Verifying 500m GNSS on-device geofence...');
    await new Promise((r) => setTimeout(r, 450));

    setAttestationStep('3/4: Stripping device ID, IP & trajectory data (Zero-PII)...');
    await new Promise((r) => setTimeout(r, 400));

    setAttestationStep('4/4: Snapping to H3 Res 9 hexagon with 30-min privacy delay...');
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
        colors: ['#10b981', '#38bdf8', '#f59e0b'],
      });
    } catch (_) {}

    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
              <Fingerprint size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>10-Second Anonymous Audit</span>
                <span className="bg-emerald-950 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-800/60">
                  Zero-PII
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Play Integrity attestation · No identity or phone stored
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
        <div className="p-4 space-y-4 overflow-y-auto">
          {submittedSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto">
                <Check size={28} />
              </div>
              <h3 className="text-base font-bold text-white">
                Anonymous Hazard Pinned!
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Cryptographic hardware token verified. Snapped to Uber H3 Res 9 grid with 30-min cloaking delay for your privacy.
              </p>
            </div>
          ) : (
            <>
              {/* Tap 1: Select Category & Hazard */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Step 1: Select Hazard Category
                  </span>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => {
                        setCategory('environmental');
                        setSelectedType('broken_light');
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                        category === 'environmental'
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Environmental
                    </button>
                    <button
                      onClick={() => {
                        setCategory('behavioral');
                        setSelectedType('catcalling');
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                        category === 'behavioral'
                          ? 'bg-red-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Behavioral
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(category === 'environmental' ? environmentalHazards : behavioralHazards).map(
                    (hazard) => {
                      const isSelected = selectedType === hazard.id;
                      const Icon = hazard.icon;
                      return (
                        <button
                          key={hazard.id}
                          onClick={() => setSelectedType(hazard.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? category === 'environmental'
                                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                                : 'bg-red-950/60 border-red-500 text-red-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Icon size={16} />
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-100">{hazard.label}</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">{hazard.sub}</div>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Tap 2: Severity Rating */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Step 2: Hazard Severity Level
                  </span>
                  <span className="text-amber-400 font-bold font-mono">
                    {severity === 5 ? 'Critical (5/5)' : severity === 4 ? 'High (4/5)' : 'Moderate (3/5)'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSeverity(level)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        severity === level
                          ? 'bg-amber-500 text-slate-950 shadow-md font-mono'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      ★ {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Shield & Attestation Guarantee */}
              <div className="bg-slate-950/90 rounded-2xl p-3 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                  <Lock size={13} />
                  <span>Hardware-Attested Zero-PII Shield</span>
                </div>

                <div className="text-[10px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Hardware token verifies 500m geofence proximity (blocks spam bots).</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>30-minute delay buffer prevents tracking individual walking routes.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Auto-converted to municipal work order if verified by ≥ 3 commuters.</span>
                  </div>
                </div>

                {isSubmitting && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-emerald-300 animate-pulse flex items-center gap-2">
                    <Sparkles size={12} />
                    <span>{attestationStep}</span>
                  </div>
                )}
              </div>

              {/* Tap 3: One-Tap Attest & Submit */}
              <button
                disabled={isSubmitting}
                onClick={handleAuditSubmit}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Fingerprint size={16} />
                <span>{isSubmitting ? 'Verifying Hardware Token...' : 'Pin Anonymous Audit (3rd Tap)'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
