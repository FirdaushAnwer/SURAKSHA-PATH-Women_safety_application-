import React, { useState } from 'react';
import { ShieldCheck, EyeOff, X, PhoneCall } from 'lucide-react';

interface StealthCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSilentSosTrigger: () => void;
}

export const StealthCalculatorModal: React.FC<StealthCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSilentSosTrigger,
}) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [clearTapCount, setClearTapCount] = useState(0);
  const [silentSosSent, setSilentSosSent] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === '0' ? digit : prev + digit));
  };

  const handleOp = (op: string) => {
    setPrevValue(parseFloat(display));
    setOperation(op);
    setDisplay('0');
  };

  const handleEqual = () => {
    // Secret Emergency Codes in Calculator!
    if (display === '112' || display === '999' || display === '911') {
      onSilentSosTrigger();
      setSilentSosSent(true);
      setTimeout(() => setSilentSosSent(false), 3000);
      setDisplay('Error: 404');
      return;
    }

    if (display === '0000' || display === '1234') {
      // Secret Exit PIN
      onClose();
      return;
    }

    if (prevValue !== null && operation) {
      const current = parseFloat(display);
      let res = 0;
      if (operation === '+') res = prevValue + current;
      if (operation === '−') res = prevValue - current;
      if (operation === '×') res = prevValue * current;
      if (operation === '÷') res = current !== 0 ? prevValue / current : 0;
      setDisplay(res.toString().slice(0, 10));
      setPrevValue(null);
      setOperation(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    const newCount = clearTapCount + 1;
    setClearTapCount(newCount);
    // Tap AC 4 times to discreetly return to safety map
    if (newCount >= 4) {
      setClearTapCount(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 font-sans select-none animate-fade-in">
      {/* Discreet stealth header pretending to be standard Android tool */}
      <div className="flex items-center justify-between pt-2 px-1 text-slate-500 text-xs">
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <span className="font-mono text-[11px]">Calculator · v4.2</span>
        </div>

        {/* Secret Exit Button disguised as minimal icon */}
        <button
          onClick={onClose}
          className="p-1 text-slate-700 hover:text-slate-400 text-[10px] cursor-pointer"
          title="Exit Stealth Mode"
        >
          ✕
        </button>
      </div>

      {/* Main Display */}
      <div className="flex-1 flex flex-col justify-end items-end px-3 py-6">
        {silentSosSent && (
          <div className="text-[10px] text-emerald-500 font-mono mb-2 flex items-center gap-1 opacity-90 animate-pulse">
            <ShieldCheck size={12} />
            <span>Silent encrypted beacon dispatched to guardians</span>
          </div>
        )}
        <div className="text-slate-400 text-sm font-mono mb-1">
          {prevValue !== null ? `${prevValue} ${operation || ''}` : ''}
        </div>
        <div className="text-white text-5xl font-light tracking-tight font-mono overflow-x-auto max-w-full">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3 pb-6 max-w-sm mx-auto w-full">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="h-16 rounded-full bg-slate-800 active:bg-slate-700 text-emerald-400 font-bold text-xl flex items-center justify-center cursor-pointer transition shadow"
        >
          AC
        </button>
        <button
          onClick={() => {
            const val = parseFloat(display);
            setDisplay((val * -1).toString());
          }}
          className="h-16 rounded-full bg-slate-800 active:bg-slate-700 text-slate-200 font-bold text-xl flex items-center justify-center cursor-pointer transition shadow"
        >
          ±
        </button>
        <button
          onClick={() => {
            const val = parseFloat(display);
            setDisplay((val / 100).toString());
          }}
          className="h-16 rounded-full bg-slate-800 active:bg-slate-700 text-slate-200 font-bold text-xl flex items-center justify-center cursor-pointer transition shadow"
        >
          %
        </button>
        <button
          onClick={() => handleOp('÷')}
          className="h-16 rounded-full bg-amber-600 active:bg-amber-500 text-white font-bold text-2xl flex items-center justify-center cursor-pointer transition shadow"
        >
          ÷
        </button>

        {/* Row 2 */}
        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-full bg-slate-900 active:bg-slate-800 text-white font-normal text-2xl flex items-center justify-center cursor-pointer transition shadow"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('×')}
          className="h-16 rounded-full bg-amber-600 active:bg-amber-500 text-white font-bold text-2xl flex items-center justify-center cursor-pointer transition shadow"
        >
          ×
        </button>

        {/* Row 3 */}
        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-full bg-slate-900 active:bg-slate-800 text-white font-normal text-2xl flex items-center justify-center cursor-pointer transition shadow"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('−')}
          className="h-16 rounded-full bg-amber-600 active:bg-amber-500 text-white font-bold text-2xl flex items-center justify-center cursor-pointer transition shadow"
        >
          −
        </button>

        {/* Row 4 */}
        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-full bg-slate-900 active:bg-slate-800 text-white font-normal text-2xl flex items-center justify-center cursor-pointer transition shadow"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('+')}
          className="h-16 rounded-full bg-amber-600 active:bg-amber-500 text-white font-bold text-2xl flex items-center justify-center cursor-pointer transition shadow"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 h-16 rounded-full bg-slate-900 active:bg-slate-800 text-white font-normal text-2xl pl-7 flex items-center justify-start cursor-pointer transition shadow"
        >
          0
        </button>
        <button
          onClick={() => {
            if (!display.includes('.')) setDisplay(display + '.');
          }}
          className="h-16 rounded-full bg-slate-900 active:bg-slate-800 text-white font-normal text-2xl flex items-center justify-center cursor-pointer transition shadow"
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="h-16 rounded-full bg-emerald-600 active:bg-emerald-500 text-white font-bold text-2xl flex items-center justify-center cursor-pointer transition shadow"
        >
          =
        </button>
      </div>

      {/* Discrete instruction footer */}
      <div className="text-center text-[10px] text-slate-700 pb-1">
        Tap AC 4 times or enter 0000= to exit · Enter 112= for silent SOS
      </div>
    </div>
  );
};
