/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppThemeId = 'rose-quartz' | 'twilight-lavender' | 'blossom-daybreak';

export interface AppTheme {
  id: AppThemeId;
  name: string;
  emoji: string;
  subtitle: string;
  isDark: boolean;
  
  // Background & surface classes
  bgApp: string;
  bgCard: string;
  bgCardHover: string;
  bgHeader: string;
  bgNav: string;
  borderBase: string;
  borderHighlight: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Primary brand accents
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentGlow: string;
  accentPill: string;
  
  // Route display colors
  safeRouteColor: string;
  safeRouteGlow: string;
  shortestRouteColor: string;
  userPulseColor: string;
  
  // Sisterhood community pill
  sisterhoodBadge: string;
}

export const APP_THEMES: Record<AppThemeId, AppTheme> = {
  'rose-quartz': {
    id: 'rose-quartz',
    name: 'Blush Rose Quartz',
    emoji: '🌸',
    subtitle: 'Chic Rose & Champagne Glow',
    isDark: true,
    bgApp: 'bg-[#180a1c]',
    bgCard: 'bg-[#250f2c]',
    bgCardHover: 'hover:bg-[#2f1338]',
    bgHeader: 'bg-[#1b0a20]/95',
    bgNav: 'bg-[#180a1c]/95',
    borderBase: 'border-rose-950/60',
    borderHighlight: 'border-rose-500/30',
    textPrimary: 'text-rose-50',
    textSecondary: 'text-rose-200/90',
    textMuted: 'text-rose-300/60',
    accentColor: '#f43f5e',
    accentBg: 'bg-rose-500 hover:bg-rose-600',
    accentBorder: 'border-rose-400/40',
    accentGlow: 'shadow-rose-500/25',
    accentPill: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    safeRouteColor: '#f43f5e',
    safeRouteGlow: 'rgba(244, 63, 94, 0.4)',
    shortestRouteColor: '#ef4444',
    userPulseColor: '#fb7185',
    sisterhoodBadge: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
  },
  'twilight-lavender': {
    id: 'twilight-lavender',
    name: 'Twilight Amethyst',
    emoji: '💜',
    subtitle: 'Deep Violet & Orchid Night',
    isDark: true,
    bgApp: 'bg-[#11091d]',
    bgCard: 'bg-[#1d1031]',
    bgCardHover: 'hover:bg-[#271542]',
    bgHeader: 'bg-[#140a23]/95',
    bgNav: 'bg-[#11091d]/95',
    borderBase: 'border-purple-950/60',
    borderHighlight: 'border-purple-500/30',
    textPrimary: 'text-purple-50',
    textSecondary: 'text-purple-200/90',
    textMuted: 'text-purple-300/60',
    accentColor: '#c084fc',
    accentBg: 'bg-purple-600 hover:bg-purple-700',
    accentBorder: 'border-purple-400/40',
    accentGlow: 'shadow-purple-500/25',
    accentPill: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    safeRouteColor: '#c084fc',
    safeRouteGlow: 'rgba(192, 132, 252, 0.4)',
    shortestRouteColor: '#f87171',
    userPulseColor: '#d8b4fe',
    sisterhoodBadge: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
  },
  'blossom-daybreak': {
    id: 'blossom-daybreak',
    name: 'Blossom Daybreak',
    emoji: '🌷',
    subtitle: 'Airy Pearl & Petal Pink',
    isDark: false,
    bgApp: 'bg-[#fff1f5]',
    bgCard: 'bg-[#ffffff]',
    bgCardHover: 'hover:bg-[#fff7f9]',
    bgHeader: 'bg-[#ffffff]/95',
    bgNav: 'bg-[#ffffff]/95',
    borderBase: 'border-rose-200/70',
    borderHighlight: 'border-rose-300',
    textPrimary: 'text-rose-950',
    textSecondary: 'text-rose-800/80',
    textMuted: 'text-rose-500/70',
    accentColor: '#e11d48',
    accentBg: 'bg-rose-600 hover:bg-rose-700',
    accentBorder: 'border-rose-400/50',
    accentGlow: 'shadow-rose-600/20',
    accentPill: 'bg-rose-100 text-rose-700 border-rose-300',
    safeRouteColor: '#e11d48',
    safeRouteGlow: 'rgba(225, 29, 72, 0.3)',
    shortestRouteColor: '#dc2626',
    userPulseColor: '#f43f5e',
    sisterhoodBadge: 'bg-rose-100 text-rose-700 border-rose-300',
  },
};
