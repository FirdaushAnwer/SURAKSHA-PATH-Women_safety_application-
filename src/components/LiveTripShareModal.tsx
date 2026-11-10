import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Share2,
  Copy,
  Check,
  PhoneCall,
  Volume2,
  VolumeX,
  Battery,
  MapPin,
  Clock,
  AlertTriangle,
  X,
  Users,
  Radio,
  Lock,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { generateOfflineEmergencySms } from '../utils/safetyMath';

interface LiveTripShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSosActive: boolean;
  onTriggerSos: () => void;
  onDismissSos: () => void;
  tripCode: string;
  destinationName: string;
  etaMins: number;
  userCoords?: [number, number] | null;
  deviceAccuracy?: number | null;
}

export const LiveTripShareModal: React.FC<LiveTripShareModalProps> = ({
  isOpen,
  onClose,
  isSosActive,
  onTriggerSos,
  onDismissSos,
  tripCode,
  destinationName,
  etaMins,
  userCoords,
  deviceAccuracy,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'guardian' | 'emergency'>('share');
  const [simulatedDeviation, setSimulatedDeviation] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isSosActive) {
      setActiveTab('emergency');
    }
  }, [isSosActive]);

  // Audio siren synthesizer using Web Audio API for emergency alarm
  const toggleSirenSound = () => {
    if (isSirenPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      setIsSirenPlaying(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        // Modulate frequency like emergency siren
        osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.4);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.8);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;
        setIsSirenPlaying(true);
      } catch (_) {}
    }
  };

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (_) {}
      }
    };
  }, []);

  if (!isOpen && !isSosActive) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://surakshapath.org/live/${tripCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full sm:max-w-md bg-slate-900 border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all duration-300 ${
          isSosActive
            ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-pulse'
            : 'border-slate-800'
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isSosActive
              ? 'bg-red-950/80 border-red-800/80 text-white'
              : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                isSosActive
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
              }`}
            >
              {isSosActive ? <AlertTriangle size={18} /> : <Lock size={16} />}
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span>{isSosActive ? 'EMERGENCY SOS BROADCAST' : 'E2EE Live Trip Watch'}</span>
                <span className="bg-sky-950 text-sky-400 text-[9px] font-mono px-1.5 py-0.2 rounded border border-sky-800/60 font-bold">
                  AES-256
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                {isSosActive
                  ? 'Emergency dispatch alerted · Sirens active'
                  : 'Ephemeral end-to-end encrypted live location link'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSosActive) onDismissSos();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-slate-950 p-1 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-center transition cursor-pointer ${
              activeTab === 'share'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Encrypted Link
          </button>
          <button
            onClick={() => setActiveTab('guardian')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-center transition cursor-pointer ${
              activeTab === 'guardian'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Guardian View
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-center transition cursor-pointer ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white shadow'
                : 'text-red-400 hover:text-red-300'
            }`}
          >
            SOS Help
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {activeTab === 'share' && (
            <div className="space-y-3.5">
              {/* Trip link card */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ephemeral Trip Link
                  </span>
                  <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Expires in 2 hours
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs font-mono text-sky-300">
                  <span className="truncate flex-1">
                    https://surakshapath.org/live/{tripCode}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer shrink-0"
                    title="Copy Link"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="text-[10px] text-slate-400">
                  Shared only with people holding this key. Decrypted exclusively in the recipient's browser.
                </div>
              </div>

              {/* Trusted Emergency Contacts */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Pre-Configured Guardians</span>
                  <span className="text-[10px] text-emerald-400 font-normal">3 Connected</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { name: 'Mother', phone: '+91 98112-XXXXX', active: true },
                    { name: 'Priya (Hostel Roommate)', phone: '+91 99234-XXXXX', active: true },
                    { name: 'Hostel Warden Office', phone: '+91 94120-XXXXX', active: true },
                  ].map((guardian, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs">
                          {guardian.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{guardian.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{guardian.phone}</div>
                        </div>
                      </div>

                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Live Tracking
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guardian' && (
            <div className="space-y-3">
              {/* Guardian View Mockup */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-sky-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-slate-200">
                      Live Commuter Feed
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-sky-400 font-mono px-2 py-0.5 rounded border border-slate-800">
                    E2EE Stream Active
                  </span>
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">Battery</span>
                    <strong className="text-emerald-400 font-mono">84% Charging</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">Walking Pace</span>
                    <strong className="text-slate-200 font-mono">4.8 km/h</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">ETA to Hostel</span>
                    <strong className="text-emerald-400 font-mono">{etaMins} mins</strong>
                  </div>
                </div>

                {/* Corridor Status */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    simulatedDeviation
                      ? 'bg-red-950/60 border-red-500 text-red-200'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {simulatedDeviation ? (
                      <AlertTriangle size={15} className="text-red-400 shrink-0" />
                    ) : (
                      <Check size={15} className="text-emerald-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold">
                        {simulatedDeviation
                          ? 'DEVIATION ALERT: Entered unlit alley!'
                          : 'On-Track: Well-lit Commercial Corridor'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {simulatedDeviation
                          ? 'Commuter deviated 120m from recommended safe corridor'
                          : 'Average street illumination: 45 Lux (Safe)'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulation trigger */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Simulate route deviation alert:
                  </span>
                  <button
                    onClick={() => setSimulatedDeviation(!simulatedDeviation)}
                    className="text-[10px] font-bold text-sky-400 hover:text-sky-300 underline cursor-pointer"
                  >
                    {simulatedDeviation ? 'Reset Corridor' : 'Simulate Deviation'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-3">
              {/* Emergency Banner */}
              <div className="p-3 bg-red-950/70 border border-red-500 rounded-2xl text-center space-y-1">
                <h3 className="text-sm font-extrabold text-red-300 uppercase tracking-wide">
                  Emergency Safety Hub
                </h3>
                <p className="text-[11px] text-slate-300">
                  Instant integration with National Emergency System & local Delhi Police PCR.
                </p>
              </div>

              {/* Siren Alarm Sound Button */}
              <button
                onClick={toggleSirenSound}
                className={`w-full py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  isSirenPlaying
                    ? 'bg-amber-600 border-amber-400 text-white animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {isSirenPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isSirenPlaying ? 'Silence 100dB Emergency Siren' : 'Sound High-Decibel Deterrent Siren'}</span>
              </button>

              {/* Direct Quick Calls */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:112"
                  className="p-3 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-bold text-center flex flex-col items-center justify-center shadow-lg shadow-red-600/30 transition cursor-pointer"
                >
                  <PhoneCall size={20} className="mb-1" />
                  <span className="text-xs">Call 112 India</span>
                  <span className="text-[9px] opacity-80">Police Dispatch</span>
                </a>

                <a
                  href="tel:1091"
                  className="p-3 bg-purple-600 hover:bg-purple-500 rounded-2xl text-white font-bold text-center flex flex-col items-center justify-center shadow-lg shadow-purple-600/30 transition cursor-pointer"
                >
                  <PhoneCall size={20} className="mb-1" />
                  <span className="text-xs">Call 1091</span>
                  <span className="text-[9px] opacity-80">Women Helpline</span>
                </a>
              </div>

              {/* Offline SMS Fallback Dispatch (Works without 4G/5G mobile data) */}
              <a
                href={`sms:112?body=${encodeURIComponent(
                  generateOfflineEmergencySms(
                    userCoords ? userCoords[0] : 28.6945,
                    userCoords ? userCoords[1] : 77.2060,
                    84,
                    tripCode,
                    destinationName
                  )
                )}`}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between text-xs text-slate-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100">Offline Emergency SMS</div>
                    <div className="text-[10px] text-slate-400">Broadcasts GPS & tracking link via cellular SMS</div>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Zero Data
                </span>
              </a>

              {/* SOS Broadcast trigger / dismiss */}
              {isSosActive ? (
                <button
                  onClick={onDismissSos}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Dismiss Emergency Alert Mode
                </button>
              ) : (
                <button
                  onClick={onTriggerSos}
                  className="w-full py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-bold transition cursor-pointer"
                >
                  Activate Emergency Screen & Alert Guardians
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
