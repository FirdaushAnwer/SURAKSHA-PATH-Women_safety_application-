import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  User,
  Volume2,
  Mic,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({ isOpen, onClose }) => {
  const [callerName, setCallerName] = useState('Papa');
  const [callerPhone, setCallerPhone] = useState('+91 98112-90142');
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [callDuration, setCallDuration] = useState(0);
  const [selectedScript, setSelectedScript] = useState<'hindi_family' | 'english_car' | 'police_checkin'>('hindi_family');
  const ringtoneTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCallState('incoming');
      setCallDuration(0);
      // Android vibration simulation
      if ('vibrate' in navigator) {
        try { navigator.vibrate([400, 300, 400, 300, 400]); } catch (_) {}
      }
    } else {
      setCallState('incoming');
      setCallDuration(0);
    }
  }, [isOpen]);

  // Duration timer when connected
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  if (!isOpen) return null;

  const scripts = {
    hindi_family: {
      title: 'Family Deterrent (Hindi)',
      spokenLine: '“Haan beta, kahan tak pahuchi? Main aur bhaiya corner pe car leke khade hain, bas 1 minute mein pahucho jaldi!”',
      translation: '“Yes dear, where have you reached? Bhaiya and I are waiting at the corner with the car, reach in 1 minute!”',
    },
    english_car: {
      title: 'Campus Escort / Friend',
      spokenLine: '“Hey! I can see your location on the map, I’m standing right outside the gate with two friends. See you in 30 seconds!”',
      translation: 'Clear audible deterrent indicating you are closely tracked and awaited.',
    },
    police_checkin: {
      title: 'Pink Booth Police Check',
      spokenLine: '“Namaste, Delhi Police Pink Booth Chattra Marg. Aapka live track monitor ho raha hai, koi issue toh nahi hai?”',
      translation: '“Hello, Delhi Police Pink Booth. Your live route is monitored on our beat screen, all okay?”',
    },
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const remaining = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${remaining}`;
  };

  const handleAnswer = () => {
    setCallState('connected');
    if ('vibrate' in navigator) {
      try { navigator.vibrate(50); } catch (_) {}
    }
  };

  const handleDecline = () => {
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 text-white font-sans select-none animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="font-semibold text-slate-300">SurakshaPath · Call Me Out</span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Caller Profile */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 space-y-4">
        {/* Caller Avatar */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-slate-600 flex items-center justify-center shadow-2xl">
            <User size={54} className="text-slate-300" />
          </div>
          {callState === 'incoming' && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
          )}
        </div>

        {/* Caller Name & Number */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">{callerName}</h2>
          <div className="text-xs font-mono text-slate-400 mt-1">{callerPhone}</div>
          <div className="mt-2 text-xs font-medium text-emerald-400">
            {callState === 'incoming' && 'Incoming Call...'}
            {callState === 'connected' && (
              <span className="font-mono text-emerald-300 text-sm font-bold">
                {formatSeconds(callDuration)}
              </span>
            )}
            {callState === 'ended' && 'Call Ended'}
          </div>
        </div>

        {/* In-Call Spoken Script Assistance Banner */}
        {callState === 'connected' && (
          <div className="max-w-xs w-full bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2 text-center shadow-lg animate-fade-in">
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Audible Deterrent Line (Speak or Play)
            </div>
            <div className="text-xs font-semibold text-white leading-relaxed">
              {scripts[selectedScript].spokenLine}
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Say: "Haan Papa, bas 1 minute mein car ke paas aa rahi hoon!"
            </div>
          </div>
        )}

        {/* Preset Caller Selection (When incoming) */}
        {callState === 'incoming' && (
          <div className="flex gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => {
                setCallerName('Papa');
                setCallerPhone('+91 98112-90142');
                setSelectedScript('hindi_family');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                callerName === 'Papa' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Papa
            </button>
            <button
              onClick={() => {
                setCallerName('Bhaiya (Brother)');
                setCallerPhone('+91 99201-44120');
                setSelectedScript('hindi_family');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                callerName === 'Bhaiya (Brother)' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bhaiya
            </button>
            <button
              onClick={() => {
                setCallerName('Pink Booth Desk #4');
                setCallerPhone('112 / Delhi Police');
                setSelectedScript('police_checkin');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                callerName.includes('Pink') ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pink Booth
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="max-w-xs mx-auto w-full pb-4">
        {callState === 'incoming' ? (
          <div className="flex items-center justify-around">
            {/* Decline Button */}
            <button
              onClick={handleDecline}
              className="w-16 h-16 rounded-full bg-red-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/40 cursor-pointer transition"
              title="Decline"
            >
              <PhoneOff size={28} />
            </button>

            {/* Answer Button */}
            <button
              onClick={handleAnswer}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 cursor-pointer transition animate-pulse"
              title="Answer"
            >
              <Phone size={28} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleDecline}
              className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-98 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <PhoneOff size={20} />
              <span>End Call (I am Safe Now)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
