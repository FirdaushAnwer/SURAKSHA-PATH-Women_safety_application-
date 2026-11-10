/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ShieldAlert, PhoneCall, X } from 'lucide-react';

interface StrobeDeterrentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrobeDeterrentModal: React.FC<StrobeDeterrentModalProps> = ({ isOpen, onClose }) => {
  const [isStrobeActive, setIsStrobeActive] = useState(true);
  const [strobeColor, setStrobeColor] = useState<'white' | 'red'>('white');
  const [isSirenActive, setIsSirenActive] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Strobe effect interval (8Hz alternating flash)
  useEffect(() => {
    if (!isOpen || !isStrobeActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setStrobeColor((prev) => (prev === 'white' ? 'red' : 'white'));
    }, 125);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, isStrobeActive]);

  // Dual-frequency synthesized acoustic siren sweep
  useEffect(() => {
    if (!isOpen || !isSirenActive) {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (_) {}
        oscRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850, ctx.currentTime);

      // Continuous frequency sweep from 850Hz to 1350Hz (standard emergency siren)
      const now = ctx.currentTime;
      for (let i = 0; i < 40; i++) {
        osc.frequency.linearRampToValueAtTime(1350, now + i * 0.8 + 0.4);
        osc.frequency.linearRampToValueAtTime(850, now + i * 0.8 + 0.8);
      }

      gain.gain.setValueAtTime(0.85, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;

      // Haptic vibration pulse
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([300, 100, 300, 100, 300, 100, 500]);
        } catch (_) {}
      }
    } catch (_) {}

    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (_) {}
        oscRef.current = null;
      }
    };
  }, [isOpen, isSirenActive]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 select-none transition-colors duration-75 ${
        strobeColor === 'white' ? 'bg-white text-slate-950' : 'bg-red-600 text-white'
      }`}
    >
      {/* Top Warning Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert size={24} className="animate-bounce" />
          <span className="text-base font-black tracking-wider uppercase">
            EMERGENCY DEFENSIVE STROBE & SIREN
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Flashing Strobe Message */}
      <div className="text-center space-y-4 my-auto">
        <div className="text-5xl font-black uppercase tracking-tight">
          HELP NEEDED
        </div>
        <p className="text-lg font-bold max-w-xs mx-auto leading-tight">
          ATTRACTING IMMEDIATE BYSTANDER ASSISTANCE & DISTRESS POLICE DISPATCH
        </p>

        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => setIsSirenActive(!isSirenActive)}
            className="px-4 py-2 rounded-xl bg-black/60 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xl"
          >
            {isSirenActive ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isSirenActive ? 'Mute Audio' : 'Unmute Siren'}</span>
          </button>

          <button
            onClick={() => setIsStrobeActive(!isStrobeActive)}
            className="px-4 py-2 rounded-xl bg-black/60 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xl"
          >
            <span>{isStrobeActive ? 'Pause Flasher' : 'Resume Flasher'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Emergency Action Controls */}
      <div className="space-y-3 max-w-sm mx-auto w-full pb-4">
        <a
          href="tel:112"
          className="w-full py-4 rounded-2xl bg-black text-white hover:bg-neutral-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-2xl transition cursor-pointer"
        >
          <PhoneCall size={20} className="text-red-400" />
          <span>CALL 112 NATIONAL POLICE DISPATCH</span>
        </a>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-white/20 backdrop-blur-md text-inherit font-bold text-xs hover:bg-white/30 border border-current transition cursor-pointer"
        >
          I am Safe Now · Dismiss Deterrent
        </button>
      </div>
    </div>
  );
};
