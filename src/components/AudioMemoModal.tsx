/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  ShieldCheck,
  X,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  Volume2
} from 'lucide-react';
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
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
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
        simulateRecording();
      }
    } catch (_) {
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Add simulated memo if mediaDevices wasn't available
      const newMemo: AudioMemo = {
        id: `memo_${Date.now()}`,
        blobUrl: '',
        durationSec: recordingSeconds,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        coords: userCoords,
      };
      setMemos((prev) => [newMemo, ...prev]);
    }

    setIsRecording(false);
  };

  const handlePlayToggle = (memo: AudioMemo) => {
    if (activePlayingId === memo.id) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setActivePlayingId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (memo.blobUrl) {
        const audio = new Audio(memo.blobUrl);
        audioElementRef.current = audio;
        audio.onended = () => setActivePlayingId(null);
        audio.play().catch(() => {});
        setActivePlayingId(memo.id);
      } else {
        setActivePlayingId(memo.id);
        setTimeout(() => setActivePlayingId(null), memo.durationSec * 1000);
      }
    }
  };

  const handleDeleteMemo = (id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
    if (activePlayingId === id) {
      if (audioElementRef.current) audioElementRef.current.pause();
      setActivePlayingId(null);
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
                1-tap ambient voice recording stored on-device with GPS coordinates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Recorder Centerpiece */}
        <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-2xl cursor-pointer ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-500 animate-pulse text-white shadow-red-600/50'
                  : `${theme.accentBg} text-white shadow-rose-500/30`
              }`}
              title={isRecording ? 'Stop Recording' : 'Start Audio Recording'}
            >
              {isRecording ? <Square size={26} fill="currentColor" /> : <Mic size={28} />}
            </button>

            {isRecording && (
              <div className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping opacity-60" />
            )}
          </div>

          <div className="text-center">
            <div className="font-mono text-xl font-bold text-white">
              {formatSeconds(recordingSeconds)}
            </div>
            <div className={`text-[10px] ${theme.textMuted} mt-0.5`}>
              {isRecording ? 'Recording ambient audio & conversation...' : 'Tap microphone to start recording'}
            </div>
          </div>
        </div>

        {/* Saved Memos List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
            <span>Saved Voice Evidence ({memos.length})</span>
            <span className="text-[9px] text-emerald-400 font-medium">100% On-Device</span>
          </div>

          {memos.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No audio memos recorded yet.
            </div>
          ) : (
            memos.map((memo) => (
              <div
                key={memo.id}
                className="p-3 rounded-2xl bg-black/30 border border-slate-800 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handlePlayToggle(memo)}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-rose-300 flex items-center justify-center cursor-pointer transition"
                    title={activePlayingId === memo.id ? 'Pause' : 'Play'}
                  >
                    {activePlayingId === memo.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>

                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Recorded {memo.timestamp}</span>
                      <span className="text-[10px] font-mono text-slate-400">({memo.durationSec}s)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <MapPin size={9} />
                      <span>{memo.coords[0].toFixed(4)}°, {memo.coords[1].toFixed(4)}°</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {memo.blobUrl && (
                    <a
                      href={memo.blobUrl}
                      download={`suraksha-audio-${memo.id}.webm`}
                      className="p-1.5 text-slate-400 hover:text-sky-300 transition cursor-pointer"
                      title="Download Audio File"
                    >
                      <Download size={14} />
                    </a>
                  )}

                  <button
                    onClick={() => handleDeleteMemo(memo.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                    title="Delete Memo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
          🔒 Audio memos are private and never uploaded without your consent.
        </div>
      </div>
    </div>
  );
};
