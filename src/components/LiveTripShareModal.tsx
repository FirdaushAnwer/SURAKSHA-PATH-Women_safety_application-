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
  MessageSquare,
  ExternalLink
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
  const [batteryLevel, setBatteryLevel] = useState<number>(86);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSosActive) {
      setActiveTab('emergency');
    }
  }, [isSosActive]);

  // Read device battery if supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      // @ts-expect-error Battery API
      navigator.getBattery().then((battery: { level: number; addEventListener: (type: string, listener: () => void) => void }) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }
  }, []);

  const coords = userCoords || [28.6912, 77.2085];
  const mapsLink = `https://maps.google.com/?q=${coords[0].toFixed(5)},${coords[1].toFixed(5)}`;
  const shareTrackingUrl = `${window.location.origin || 'https://surakshapath.org'}/#${tripCode}`;

  const emergencySmsText = `🚨 EMERGENCY ALERT! I feel in danger.
My live location: ${mapsLink}
Tracking Code: ${tripCode}
Battery: ${batteryLevel}%
Destination: ${destinationName}
Please call 112 or come help immediately!`;

  const normalShareText = `🌸 I am walking via SurakshaPath safe illuminated corridor to ${destinationName}.
Track my live route here: ${shareTrackingUrl}
Live Maps GPS: ${mapsLink}
Battery: ${batteryLevel}% · ETA: ${etaMins} mins`;

  const whatsappEmergencyUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(emergencySmsText)}`;
  const smsEmergencyUrl = `sms:?body=${encodeURIComponent(emergencySmsText)}`;
  const whatsappNormalUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(normalShareText)}`;

  // Audio siren synthesizer using Web Audio API for emergency alarm
  const toggleSirenSound = () => {
    if (isSirenPlaying) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainRef.current = gain;
      setIsSirenPlaying(true);

      // Continuous frequency modulation
      let up = true;
      sirenIntervalRef.current = setInterval(() => {
        if (!audioContextRef.current || !oscillatorRef.current) return;
        const now = audioContextRef.current.currentTime;
        if (up) {
          oscillatorRef.current.frequency.linearRampToValueAtTime(1400, now + 0.35);
        } else {
          oscillatorRef.current.frequency.linearRampToValueAtTime(800, now + 0.35);
        }
        up = !up;
      }, 400);

      if ('vibrate' in navigator) {
        try { navigator.vibrate([300, 100, 300, 100, 500]); } catch (_) {}
      }
    } catch (_) {}
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (_) {}
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }
    setIsSirenPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(isSosActive ? emergencySmsText : normalShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isSosActive ? 'bg-red-950 border-red-800 text-red-100' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                isSosActive ? 'bg-red-600 text-white animate-pulse' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isSosActive ? <ShieldAlert size={20} /> : <Share2 size={18} />}
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span>{isSosActive ? 'EMERGENCY SOS BROADCAST' : 'Live Guardian Trip Watch'}</span>
              </h2>
              <p className="text-[10px] opacity-80">
                {isSosActive ? 'One-tap dispatch to police, family & bystanders' : 'Private end-to-end encrypted live location tracking'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 text-xs">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 text-center rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'share' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Tracking
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-2 text-center rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'emergency' ? 'bg-red-600 text-white shadow-sm shadow-red-700/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Emergency SOS
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs text-slate-300">
          {/* Emergency Siren Audio Bar */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSirenSound}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition cursor-pointer ${
                  isSirenPlaying ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isSirenPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <div>
                <div className="font-bold text-white text-xs">
                  {isSirenPlaying ? 'High-Decibel Siren Blaring' : 'Acoustic Defense Siren'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isSirenPlaying ? 'Tap button to silence alarm' : 'Attract bystander assistance'}
                </div>
              </div>
            </div>

            <button
              onClick={toggleSirenSound}
              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                isSirenPlaying ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isSirenPlaying ? 'Stop Siren' : 'Sound Siren'}
            </button>
          </div>

          {activeTab === 'emergency' ? (
            /* Emergency SOS Quick Dispatch */
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl space-y-2">
                <div className="text-[11px] font-bold text-red-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldAlert size={14} className="text-red-400" /> Instant Dispatch Links
                  </span>
                  <span className="text-[10px] font-mono text-red-400">Accurate ±{Math.round(deviceAccuracy || 10)}m</span>
                </div>

                {/* Direct Emergency Call Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:112"
                    className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-red-700/30 transition text-center"
                  >
                    <PhoneCall size={16} />
                    <span>Call 112 (Police)</span>
                  </a>

                  <a
                    href="tel:1091"
                    className="p-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-purple-700/30 transition text-center"
                  >
                    <PhoneCall size={16} />
                    <span>Call 1091 (Women)</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:181"
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-bold flex items-center justify-center gap-1.5 text-center"
                  >
                    <PhoneCall size={14} className="text-rose-400" />
                    <span>181 (Helpline)</span>
                  </a>

                  <a
                    href="tel:100"
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-bold flex items-center justify-center gap-1.5 text-center"
                  >
                    <PhoneCall size={14} className="text-sky-400" />
                    <span>100 (PCR Desk)</span>
                  </a>
                </div>
              </div>

              {/* Direct Messaging Broadcast */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-300">
                  Broadcast Emergency Location:
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsappEmergencyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <MessageSquare size={16} />
                    <span>Send on WhatsApp</span>
                  </a>

                  <a
                    href={smsEmergencyUrl}
                    className="p-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Radio size={16} />
                    <span>Send Offline SMS</span>
                  </a>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Emergency Alert Copied to Clipboard!' : 'Copy Emergency SOS Message'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Live Journey Share */
            <div className="space-y-3 animate-fade-in">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-300">Trip Security Status</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-mono">
                    Protected
                  </span>
                </div>

                <div className="space-y-1 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Destination:</span>
                    <strong className="text-white">{destinationName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Walking Time:</span>
                    <strong className="text-white">{etaMins} Minutes</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone Battery:</span>
                    <strong className="text-white">{batteryLevel}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <strong className="text-white font-mono text-[11px]">
                      {coords[0].toFixed(4)}°, {coords[1].toFixed(4)}°
                    </strong>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <a
                  href={whatsappNormalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <MessageSquare size={16} />
                  <span>Share Live Route on WhatsApp</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Tracking Link Copied!' : 'Copy Live Tracking Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
