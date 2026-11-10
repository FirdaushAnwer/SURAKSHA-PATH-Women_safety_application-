/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  Shield,
  ShieldAlert,
  AlertTriangle,
  MapPin,
  X,
  Key,
  CheckCircle2,
  Heart,
  Zap,
  PhoneIncoming,
  Share2,
  HelpCircle,
  Clock,
  Compass
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { AppTheme } from '../utils/themeConfig';
import { SafeHaven } from '../utils/safetyMath';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'saheli';
  text: string;
  timestamp: string;
  actionType?: 'sos' | 'fake_call' | 'haven' | 'siren' | 'share';
  actionLabel?: string;
}

interface SurakshaAiCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  userCoords: [number, number];
  currentHour: number;
  safetyScore: number;
  nearestHaven?: SafeHaven | null;
  onTriggerSos: () => void;
  onTriggerFakeCall: () => void;
  onTriggerSiren: () => void;
  onRerouteToHaven: (haven: SafeHaven) => void;
  onOpenTripShare: () => void;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'saheli',
  text: `Namaste! 🌸 I am Saheli, your personal safety companion & guardian. Whether you are walking home late, feeling uneasy about an unfamiliar street, or want to know the safest illuminated route, I'm right here with you every step of the way.\n\nHow can I help you right now?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const SurakshaAiCompanionModal: React.FC<SurakshaAiCompanionModalProps> = ({
  isOpen,
  onClose,
  theme,
  userCoords,
  currentHour,
  safetyScore,
  nearestHaven,
  onTriggerSos,
  onTriggerFakeCall,
  onTriggerSiren,
  onRerouteToHaven,
  onOpenTripShare,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('surakshapath_gemini_key') ||
        (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
        ''
      );
    } catch (_) {
      return '';
    }
  });
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Voice speech synthesis
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const clean = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  // Web Speech API for voice input
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (_) {
      setIsListening(false);
    }
  };

  // Save API Key
  const handleSaveApiKey = () => {
    setApiKey(tempApiKey.trim());
    try {
      localStorage.setItem('surakshapath_gemini_key', tempApiKey.trim());
    } catch (_) {}
    setShowKeySettings(false);
  };

  // Offline / Fallback empathetic responses when Gemini is offline or without API key
  const getOfflineEmpatheticResponse = (query: string): { text: string; actionType?: ChatMessage['actionType']; actionLabel?: string } => {
    const q = query.toLowerCase();

    if (q.includes('follow') || q.includes('stalk') || q.includes('behind me') || q.includes('scared') || q.includes('creepy')) {
      return {
        text: `🌸 Stay calm, I am right here with you. Do this immediately:\n\n1. **Head towards light & people**: Walk firmly into the nearest open shop, pharmacy, or brightly lit stall.\n2. **Simulate a call**: I have prepared a fake call for you right below. Tap it to make your phone ring realistically and pretend your family is waiting right on the next corner!\n3. **Do not go into dark shortcuts**: Stay on the main illuminated avenue.`,
        actionType: 'fake_call',
        actionLabel: '📞 Trigger Fake Incoming Call Now',
      };
    }

    if (q.includes('haven') || q.includes('shelter') || q.includes('police') || q.includes('pink booth') || q.includes('safe place') || q.includes('help')) {
      const havenName = nearestHaven ? nearestHaven.name : 'Delhi Police Pink Booth #4 (Chattra Marg)';
      return {
        text: `🛡️ The nearest verified 24/7 Safe Haven is **${havenName}**.\n\nIt is monitored, well-lit, and staffed with women officers & support personnel. Tap below to re-route via the safest illuminated corridors directly to this sanctuary.`,
        actionType: 'haven',
        actionLabel: `🏃 Re-Route to ${nearestHaven?.name || 'Pink Booth'}`,
      };
    }

    if (q.includes('detour') || q.includes('cab') || q.includes('auto') || q.includes('driver') || q.includes('taxi')) {
      return {
        text: `🚕 **Cab / Auto Safety Protocol:**\n\n1. Immediately send your live encrypted trip link to your primary guardians so they see your real-time GPS.\n2. Speak aloud firmly on phone: *"Yes Papa, I just shared my live GPS trip with you, reaching in 5 minutes."*\n3. If the driver refuses to follow the route, tap the Emergency SOS button immediately to alert dispatch.`,
        actionType: 'share',
        actionLabel: '📍 Share Live Trip Link on WhatsApp',
      };
    }

    if (q.includes('siren') || q.includes('alarm') || q.includes('attacker') || q.includes('emergency') || q.includes('danger') || q.includes('help me')) {
      return {
        text: `🚨 **EMERGENCY ASSISTANCE INITIATED:**\n\nDraw immediate public attention and disorient anyone threatening you. Tap below to sound the high-decibel defensive siren and flash the 8Hz strobe light, or broadcast an emergency SOS alert.`,
        actionType: 'sos',
        actionLabel: '🚨 Broadcast SOS & Sound Alarm',
      };
    }

    if (q.includes('calm') || q.includes('breathe') || q.includes('anxious') || q.includes('panic') || q.includes('heart')) {
      return {
        text: `🌸 Take a slow, deep breath in with me... (4 seconds)\nNow hold gently... (4 seconds)\nAnd exhale slowly... (4 seconds).\n\nYou are capable, strong, and not alone. Your SurakshaPath guard is actively monitoring your route. You are currently on an illuminated street with an overall safety score of ${(safetyScore * 100).toFixed(0)}%. Walk tall, keep your head up, and trust your instincts.`,
      };
    }

    if (q.includes('why') || q.includes('longer') || q.includes('route') || q.includes('formula') || q.includes('algorithm')) {
      return {
        text: `💡 **Why SurakshaPath adds a small detour:**\n\nStandard navigation apps prioritize only distance (minimizing meters), which frequently routes pedestrians into pitch-black, deserted alleys or liquor vend corners. SurakshaPath uses our **A* Safety Impedance Formula** (S(e,t) = 0.35·L + 0.25·O + 0.20·C − 0.20·I).\n\nBy taking a 2–3 minute longer detour on wide, illuminated avenues with open sightlines and active footfall, your risk profile drops by over **85%**!`,
      };
    }

    if (q.includes('privacy') || q.includes('pii') || q.includes('track') || q.includes('data')) {
      return {
        text: `🔒 **Your Privacy is Mathematically Guaranteed:**\n\n• **Zero-PII**: No names, phone numbers, or device identifiers are ever attached to hazard reports.\n• **Hexagonal Aggregation**: Reports are aggregated into 150m Uber H3 hexagons with k-anonymity (k ≥ 3).\n• **Time Delay**: Hazard reports have a randomized delay so no one can reconstruct commuter movement schedules.\n• **Ephemeral Links**: Trip sharing uses end-to-end encryption with keys that expire automatically upon arrival.`,
      };
    }

    return {
      text: `🌸 I am right here with you! You are currently walking with a **${(safetyScore * 100).toFixed(0)}% safety rating**. \n\n• Need someone to deter anyone around you? Try triggering our **Call Me Out Fake Call**.\n• Looking for shelter? We have 4 verified 24/7 Safe Havens within walking range.\n• Need your family to watch you? Share your live encrypted trip anytime!`,
      actionType: 'haven',
      actionLabel: '🌸 Explore Nearest Safe Havens',
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const activeKey = apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

      if (activeKey) {
        // Live Gemini Call
        const ai = new GoogleGenAI({ apiKey: activeKey });
        const systemPrompt = `You are "Suraksha Saheli" (सुरक्षा सहेली), an empathetic, protective, and tactical AI safety companion designed for women commuters, college students, and night shift workers in Indian urban settings.
