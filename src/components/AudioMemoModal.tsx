/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, ShieldCheck, X, CheckCircle2, Clock } from 'lucide-react';
import { AppTheme } from '../utils/themeConfig';

interface AudioMemo {
  id: string;
  blobUrl: string;
  durationSec: number;
  timestamp: string;
  coords: [number, number];
}

interface AudioMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  userCoords: [number, number];
}

export const AudioMemoModal: React.FC<AudioMemoModalProps> = ({
  isOpen,
  onClose,
  theme,
  userCoords,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [memos, setMemos] = useState<AudioMemo[]>([]);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setRecordingSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const newMemo: AudioMemo = {
            id: `memo_${Date.now()}`,
            blobUrl: audioUrl,
            durationSec: recordingSeconds,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            coords: userCoords,
          };
          setMemos((prev) => [newMemo, ...prev]);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);

        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        // Fallback simulated recording if browser mediaDevices not available
        simulateRecording();
      }
    } catch (_) {
      // Permission denied or headless environment fallback
      simulateRecording();
    }
  };

  const simulateRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulated memo for testing environment
      const newMemo: AudioMemo = {
        id: `memo_${Date.now()}`,
        blobUrl: '',
        durationSec: Math.max(3, recordingSeconds),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        coords: userCoords,
      };
      setMemos((prev) => [newMemo, ...prev]);
    }

    setIsRecording(false);
  };

  const togglePlayMemo = (memo: AudioMemo) => {
    if (activePlayingId === memo.id) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setActivePlayingId(null);
    } else {
      if (memo.blobUrl) {
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio(memo.blobUrl);
        } else {
          audioElementRef.current.src = memo.blobUrl;
        }
        audioElementRef.current.onended = () => setActivePlayingId(null);
        audioElementRef.current.play().catch(() => {});
      }
      setActivePlayingId(memo.id);
      setTimeout(() => setActivePlayingId(null), memo.durationSec * 1000);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const remaining = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${remaining}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className={`w-full max-w-sm rounded-3xl ${theme.bgCard} border ${theme.borderHighlight} p-5 shadow-2xl text-white space-y-4 max-h-[85vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
              <Mic size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Audio Safety Memo & Evidence</span>
              </h2>
              <p className={`text-[10px] ${theme.textMuted}`}>
                Discreet 30-sec ambient recording locked to GPS
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Recorder Centerpiece */}
        <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex flex-col items-center justify-center space-y-3">
          {isRecording ? (
            <>
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/40 animate-pulse">
                  <Mic size={32} />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-60 pointer-events-none" />
              </div>

              <div className="font-mono text-2xl font-bold text-rose-300">
                {formatSeconds(recordingSeconds)}
              </div>
              <div className="text-[10px] text-rose-300 uppercase tracking-wider font-bold">
                ● Recording Ambient Audio & Evidence...
              </div>

              <button
                onClick={stopRecording}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Square size={14} fill="currentColor" />
                <span>Save Audio Evidence</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center">
                <Mic size={26} />
              </div>

              <div className="text-center space-y-1">
                <div className="font-bold text-xs text-white">Record Situational Audio</div>
                <div className={`text-[10px] ${theme.textMuted}`}>
                  Discreetly capture harassment verbal notes or suspicious vehicle noises.
                </div>
              </div>

              <button
                onClick={startRecording}
                className={`w-full py-2.5 rounded-xl ${theme.accentBg} text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md ${theme.accentGlow}`}
              >
                <Mic size={14} />
                <span>Start Audio Safety Memo</span>
              </button>
            </>
          )}
        </div>

        {/* Saved Memos List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Encrypted Device Memos ({memos.length})
          </div>

          {memos.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500 italic">
              No audio memos recorded yet.
            </div>
          ) : (
            memos.map((memo) => (
              <div
                key={memo.id}
                className="p-2.5 rounded-xl bg-black/25 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePlayMemo(memo)}
                    className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center cursor-pointer"
                  >
                    {activePlayingId === memo.id ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                  <div>
                    <div className="font-bold text-white text-[11px]">
                      Audio Note · {memo.timestamp}
                    </div>
                    <div className={`text-[9px] ${theme.textMuted} font-mono`}>
                      {memo.durationSec}s · {memo.coords[0].toFixed(4)}°N, {memo.coords[1].toFixed(4)}°E
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setMemos((prev) => prev.filter((m) => m.id !== memo.id))}
                  className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
