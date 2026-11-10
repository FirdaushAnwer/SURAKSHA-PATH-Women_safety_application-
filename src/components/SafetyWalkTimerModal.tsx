import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  X,
  Play,
  RotateCcw,
  Sparkles
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
  const [safetyPin, setSafetyPin] = useState('1234');

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsEscalated(true);
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
  };

  const handleCancelWithPin = () => {
    if (pinInput === safetyPin) {
      setIsActive(false);
      setSecondsRemaining(selectedMinutes * 60);
      setPinInput('');
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8'],
        });
      } catch (_) {}
      setTimeout(() => onClose(), 600);
    } else {
      alert('Incorrect PIN. Please enter your 4-digit safety PIN.');
    }
  };

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
                <span>"Walk With Me" Safety Timer</span>
                <span className="bg-emerald-950 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-800/60">
                  Auto-Escalate
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Automatic SOS escalation if you don't check in on time
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

        {/* Body */}
        <div className="p-5 space-y-4 text-center">
          {/* Circular Countdown Display */}
          <div className="relative w-44 h-44 mx-auto flex flex-col items-center justify-center rounded-full bg-slate-950 border-4 border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.15)]">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isActive ? 'Time to Arrive' : 'Target Walk Duration'}
            </div>
            <div className="text-4xl font-extrabold text-white font-mono mt-1">
              {formatTime(secondsRemaining)}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">
              {isActive ? '● Live Guard Active' : `${selectedMinutes} minutes`}
            </div>
          </div>

          {/* Quick Preset Buttons (When idle) */}
          {!isActive && (
            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-medium">
                Choose expected walking time to your destination:
              </div>
              <div className="flex justify-center gap-2">
                {[10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setSelectedMinutes(mins);
                      setSecondsRemaining(mins * 60);
                    }}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      selectedMinutes === mins
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Timer Verification Input */}
          {isActive && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock size={12} className="text-emerald-400" />
                  Enter Safety PIN to disarm (Default: 1234):
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN"
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono text-white tracking-widest focus:outline-none focus:border-emerald-500 w-28"
                />
                <button
                  onClick={handleCancelWithPin}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow transition"
                >
                  I Have Arrived Safely
                </button>
              </div>
            </div>
          )}

          {/* Start / Cancel Action Button */}
          {!isActive && (
            <button
              onClick={handleStartTimer}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-98 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Play size={16} />
              <span>Start "Walk With Me" Auto-Guard</span>
            </button>
          )}

          {isEscalated && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-2xl text-red-200 text-xs font-bold animate-pulse">
              ⚠️ Timer expired! Auto-escalation broadcast dispatched to your emergency guardians with current coordinates!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
