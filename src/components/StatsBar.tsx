import { Coins, Zap, Volume2, VolumeX, Clock } from 'lucide-react';
import { formatNumber } from '@/game/format';

interface StatsBarProps {
  coins: number;
  perSecond: number;
  perClick: number;
  potionSecondsLeft: number | null;
  muted: boolean;
  onToggleMute: () => void;
}

export default function StatsBar({
  coins,
  perSecond,
  perClick,
  potionSecondsLeft,
  muted,
  onToggleMute,
}: StatsBarProps) {
  return (
    <div className="pt-5">
      <div className="flex items-start justify-between gap-2">
        <h1 className="font-extrabold text-white text-lg leading-tight">
          О! Тамагочи
          <span className="block text-xs font-semibold text-white/60">кликер-игра</span>
        </h1>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Включить звук' : 'Выключить звук'}
          className="rounded-full bg-white/15 p-2 text-white backdrop-blur-sm border border-white/20 transition-colors hover:bg-white/25 active:scale-90"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Coin counter */}
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-purple-900/20">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-inner">
          <Coins size={22} className="text-amber-900" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-black leading-none text-slate-800 tabular-nums">
            {formatNumber(coins)}
          </div>
          <div className="mt-0.5 text-xs font-semibold text-slate-400">монет</div>
        </div>
      </div>

      {/* Per-second + per-click */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm border border-white/20">
          <Zap size={16} className="text-yellow-300" />
          <div className="leading-tight">
            <div className="text-sm font-bold text-white tabular-nums">
              {formatNumber(perSecond)}/сек
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm border border-white/20">
          <span className="text-base">👆</span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white tabular-nums">
              +{formatNumber(perClick)}/клик
            </div>
          </div>
        </div>
      </div>

      {/* Potion timer */}
      {potionSecondsLeft !== null && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400/90 to-amber-500/90 px-3 py-2 animate-pop-in border border-yellow-200/50">
          <Clock size={16} className="text-amber-900" />
          <span className="text-sm font-bold text-amber-900">
            Зелье активно! ×2 ещё {potionSecondsLeft} сек
          </span>
        </div>
      )}
    </div>
  );
}
