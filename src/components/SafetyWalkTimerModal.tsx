import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Plus,
  Volume2,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SafetyWalkTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEscalateEmergency: () => void;
}

export const SafetyWalkTimerModal: React.FC<SafetyWalkTimerModalProps> = ({
  isOpen,
  onClose,
  onEscalateEmergency,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [safetyPin, setSafetyPin] = useState(() => {
    try {
      return localStorage.getItem('suraksha_walk_pin') || '1234';
    } catch (_) {
      return '1234';
    }
  });
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showPinError, setShowPinError] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play gentle alert chime on warning/escalate
  const playChime = (freq: number = 660) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (_) {}
  };

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev === 30 || prev === 10) {
            playChime(550);
            if ('vibrate' in navigator) {
              try { navigator.vibrate(200); } catch (_) {}
            }
          }

          if (prev <= 1) {
            setIsActive(false);
            setIsEscalated(true);
            playChime(880);
            if ('vibrate' in navigator) {
              try { navigator.vibrate([400, 200, 400, 200, 400]); } catch (_) {}
            }
            onEscalateEmergency();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, onEscalateEmergency]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartTimer = () => {
    setSecondsRemaining(selectedMinutes * 60);
    setIsActive(true);
    setIsEscalated(false);
    setShowPinError(false);
  };

  const handleAddFiveMinutes = () => {
    setSecondsRemaining((prev) => prev + 300);
  };

  const handleCancelWithPin = () => {
    if (pinInput === safetyPin) {
      setIsActive(false);
      setSecondsRemaining(selectedMinutes * 60);
      setPinInput('');
      setShowPinError(false);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8', '#f43f5e'],
        });
      } catch (_) {}
      setTimeout(() => onClose(), 600);
    } else {
      setShowPinError(true);
      if ('vibrate' in navigator) {
        try { navigator.vibrate([80, 50, 80]); } catch (_) {}
      }
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length === 4) {
      setSafetyPin(newPin.trim());
      try {
        localStorage.setItem('suraksha_walk_pin', newPin.trim());
      } catch (_) {}
      setIsEditingPin(false);
      setNewPin('');
    }
  };

  const timerPresets = [5, 10, 15, 20, 30, 45];
  const percentLeft = Math.max(0, Math.min(100, (secondsRemaining / (selectedMinutes * 60)) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>"Walk With Me" Safety Check-In</span>
                <span className="bg-emerald-950 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-800/60">
                  Auto-Escalating
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                If you don't check in before the timer expires, SOS activates automatically
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
          {/* Circular Countdown Display */}
          <div className="p-6 bg-slate-950/80 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-2 relative shadow-inner">
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white">
              {formatTime(secondsRemaining)}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span>{isActive ? 'Guardian Watch Active' : 'Timer Paused / Ready'}</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-1000 ${
                  secondsRemaining < 60 ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                }`}
                style={{ width: `${percentLeft}%` }}
              />
            </div>
          </div>

          {/* Escalation Warning Banner */}
          {isEscalated && (
            <div className="p-3 bg-red-950/80 border border-red-500 text-red-200 rounded-2xl space-y-1 animate-bounce shadow-lg">
              <div className="font-bold text-xs flex items-center gap-1.5 text-red-300">
                <AlertTriangle size={15} />
                <span>Timer Expired: Emergency Alert Dispatched!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your emergency guardians have been notified with your last known live coordinates. Enter your PIN below to stand down.
              </p>
            </div>
          )}

          {/* Controls When Timer is Inactive */}
          {!isActive && !isEscalated && (
            <div className="space-y-3">
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Estimated Walking Duration:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {timerPresets.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setSelectedMinutes(mins);
                      setSecondsRemaining(mins * 60);
                    }}
                    className={`py-2 rounded-xl font-bold font-mono text-xs transition cursor-pointer border ${
                      selectedMinutes === mins
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>

              <button
                onClick={handleStartTimer}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                <span>Start Walk Guard ({selectedMinutes} mins)</span>
              </button>
            </div>
          )}

          {/* Controls When Timer is Active */}
          {(isActive || isEscalated) && (
            <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold">Running late? Add more time:</span>
                <button
                  onClick={handleAddFiveMinutes}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-slate-700 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>+5 Mins</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                  I Have Reached Safely (Enter 4-Digit PIN):
                </label>

                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                      setShowPinError(false);
                    }}
                    placeholder="••••"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleCancelWithPin}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Check In</span>
                  </button>
                </div>

                {showPinError && (
                  <p className="text-[11px] text-red-400 font-medium">
                    Incorrect PIN. Default is <span className="font-mono font-bold text-white">{safetyPin}</span>.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* PIN Settings Section */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Lock size={11} className="text-emerald-400" />
              <span>Safety PIN: <strong className="text-slate-300 font-mono">•••• ({safetyPin})</strong></span>
            </span>

            <button
              onClick={() => setIsEditingPin(!isEditingPin)}
              className="text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold"
            >
              {isEditingPin ? 'Cancel' : 'Change PIN'}
            </button>
          </div>

          {isEditingPin && (
            <form onSubmit={handleSaveNewPin} className="flex gap-2 animate-fade-in">
              <input
                type="text"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="New 4-digit PIN"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={newPin.length !== 4}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Save
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