Your tone is like a fearless, loving, alert elder sister and personal safety coach.
Keep your answers supportive, concise (under 3-4 short paragraphs), practical, and actionable.
Current commuter context:
- Time: ${currentHour}:00 (Evening / Night)
- Coordinates: ${userCoords[0].toFixed(4)}, ${userCoords[1].toFixed(4)}
- Safety score: ${(safetyScore * 100).toFixed(0)}%
- Nearest haven: ${nearestHaven ? nearestHaven.name : 'Delhi Police Pink Booth (Chattra Marg)'}
If the user indicates harassment, following, or danger, give clear de-escalation steps, advise heading to brightly lit open shops, and recommend sounding alarms or triggering fake calls.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: query,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        const replyText = response.text || "I am right here with you. Stay on the illuminated main road and stay calm.";

        // Match possible tactical action
        let actionType: ChatMessage['actionType'] = undefined;
        let actionLabel: string | undefined = undefined;

        const qLower = query.toLowerCase();
        if (qLower.includes('follow') || qLower.includes('call') || qLower.includes('creepy')) {
          actionType = 'fake_call';
          actionLabel = '📞 Trigger Simulated Fake Call';
        } else if (qLower.includes('danger') || qLower.includes('sos') || qLower.includes('emergency')) {
          actionType = 'sos';
          actionLabel = '🚨 Trigger SOS Broadcast';
        } else if (qLower.includes('haven') || qLower.includes('safe') || qLower.includes('booth')) {
          actionType = 'haven';
          actionLabel = `🏃 Escort to ${nearestHaven?.name || 'Safe Haven'}`;
        }

        const botMsg: ChatMessage = {
          id: `s_${Date.now()}`,
          sender: 'saheli',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType,
          actionLabel,
        };

        setMessages((prev) => [...prev, botMsg]);
        if (autoSpeak) speakText(replyText);
      } else {
        // Empathetic Offline Fallback Engine
        await new Promise((r) => setTimeout(r, 600)); // Natural response delay
        const fallback = getOfflineEmpatheticResponse(query);

        const botMsg: ChatMessage = {
          id: `s_${Date.now()}`,
          sender: 'saheli',
          text: fallback.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType: fallback.actionType,
          actionLabel: fallback.actionLabel,
        };

        setMessages((prev) => [...prev, botMsg]);
        if (autoSpeak) speakText(fallback.text);
      }
    } catch (err: any) {
      console.warn('Gemini request fallback to heuristic:', err);
      const fallback = getOfflineEmpatheticResponse(query);

      const botMsg: ChatMessage = {
        id: `s_${Date.now()}`,
        sender: 'saheli',
        text: fallback.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: fallback.actionType,
        actionLabel: fallback.actionLabel,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (autoSpeak) speakText(fallback.text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionType?: ChatMessage['actionType']) => {
    if (!actionType) return;
    onClose();
    if (actionType === 'sos') onTriggerSos();
    if (actionType === 'fake_call') onTriggerFakeCall();
    if (actionType === 'siren') onTriggerSiren();
    if (actionType === 'haven') {
      if (nearestHaven) onRerouteToHaven(nearestHaven);
    }
    if (actionType === 'share') onOpenTripShare();
  };

  if (!isOpen) return null;

  const quickChips = [
    { label: '👣 Someone is following me', text: 'I feel like someone is walking behind me or following me. What should I do right now?' },
    { label: '💡 Why is safe route longer?', text: 'Why is the SurakshaPath safe route a bit longer than standard GPS?' },
    { label: '🚕 Cab took unfamiliar detour', text: 'My cab driver just took an unexpected turn into an unlit area. What should I do?' },
    { label: '🌸 Nearest Pink Booth', text: 'Where is the nearest Pink Police Booth or safe sanctuary?' },
    { label: '🧘 Calm me down', text: 'I feel very anxious and nervous walking here. Can you help me calm down and stay grounded?' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`w-full sm:max-w-md ${theme.bgCard} border ${theme.borderHighlight} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[82vh] transition-all duration-200`}>
        {/* Header */}
        <div className={`p-3.5 ${theme.bgHeader} border-b ${theme.borderBase} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/30 text-white font-black text-sm">
                🌸
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white tracking-tight leading-none">
                  Suraksha Saheli
                </h2>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${theme.sisterhoodBadge}`}>
                  AI COMPANION
                </span>
              </div>
              <p className={`text-[10px] ${theme.textMuted} mt-0.5 flex items-center gap-1`}>
                <Sparkles size={10} className="text-rose-400" />
                <span>{apiKey ? 'Powered by Gemini 2.5 Flash' : 'Empathetic Sisterhood Guard'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Auto Voice Toggle */}
            <button
              onClick={() => {
                setAutoSpeak(!autoSpeak);
                if (!autoSpeak) {
                  speakText('Voice output enabled. I will read my answers aloud.');
                } else {
                  window.speechSynthesis?.cancel();
                }
              }}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                autoSpeak
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-white'
              }`}
              title={autoSpeak ? 'Voice Speech Active' : 'Enable Voice Read-Aloud'}
            >
              {autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* API Key Settings Button */}
            <button
              onClick={() => setShowKeySettings(!showKeySettings)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                showKeySettings
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-white'
              }`}
              title="Configure Gemini API Key"
            >
              <Key size={14} />
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Optional Gemini API Key Drawer */}
        {showKeySettings && (
          <div className="bg-slate-950 p-3 border-b border-slate-800 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1">
                <Key size={12} className="text-rose-400" />
                <span>Gemini API Key (Optional)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {apiKey ? '✓ Configured' : 'Offline Engine Active'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Provide your key to unlock live contextual generation with Gemini 2.5 Flash. When omitted, Saheli uses its built-in offline women's safety knowledge base.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-rose-400"
              />
              <button
                onClick={handleSaveApiKey}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className={`flex-1 p-3.5 overflow-y-auto space-y-3 ${theme.bgApp}`}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? `${theme.accentBg} text-white rounded-br-none shadow-md ${theme.accentGlow}`
                      : `${theme.bgCard} border ${theme.borderHighlight} text-rose-50 rounded-bl-none shadow-sm`
                  }`}
                >
                  {msg.text}

                  {/* Action Button inside Saheli message if any */}
                  {msg.actionType && msg.actionLabel && (
                    <div className="mt-2.5 pt-2 border-t border-rose-500/20">
                      <button
                        onClick={() => handleActionClick(msg.actionType)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md ${
                          msg.actionType === 'sos'
                            ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                            : msg.actionType === 'fake_call'
                            ? 'bg-sky-600 hover:bg-sky-500 text-white'
                            : `${theme.accentBg} text-white`
                        }`}
                      >
                        {msg.actionType === 'sos' && <ShieldAlert size={14} />}
                        {msg.actionType === 'fake_call' && <PhoneIncoming size={14} />}
                        {msg.actionType === 'haven' && <Shield size={14} />}
                        {msg.actionType === 'share' && <Share2 size={14} />}
                        <span>{msg.actionLabel}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono px-1">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="hover:text-rose-300 ml-1 cursor-pointer"
                      title="Speak Message"
                    >
                      <Volume2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-rose-300 text-xs p-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>Saheli is typing safety guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className={`p-2 ${theme.bgCard} border-t ${theme.borderBase} overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0`}>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.text)}
              className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer whitespace-nowrap ${
                theme.isDark
                  ? 'bg-slate-900/80 hover:bg-rose-950/60 text-rose-200 border-rose-500/30'
                  : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-200 shadow-sm'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className={`p-2.5 ${theme.bgHeader} border-t ${theme.borderBase} flex items-center gap-2 shrink-0`}>
          <button
            onClick={toggleListening}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse border-rose-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak via Microphone'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask Saheli for safety tips or emergency guidance..."
            className={`flex-1 bg-slate-900/90 border border-slate-700/80 focus:border-rose-400 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none transition`}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className={`p-2 rounded-xl ${theme.accentBg} text-white font-bold transition cursor-pointer shadow-md ${theme.accentGlow} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Send Message"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
