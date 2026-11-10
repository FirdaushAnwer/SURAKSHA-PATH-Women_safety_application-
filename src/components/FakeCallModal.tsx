import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  User,
  Volume2,
  VolumeX,
  Mic,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({ isOpen, onClose }) => {
  const [callerName, setCallerName] = useState('Papa');
  const [callerPhone, setCallerPhone] = useState('+91 98112-90142');
  const [callState, setCallState] = useState<'scheduling' | 'incoming' | 'connected' | 'ended'>('incoming');
  const [scheduledSeconds, setScheduledSeconds] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedScript, setSelectedScript] = useState<'hindi_family' | 'english_car' | 'police_checkin'>('hindi_family');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringtoneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scripts = {
    hindi_family: {
      title: 'Family Deterrent (Hindi)',
      spokenLine: 'Haan beta, kahan tak pahuchi? Main aur bhaiya corner pe car leke khade hain, bas ek minute mein pahucho jaldi!',
      displayText: '“Haan beta, kahan tak pahuchi? Main aur bhaiya corner pe car leke khade hain, bas 1 minute mein pahucho jaldi!”',
      translation: '“Yes dear, where have you reached? Bhaiya and I are waiting at the corner with the car, reach in 1 minute!”',
      suggestedReply: 'Say: "Haan Papa, bas 1 minute mein car ke paas aa rahi hoon!"',
    },
    english_car: {
      title: 'Friend / Campus Escort (English)',
      spokenLine: "Hey! I can see your location on the map, I'm standing right outside Gate 2 with two friends. See you in thirty seconds!",
      displayText: '“Hey! I can see your location on the map, I’m standing right outside Gate 2 with two friends. See you in 30 seconds!”',
      translation: 'Clear audible deterrent indicating you are closely tracked and awaited.',
      suggestedReply: 'Say: "Coming! I can see the gate lights right ahead!"',
    },
    police_checkin: {
      title: 'Pink Booth Police Check',
      spokenLine: 'Namaste, Delhi Police Pink Booth Chattra Marg. Aapka live track monitor ho raha hai, koi issue toh nahi hai?',
      displayText: '“Namaste, Delhi Police Pink Booth Chattra Marg. Aapka live track monitor ho raha hai, koi issue toh nahi hai?”',
      translation: '“Hello, Delhi Police Pink Booth. Your live route is monitored on our beat screen, all okay?”',
      suggestedReply: 'Say: "Namaste Officer, all good, passing your booth right now!"',
    },
  };

  // Ringtone generator using Web Audio API (standard 440Hz + 480Hz dual-frequency ringing)
  const startRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const playRingBurst = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        try {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(440, ctx.currentTime);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(480, ctx.currentTime);

          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + 1.8);
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 2.0);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(ctx.currentTime);
          osc2.start(ctx.currentTime);
          osc1.stop(ctx.currentTime + 2.0);
          osc2.stop(ctx.currentTime + 2.0);
        } catch (_) {}
      };

      playRingBurst();
      ringtoneTimerRef.current = setInterval(playRingBurst, 4000);
    } catch (_) {}
  };

  const stopRingtone = () => {
    if (ringtoneTimerRef.current) {
      clearInterval(ringtoneTimerRef.current);
      ringtoneTimerRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
  };

  // Speech Synthesis for deterrent voice
  const speakDeterrentVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const current = scripts[selectedScript];
      const utterance = new SpeechSynthesisUtterance(current.spokenLine);
      utterance.rate = 0.95;
      utterance.pitch = selectedScript === 'hindi_family' ? 0.9 : 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.lang.includes('IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  // On Open logic
  useEffect(() => {
    if (isOpen) {
      setCallState('incoming');
      setCallDuration(0);
      setScheduledSeconds(0);
      startRingtone();

      if ('vibrate' in navigator) {
        try { navigator.vibrate([500, 300, 500, 300, 500, 300, 500]); } catch (_) {}
      }
    } else {
      stopRingtone();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
    }

    return () => {
      stopRingtone();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
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

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const remaining = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${remaining}`;
  };

  const handleAnswer = () => {
    stopRingtone();
    setCallState('connected');
    if ('vibrate' in navigator) {
      try { navigator.vibrate(50); } catch (_) {}
    }
    setTimeout(() => {
      speakDeterrentVoice();
    }, 400);
  };

  const handleDecline = () => {
    stopRingtone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 350);
  };

  const scheduleCallInSeconds = (secs: number) => {
    stopRingtone();
    setCallState('scheduling');
    setScheduledSeconds(secs);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setScheduledSeconds((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setCallState('incoming');
          startRingtone();
          if ('vibrate' in navigator) {
            try { navigator.vibrate([500, 300, 500, 300, 500]); } catch (_) {}
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-between p-6 text-white font-sans select-none animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="font-semibold text-slate-200">Call Me Out · Audio Deterrent</span>
        </div>

        <button
          onClick={handleDecline}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scheduled Call Delay Mode */}
      {callState === 'scheduling' ? (
        <div className="flex-1 flex flex-col items-center justify-center my-6 space-y-4 text-center">
          <div className="w-20 h-20 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center animate-pulse">
            <Clock size={36} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Call Scheduled</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              Your phone will ring loudly in <strong className="text-sky-300 font-mono text-base">{scheduledSeconds}s</strong>.
              Keep walking confidently.
            </p>
          </div>
          <button
            onClick={() => {
              if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
              setCallState('incoming');
              startRingtone();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
          >
            Ring Now Immediately
          </button>
        </div>
      ) : (
        /* Main Caller Profile */
        <div className="flex-1 flex flex-col items-center justify-center my-4 space-y-3.5">
          {/* Caller Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-slate-600 flex items-center justify-center shadow-2xl">
              <User size={48} className="text-slate-300" />
            </div>
            {callState === 'incoming' && (
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
            )}
          </div>

          {/* Caller Name & Number */}
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">{callerName}</h2>
            <div className="text-xs font-mono text-slate-400 mt-0.5">{callerPhone}</div>
            <div className="mt-1.5 text-xs font-medium text-emerald-400">
              {callState === 'incoming' && 'Incoming Audio Call...'}
              {callState === 'connected' && (
                <span className="font-mono text-emerald-300 text-sm font-bold">
                  {formatSeconds(callDuration)}
                </span>
              )}
              {callState === 'ended' && 'Call Ended'}
            </div>
          </div>

          {/* Connected In-Call Deterrent Card */}
          {callState === 'connected' && (
            <div className="max-w-xs w-full bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2 text-center shadow-xl animate-fade-in">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                <span>Audible Deterrent Line</span>
                <button
                  onClick={speakDeterrentVoice}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 cursor-pointer font-bold"
                  title="Replay Spoken Audio"
                >
                  <RotateCcw size={11} />
                  <span>Replay Voice</span>
                </button>
              </div>

              <div className="text-xs font-semibold text-white leading-relaxed bg-black/30 p-2.5 rounded-xl border border-slate-800">
                {scripts[selectedScript].displayText}
              </div>

              <div className="text-[11px] text-amber-300 font-medium">
                {scripts[selectedScript].suggestedReply}
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    isSpeakerOn
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
                  <span>{isSpeakerOn ? 'Speaker ON' : 'Earpiece'}</span>
                </button>

                <button
                  onClick={speakDeterrentVoice}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow"
                >
                  <Volume2 size={12} />
                  <span>Speak Line Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Caller Selection & Delay Options (When Incoming) */}
          {callState === 'incoming' && (
            <div className="w-full max-w-xs space-y-2">
              {/* Presets */}
              <div className="flex justify-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => {
                    setCallerName('Papa');
                    setCallerPhone('+91 98112-90142');
                    setSelectedScript('hindi_family');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    callerName === 'Papa' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Papa (Hindi)
                </button>
                <button
                  onClick={() => {
                    setCallerName('Campus Friend');
                    setCallerPhone('+91 99201-44120');
                    setSelectedScript('english_car');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    callerName.includes('Friend') ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Friend (Eng)
                </button>
                <button
                  onClick={() => {
                    setCallerName('Pink Booth Desk #4');
                    setCallerPhone('112 / Delhi Police');
                    setSelectedScript('police_checkin');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    callerName.includes('Pink') ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Police Booth
                </button>
              </div>

              {/* Delay Trigger Pills */}
              <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                <span>Delay call before ringing:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => scheduleCallInSeconds(10)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono border border-slate-700 cursor-pointer"
                  >
                    +10s
                  </button>
                  <button
                    onClick={() => scheduleCallInSeconds(30)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono border border-slate-700 cursor-pointer"
                  >
                    +30s
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="max-w-xs mx-auto w-full pb-4">
        {callState === 'incoming' && (
          <div className="flex items-center justify-around">
            {/* Decline Button */}
            <button
              onClick={handleDecline}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/40 cursor-pointer transition"
              title="Decline"
              aria-label="Decline Call"
            >
              <PhoneOff size={28} />
            </button>

            {/* Answer Button */}
            <button
              onClick={handleAnswer}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 cursor-pointer transition animate-pulse"
              title="Answer"
              aria-label="Answer Call"
            >
              <Phone size={28} />
            </button>
          </div>
        )}

        {callState === 'connected' && (
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
