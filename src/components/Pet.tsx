import { useCallback, useRef, useState } from 'react';

interface FloatingText {
  id: number;
  value: number;
  x: number;
}

interface PetProps {
  emoji: string;
  stageName: string;
  level: number;
  clickValue: number;
  progressPct: number;
  nextStageName: string | null;
  potionActive: boolean;
  onClick: () => void;
}

let floatSeq = 0;

export default function Pet({
  emoji,
  stageName,
  level,
  clickValue,
  progressPct,
  nextStageName,
  potionActive,
  onClick,
}: PetProps) {
  const [bouncing, setBouncing] = useState(false);
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const bounceTimer = useRef<number | null>(null);

  const handle = useCallback(() => {
    setBouncing(true);
    if (bounceTimer.current) window.clearTimeout(bounceTimer.current);
    bounceTimer.current = window.setTimeout(() => setBouncing(false), 420);

    const id = ++floatSeq;
    const x = (Math.random() - 0.5) * 70;
    setFloats((prev) => [...prev, { id, value: clickValue, x }]);
    window.setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id));
    }, 900);

    onClick();
  }, [clickValue, onClick]);

  const isEgg = emoji === '🥚';

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative no-select px-2">
      {/* Stage badge */}
      <div className="mb-6 flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur-sm border border-white/20">
        <span className="text-xs font-bold uppercase tracking-wider text-white/80">Уровень {level}</span>
        <span className="h-3 w-px bg-white/30" />
        <span className="text-sm font-extrabold text-white">{stageName}</span>
      </div>

      {/* Pet */}
      <button
        type="button"
        onClick={handle}
        aria-label="Покормить питомца"
        className="relative flex items-center justify-center rounded-full focus:outline-none active:scale-95 transition-transform duration-100"
        style={{ width: 220, height: 220 }}
      >
        {/* Glow ring */}
        <span
          className={`absolute inset-0 rounded-full ${
            potionActive ? 'bg-yellow-300/30 animate-pulse-glow' : 'bg-white/10'
          }`}
        />
        <span
          className={`text-[130px] leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] inline-block ${
            bouncing ? 'animate-bounce-pet' : isEgg ? 'animate-wiggle' : 'animate-idle-bob'
          }`}
          style={{ animationIterationCount: isEgg && !bouncing ? 'infinite' : undefined }}
        >
          {emoji}
        </span>

        {/* Floating +N */}
        {floats.map((f) => (
          <span
            key={f.id}
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{ marginLeft: f.x, transform: 'translate(-50%, -50%)' }}
          >
            <span className="block animate-float-up text-2xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              +{f.value}
            </span>
          </span>
        ))}
      </button>

      {/* Shadow */}
      <div className="mt-1 h-3 w-40 rounded-full bg-black/25 blur-md" />

      {/* Progress to next stage */}
      <div className="mt-8 w-full max-w-xs">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/80">
          <span>Прогресс</span>
          <span>{nextStageName ? `→ ${nextStageName}` : 'Максимум!'}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-3 text-center text-sm text-white/70">
          Нажимай на питомца, чтобы заработать монеты
        </p>
      </div>
    </div>
  );
}
