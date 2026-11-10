import React, { useState } from 'react';
import { ShieldCheck, EyeOff, X, PhoneCall, HelpCircle, Delete, Check } from 'lucide-react';

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
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [clearTapCount, setClearTapCount] = useState(0);
  const [silentSosSent, setSilentSosSent] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => (prev === '0' ? digit : prev + digit));
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  };

  const handleOp = (op: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation && !waitingForOperand) {
      const result = calculate(prevValue, inputValue, operation);
      setPrevValue(result);
      setDisplay(String(result));
    }

    setWaitingForOperand(true);
    setOperation(op);
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+':
        return first + second;
      case '−':
      case '-':
        return first - second;
      case '×':
      case '*':
        return first * second;
      case '÷':
      case '/':
        return second !== 0 ? first / second : 0;
      default:
        return second;
    }
  };

  const handleEqual = () => {
    const rawVal = display.trim();

    // Secret Emergency Codes in Calculator!
    if (rawVal === '112' || rawVal === '999' || rawVal === '911' || rawVal === '1091') {
      onSilentSosTrigger();
      setSilentSosSent(true);
      if ('vibrate' in navigator) {
        try { navigator.vibrate([100, 50, 100]); } catch (_) {}
      }
      setTimeout(() => setSilentSosSent(false), 4000);
      // Keep displaying normal number so bystander sees standard calculator output
      setDisplay(rawVal);
      return;
    }

    // Secret Exit PINs
    if (rawVal === '0000' || rawVal === '1234') {
      onClose();
      return;
    }

    if (prevValue !== null && operation) {
      const current = parseFloat(display);
      const res = calculate(prevValue, current, operation);
      const formatted = Number.isInteger(res) ? res.toString() : Number(res.toFixed(6)).toString();
      setDisplay(formatted);
      setPrevValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);

    const newCount = clearTapCount + 1;
    setClearTapCount(newCount);
    // Tap AC 4 times quickly to discreetly exit to map
    if (newCount >= 4) {
      setClearTapCount(0);
      onClose();
    }
  };

  const handleToggleSign = () => {
    const val = parseFloat(display);
    if (val !== 0) {
      setDisplay(String(-val));
    }
  };

  const handlePercentage = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay((prev) => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 font-sans select-none animate-fade-in">
      {/* Discreet stealth header pretending to be standard Android utility */}
      <div className="flex items-center justify-between pt-2 px-1 text-slate-500 text-xs">
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <span className="font-mono text-[11px]">Calculator · Standard</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtle Help Button disguised as info */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 text-slate-600 hover:text-slate-400 text-xs cursor-pointer"
            title="Calculator Help & Secret Codes"
          >
            <HelpCircle size={14} />
          </button>

          {/* Secret Exit Button disguised as minimal cross */}
          <button
            onClick={onClose}
            className="p-1 text-slate-700 hover:text-slate-400 text-xs cursor-pointer"
            title="Exit to SurakshaPath Map"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Secret Help Drawer */}
      {showHelp && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 my-2 text-slate-300 text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between font-bold text-white text-xs border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1 text-amber-400">
              <EyeOff size={13} />
              <span>CalcGuard Camouflage Mode</span>
            </span>
            <button onClick={() => setShowHelp(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            If you are in an unsafe vehicle or someone is watching your phone screen, keep this calculator open.
          </p>
          <div className="space-y-1 text-[11px] font-mono bg-black/40 p-2.5 rounded-xl border border-slate-800">
            <div className="text-emerald-400 font-bold">Secret Triggers:</div>
            <div>• Type <span className="text-white font-bold">112</span> or <span className="text-white font-bold">911</span> then <span className="text-amber-300 font-bold">=</span> : Silent SOS sent!</div>
            <div>• Type <span className="text-white font-bold">1091</span> then <span className="text-amber-300 font-bold">=</span> : Women helpline alert</div>
            <div>• Type <span className="text-white font-bold">1234</span> then <span className="text-amber-300 font-bold">=</span> : Return to safety map</div>
            <div>• Tap <span className="text-white font-bold">AC</span> 4 times : Return to safety map</div>
          </div>
        </div>
      )}

      {/* Main Display */}
      <div className="flex-1 flex flex-col justify-end items-end px-3 py-6">
        {silentSosSent && (
          <div className="text-[10px] text-emerald-400 font-mono mb-2 flex items-center gap-1 opacity-90 animate-pulse bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800">
            <ShieldCheck size={12} />
            <span>Silent encrypted SOS beacon dispatched to guardians</span>
          </div>
        )}

        <div className="text-xs text-slate-500 font-mono h-5">
          {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
        </div>

        <div className="text-5xl font-light text-white font-mono tracking-tighter truncate max-w-full">
          {display}
        </div>
      </div>

      {/* Calculator Keypad */}
      <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto w-full pb-3 text-lg font-medium">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="h-16 rounded-full bg-slate-700/80 hover:bg-slate-700 text-rose-300 active:scale-95 transition flex items-center justify-center cursor-pointer font-semibold"
        >
          AC
        </button>
        <button
          onClick={handleToggleSign}
          className="h-16 rounded-full bg-slate-700/80 hover:bg-slate-700 text-slate-200 active:scale-95 transition flex items-center justify-center cursor-pointer"
        >
          ⁺⁄₋
        </button>
        <button
          onClick={handlePercentage}
          className="h-16 rounded-full bg-slate-700/80 hover:bg-slate-700 text-slate-200 active:scale-95 transition flex items-center justify-center cursor-pointer"
        >
          %
        </button>
        <button
          onClick={() => handleOp('÷')}
          className={`h-16 rounded-full ${operation === '÷' ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'} hover:bg-amber-500 active:scale-95 transition flex items-center justify-center cursor-pointer text-xl`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleDigit('7')}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          9
        </button>
        <button
          onClick={() => handleOp('×')}
          className={`h-16 rounded-full ${operation === '×' ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'} hover:bg-amber-500 active:scale-95 transition flex items-center justify-center cursor-pointer text-xl`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleDigit('4')}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          6
        </button>
        <button
          onClick={() => handleOp('−')}
          className={`h-16 rounded-full ${operation === '−' ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'} hover:bg-amber-500 active:scale-95 transition flex items-center justify-center cursor-pointer text-xl`}
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleDigit('1')}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          3
        </button>
        <button
          onClick={() => handleOp('+')}
          className={`h-16 rounded-full ${operation === '+' ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'} hover:bg-amber-500 active:scale-95 transition flex items-center justify-center cursor-pointer text-xl`}
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-start pl-7 cursor-pointer border border-slate-800/80"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition flex items-center justify-center cursor-pointer border border-slate-800/80"
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="h-16 rounded-full bg-amber-600 hover:bg-amber-500 text-white active:scale-95 transition flex items-center justify-center cursor-pointer text-xl shadow-lg shadow-amber-600/30"
        >
          =
        </button>
      </div>

      <div className="text-center text-[10px] text-slate-700">
        Discreet emergency protection active
      </div>
    </div>
  );
};
