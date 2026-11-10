/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { AppTheme } from '../utils/themeConfig';

interface OfflineBannerProps {
  theme: AppTheme;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ theme }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="absolute top-2 left-3 right-3 z-40 bg-amber-950/95 border border-amber-500/80 text-amber-200 text-xs px-3 py-2 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in backdrop-blur-md">
      <div className="flex items-center gap-2">
        <WifiOff size={15} className="text-amber-400 shrink-0 animate-pulse" />
        <div>
          <span className="font-bold text-white block">Offline Safe Shield Active</span>
          <span className="text-[10px] text-amber-300">
            Local vector cache active · Zero-data SMS dispatch ready
          </span>
        </div>
      </div>

      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30 font-bold shrink-0">
        OFFLINE
      </span>
    </div>
  );
};
