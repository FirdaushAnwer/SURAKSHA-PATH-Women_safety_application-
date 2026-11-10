/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppTheme } from '../utils/themeConfig';

interface PWAInstallButtonProps {
  theme: AppTheme;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ theme }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${theme.accentBg} text-white shadow-md ${theme.accentGlow} transition cursor-pointer active:scale-95`}
        title="Install SurakshaPath to your home screen"
        aria-label="Install App"
      >
        <Download size={13} />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${theme.borderHighlight} ${theme.bgCard} text-rose-300 hover:text-white transition cursor-pointer`}
          title="Install on iPhone / iPad"
        >
          <Download size={13} className="text-rose-400" />
          <span>Add to iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
            <div className={`w-full max-w-sm rounded-3xl ${theme.bgCard} border ${theme.borderHighlight} p-5 shadow-2xl text-white space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌸</span>
                  <h3 className="text-sm font-bold text-white">Install SurakshaPath on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 bg-black/30 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Share size={13} />
                  </div>
                  <div>
                    <strong className="text-white block">Step 1: Tap Share</strong>
                    Tap the <strong>Share</strong> button in Safari's bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-black/30 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                    <PlusSquare size={13} />
                  </div>
                  <div>
                    <strong className="text-white block">Step 2: Add to Home Screen</strong>
                    Scroll down and select <strong>"Add to Home Screen"</strong>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className={`w-full py-2.5 rounded-xl ${theme.accentBg} text-white font-bold text-xs shadow-md cursor-pointer`}
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
