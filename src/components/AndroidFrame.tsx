import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Grid3X3,
  PlusCircle,
  Building2,
  Sliders,
  Info,
  Maximize2,
  Minimize2,
  PhoneCall,
  Wifi,
  BatteryCharging,
  Shield,
  Calculator,
  PhoneIncoming,
  Clock,
  Sparkles,
  Palette,
  Zap,
  Users,
  Mic
} from 'lucide-react';
import { AppTheme, AppThemeId, APP_THEMES } from '../utils/themeConfig';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineBanner } from './OfflineBanner';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab: 'route' | 'havens' | 'h3' | 'report' | 'share' | 'civic';
  setActiveTab: (tab: 'route' | 'havens' | 'h3' | 'report' | 'share' | 'civic') => void;
  theme: AppTheme;
  onChangeTheme: (themeId: AppThemeId) => void;
  onOpenSimulator: () => void;
  onOpenDossier: () => void;
  onTriggerSOS: () => void;
  onOpenStealthCalculator: () => void;
  onTriggerFakeCall: () => void;
  onOpenWalkTimer: () => void;
  onOpenEmergencyContacts: () => void;
  onOpenStrobeDeterrent: () => void;
  onOpenAudioMemo: () => void;
  pendingCivicPromptCount: number;
  safetyScore: number;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeTab,
  setActiveTab,
  theme,
  onChangeTheme,
  onOpenSimulator,
  onOpenDossier,
  onTriggerSOS,
  onOpenStealthCalculator,
  onTriggerFakeCall,
  onOpenWalkTimer,
  onOpenEmergencyContacts,
  onOpenStrobeDeterrent,
  onOpenAudioMemo,
  pendingCivicPromptCount,
  safetyScore,
}) => {
  const [currentTime, setCurrentTime] = useState('21:04');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab: 'route' | 'havens' | 'h3' | 'report' | 'share' | 'civic') => {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(12); } catch (_) {}
    }
    setActiveTab(tab);
  };

  const navItems = [
    {
      id: 'route' as const,
      label: 'Safe Path',
      sub: 'A* Router',
      icon: Navigation,
      badge: null,
    },
    {
      id: 'havens' as const,
      label: 'Havens',
      sub: '24/7 Shelters',
      icon: Shield,
      badge: '4 Safe',
    },
    {
      id: 'report' as const,
      label: '3-Tap Audit',
      sub: 'Zero-PII',
      icon: PlusCircle,
      highlight: true,
      badge: null,
    },
    {
      id: 'h3' as const,
      label: 'H3 Grid',
      sub: 'Res 9 Heatmap',
      icon: Grid3X3,
      badge: '150m',
    },
    {
      id: 'civic' as const,
      label: 'Civic Loop',
      sub: 'PWD & Police',
      icon: Building2,
      badge: pendingCivicPromptCount > 0 ? `${pendingCivicPromptCount}` : null,
    },
  ];

  return (
    <div className={`min-h-screen ${theme.isDark ? 'bg-slate-950 text-slate-100' : 'bg-rose-100/60 text-slate-900'} flex flex-col items-center justify-center p-0 md:p-3 selection:bg-rose-500 selection:text-white font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300`}>
      {/* Top Desktop Controls Bar */}
      <header className={`w-full max-w-5xl hidden md:flex items-center justify-between py-2 px-4 mb-2 text-xs ${theme.isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-600 border-rose-200'} border-b`}>
        <div className="flex items-center gap-2">
          <span className="text-sm">🌸</span>
          <span className={`font-semibold ${theme.isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            SurakshaPath: Dynamic Safe-Routing
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${theme.sisterhoodBadge}`}>
            SEVA FIRST 2026 · TRL-6
          </span>
          <span className="text-slate-400 hidden lg:inline">Team QUANTAKRYPTS · Sri Siddhartha School of Engg</span>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton theme={theme} />

          {/* Theme Selector Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition cursor-pointer ${
                theme.isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700'
                  : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
              }`}
              title="Change Aesthetic Theme"
            >
              <Palette size={13} className="text-rose-400" />
              <span>{theme.emoji} {theme.name}</span>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-fade-in space-y-1">
                {(Object.values(APP_THEMES) as AppTheme[]).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onChangeTheme(t.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                      theme.id === t.id
                        ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{t.emoji} {t.name}</span>
                    {theme.id === t.id && <span className="text-rose-400 text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenSimulator}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition cursor-pointer ${
              theme.isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-rose-50 text-slate-800 border-rose-200'
            }`}
            title="Open Formula & A* Simulation Lab"
          >
            <Sliders size={13} className="text-rose-400" />
            <span>Slide 9 Math Engine</span>
          </button>

          <button
            onClick={onOpenDossier}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition cursor-pointer ${
              theme.isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-rose-50 text-slate-800 border-rose-200'
            }`}
            title="View SEVA FIRST Innovation Challenge Details"
          >
            <Info size={13} className="text-sky-400" />
            <span>Project Dossier</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition cursor-pointer ${
              theme.isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-rose-50 text-slate-700 border-rose-200'
            }`}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? 'Phone Frame' : 'Fullscreen'}</span>
          </button>
        </div>
      </header>

      {/* Main Device Container */}
      <div
        className={`relative flex flex-col ${theme.bgApp} overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-screen rounded-none'
            : 'w-full md:w-[420px] h-[92vh] max-h-[890px] md:rounded-[44px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-0 md:border-[10px] md:border-slate-800/90 ring-1 ring-slate-700/50'
        }`}
      >
        {/* Offline Banner Notification */}
        <OfflineBanner theme={theme} />

        {/* Top Android Status Bar */}
        <div className={`relative z-40 ${theme.bgHeader} backdrop-blur-md px-4 pt-2.5 pb-1.5 flex items-center justify-between text-xs ${theme.textSecondary} border-b ${theme.borderBase}`}>
          <div className="flex items-center gap-1.5 font-semibold tracking-tight font-mono text-[12px] w-20">
            <span>{currentTime}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse ml-0.5" />
          </div>

          {/* Android Punch Hole Camera & Dynamic Island Pill */}
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/90 border border-slate-700/80 text-[10px] font-medium text-rose-300 shadow-md">
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ring-1 ring-slate-700 shrink-0 shadow-inner" />
            <span className="font-mono font-bold text-rose-300">🌸 Guard {(safetyScore * 100).toFixed(0)}%</span>
          </div>

          <div className="flex items-center justify-end gap-1.5 w-24">
            <span className="text-[10px] font-bold font-mono">5G</span>
            <Wifi size={12} />
            <div className="flex items-center gap-0.5 text-rose-400 font-mono text-[11px] font-medium">
              <span>84%</span>
              <BatteryCharging size={13} />
            </div>
          </div>
        </div>

        {/* App Title & Quick Action Bar */}
        <div className={`relative z-30 ${theme.bgHeader} backdrop-blur-sm px-4 py-2 border-b ${theme.borderBase} flex items-center justify-between shadow-sm`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/30 text-white font-black text-sm tracking-tighter">
              SP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className={`font-bold ${theme.textPrimary} text-sm tracking-tight leading-none`}>
                  SurakshaPath
                </h1>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${theme.sisterhoodBadge}`}>
                  🌸 SISTERHOOD
                </span>
              </div>
              <p className={`text-[10px] ${theme.textMuted} font-normal leading-tight mt-0.5`}>
                Proactive Safe-Routing · Zero-PII
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Theme Switcher Button */}
            <button
              onClick={() => {
                const themeIds: AppThemeId[] = ['rose-quartz', 'twilight-lavender', 'blossom-daybreak'];
                const nextIdx = (themeIds.indexOf(theme.id) + 1) % themeIds.length;
                onChangeTheme(themeIds[nextIdx]);
              }}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                theme.isDark ? 'bg-slate-800/90 hover:bg-slate-700 text-rose-300 border-rose-500/30' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-300'
              }`}
              title={`Switch Theme: currently ${theme.name}`}
              aria-label="Switch Theme"
            >
              <Sparkles size={14} className="text-rose-400" />
            </button>

            {/* Emergency Guardians Contacts Manager */}
            <button
              onClick={onOpenEmergencyContacts}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                theme.isDark ? 'bg-slate-800/90 hover:bg-slate-700 text-rose-300 border-slate-700/60' : 'bg-slate-100 hover:bg-slate-200 text-rose-600 border-slate-300'
              }`}
              title="Guardians & Emergency Contacts"
              aria-label="Emergency Guardians"
            >
              <Users size={14} />
            </button>

            {/* High-Decibel Siren & Screen Strobe Deterrent */}
            <button
              onClick={onOpenStrobeDeterrent}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                theme.isDark ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 border-slate-700/60' : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-300'
              }`}
              title="High-Decibel Siren & 8Hz Flashlight Strobe"
              aria-label="Defensive Siren Strobe"
            >
              <Zap size={14} />
            </button>

            {/* Audio Evidence & Safety Memo Recorder */}
            <button
              onClick={onOpenAudioMemo}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                theme.isDark ? 'bg-slate-800/90 hover:bg-slate-700 text-rose-300 border-slate-700/60' : 'bg-slate-100 hover:bg-slate-200 text-rose-600 border-slate-300'
              }`}
              title="Record Audio Safety Memo & Evidence"
              aria-label="Audio Safety Memo"
            >
              <Mic size={14} />
            </button>

            {/* Discreet Stealth Calculator Camouflage */}
            <button
              onClick={onOpenStealthCalculator}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                theme.isDark ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 border-slate-700/60' : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-300'
              }`}
              title="Discreet CalcGuard Camouflage Mode"
              aria-label="CalcGuard Stealth Mode"
            >
              <Calculator size={14} />
            </button>

            {/* Call Me Out Fake Call */}
            <button
              onClick={onTriggerFakeCall}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                theme.isDark ? 'bg-slate-800/90 hover:bg-slate-700 text-sky-400 border-slate-700/60' : 'bg-slate-100 hover:bg-slate-200 text-sky-600 border-slate-300'
              }`}
              title="Call Me Out: Simulated Incoming Call"
              aria-label="Call Me Out Fake Call"
            >
              <PhoneIncoming size={14} />
            </button>

            {/* Walk With Me Auto-Escalation Timer */}
            <button
              onClick={onOpenWalkTimer}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                theme.isDark ? 'bg-slate-800/90 hover:bg-slate-700 text-rose-400 border-slate-700/60' : 'bg-slate-100 hover:bg-slate-200 text-rose-600 border-slate-300'
              }`}
              title="Walk With Me: Auto-Escalation Check-In"
              aria-label="Walk With Me Timer"
            >
              <Clock size={14} />
            </button>

            {/* 1-Tap Emergency SOS Trigger */}
            <button
              onClick={onTriggerSOS}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-[11px] font-bold px-2 py-1.5 rounded-lg shadow-lg shadow-red-600/30 transition cursor-pointer ml-0.5"
              aria-label="Emergency SOS Trigger"
            >
              <PhoneCall size={12} className="animate-bounce" />
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        <main className={`relative flex-1 w-full h-full overflow-hidden flex flex-col ${theme.bgApp}`}>
          {children}
        </main>

        {/* Bottom Material 3 Android Navigation Bar */}
        <nav
          className={`relative z-40 ${theme.bgNav} backdrop-blur-md border-t ${theme.borderBase} px-2 py-1.5 flex items-center justify-around`}
          aria-label="Bottom Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? theme.isDark ? 'text-rose-300' : 'text-rose-600'
                    : theme.isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                } ${item.highlight && !isActive ? 'text-rose-400 font-semibold' : ''}`}
                aria-label={item.label}
              >
                {/* Active Indicator Pill */}
                <div
                  className={`relative flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
                    isActive
                      ? theme.accentPill
                      : item.highlight
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'hover:bg-rose-500/10'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />

                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1.5 bg-rose-600 text-white font-mono text-[9px] font-extrabold px-1 rounded-full border border-slate-900 shadow">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] mt-0.5 tracking-tight ${
                    isActive ? `font-bold ${theme.isDark ? 'text-rose-300' : 'text-rose-600'}` : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Android Gesture Bar */}
        <div className={`${theme.bgApp} h-3.5 flex items-center justify-center pointer-events-none pb-1`}>
          <div className={`w-32 h-1 ${theme.isDark ? 'bg-slate-700/60' : 'bg-rose-300'} rounded-full`} />
        </div>
      </div>
    </div>
  );
};
