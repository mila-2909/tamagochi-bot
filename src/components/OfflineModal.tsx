import { useEffect } from 'react';
import { Coins, X } from 'lucide-react';
import { formatNumber, formatDuration } from '@/game/format';

interface OfflineModalProps {
  seconds: number;
  coins: number;
  onClose: () => void;
}

export default function OfflineModal({ seconds, coins, onClose }: OfflineModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-sm animate-pop-in rounded-3xl bg-white p-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
        >
          <X size={16} />
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-3xl shadow-lg">
          🐱
        </div>

        <h2 className="text-xl font-black text-slate-800">С возвращением!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Вы были offline <span className="font-bold text-slate-700">{formatDuration(seconds)}</span>
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 py-3">
          <Coins size={20} className="text-amber-500" />
          <span className="text-lg font-black text-amber-700">
            +{formatNumber(coins)} монет
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Питомец не сидел без дела :)</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3 font-bold text-white shadow-lg transition-transform active:scale-95"
        >
          Забрать
        </button>
      </div>
    </div>
  );
}
