import React from 'react';
import { Mic, Square, Check, Loader2 } from 'lucide-react';
import { MicState } from '../types';

interface MicButtonProps {
  state: MicState;
  onClick: () => void;
  disabled?: boolean;
  isEvaluating?: boolean;
  disabledReason?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  state,
  onClick,
  disabled = false,
  isEvaluating = false,
  disabledReason = '',
}) => {
  const isListening = state === 'listening';
  const isDone = state === 'done';

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative">
        {/* Pulsing Ripple rings when listening */}
        {isListening && (
          <>
            <span className="absolute -inset-4 rounded-full bg-rose-400 opacity-40 animate-ping" />
            <span className="absolute -inset-8 rounded-full bg-rose-300 opacity-20 animate-pulse" />
          </>
        )}

        {/* The Main Round Mic Button */}
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || isEvaluating}
          title={disabledReason || (isListening ? '말을 마치려면 누르세요' : '눌러서 말하기')}
          aria-label={isListening ? 'Stop listening' : 'Start speaking'}
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl cursor-pointer active:scale-95 ${
            disabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border-4 border-slate-300'
              : isEvaluating
              ? 'bg-amber-500 text-white animate-pulse border-4 border-amber-300'
              : isListening
              ? 'bg-rose-500 text-white ring-8 ring-rose-200 animate-pulse border-4 border-rose-300'
              : isDone
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-4 ring-emerald-100 border-4 border-emerald-300'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white ring-8 ring-blue-100 hover:ring-blue-200 border-4 border-white'
          }`}
        >
          {isEvaluating ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isListening ? (
            <div className="flex flex-col items-center">
              <Square className="w-9 h-9 fill-white mb-0.5" />
              <span className="text-[11px] font-black uppercase tracking-wider">끝내기</span>
            </div>
          ) : isDone ? (
            <div className="flex flex-col items-center">
              <Check className="w-10 h-10 stroke-[3]" />
              <span className="text-[11px] font-black uppercase tracking-wider">완료!</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Mic className="w-10 h-10 stroke-[2.2] mb-0.5" />
              <span className="text-[11px] font-black uppercase tracking-wider">말하기</span>
            </div>
          )}
        </button>
      </div>

      {/* Three State Label Badge */}
      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            disabled
              ? 'bg-slate-100 text-slate-500'
              : isEvaluating
              ? 'bg-amber-100 text-amber-800'
              : isListening
              ? 'bg-rose-100 text-rose-700 animate-pulse'
              : isDone
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              disabled
                ? 'bg-slate-400'
                : isEvaluating
                ? 'bg-amber-500 animate-ping'
                : isListening
                ? 'bg-rose-500 animate-ping'
                : isDone
                ? 'bg-emerald-500'
                : 'bg-blue-500'
            }`}
          />
          {disabledReason ? (
            <span>{disabledReason}</span>
          ) : isEvaluating ? (
            <span>Gemini 분석 중...</span>
          ) : isListening ? (
            <span>Listening (듣는 중... 말씀해 주세요!)</span>
          ) : isDone ? (
            <span>Done (완료)</span>
          ) : (
            <span>Ready (대기 중 - 버튼을 누르면 시작돼요)</span>
          )}
        </span>
      </div>
    </div>
  );
};
