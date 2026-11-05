import React, { useState, useEffect } from 'react';
import { Battery, Zap, Heart, ShoppingBag, Trophy, Star, Gift, MessageCircle } from 'lucide-react';

type Item = {
  id: number;
  name: string;
  cost: number;
  boost: number;
  type: 'click' | 'second';
  icon: React.ReactNode;
};

const SHOP_ITEMS: Item[] = [
  { id: 1, name: 'Батарейка AA', cost: 50, boost: 1, type: 'click', icon: <Battery className="w-5 h-5" /> },
  { id: 2, name: 'Заряд энергии', cost: 200, boost: 5, type: 'second', icon: <Zap className="w-5 h-5" /> },
  { id: 3, name: 'Супер Магнит', cost: 500, boost: 10, type: 'click', icon: <Heart className="w-5 h-5" /> },
  { id: 4, name: 'Ядерный блок', cost: 2000, boost: 50, type: 'second', icon: <Zap className="w-5 h-5" /> },
];

export default function App() {
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [cpc, setCpc] = useState(1);
  const [cps, setCps] = useState(0);
  
  // Эмоции робота
  const [emotion, setEmotion] = useState<'happy' | 'laugh' | 'sad' | 'cry' | 'giggle' | 'love' | 'offended'>('happy');
  const [isBelching, setIsBelching] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  const nextLevelXp = level * 150;

  // Обработка клика по роботу
  const handleMainClick = (e: React.PointerEvent) => {
    e.preventDefault();
    
    setCoins(prev => prev + cpc);
    setXp(prev => {
      if (prev + 10 >= nextLevelXp && level < 50) {
        setLevel(l => l + 1);
        setEmotion('laugh');
        setTimeout(() => setEmotion('happy'), 2500);
        return 0;
      }
      return prev + 10;
    });

    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 120);

    // Случайная милая эмоция при клике
    if (Math.random() > 0.88) {
      const randomEmotions: ('giggle' | 'love')[] = ['giggle', 'love'];
      const chosen = randomEmotions[Math.floor(Math.random() * randomEmotions.length)];
      setEmotion(chosen);
      setTimeout(() => setEmotion('happy'), 1200);
    }
  };

  // Покупка
  const buyItem = (item: Item) => {
    if (coins >= item.cost) {
      setCoins(prev => prev - item.cost);
      if (item.type === 'click') setCpc(prev => prev + item.boost);
      if (item.type === 'second') setCps(prev => prev + item.boost);
      
      // Спецэффект для Магнита - пузырьки и любовные глазки
      if (item.id === 3) {
        setEmotion('love');
        setIsBelching(true);
        setTimeout(() => {
          setIsBelching(false);
          setEmotion('happy');
        }, 3000);
      }
    }
  };

  // Пассивный доход
  useEffect(() => {
    const timer = setInterval(() => {
      if (cps > 0) setCoins(prev => prev + cps);
    }, 1000);
    return () => clearInterval(timer);
  }, [cps]);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white font-sans select-none overflow-y-auto pb-36">
      {/* Шапка с прогрессом уровня */}
      <div className="p-4 flex flex-col items-center">
        <div className="w-full max-w-md bg-[#1e293b]/90 backdrop-blur rounded-2xl p-4 shadow-xl border border-blue-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center gap-2 text-yellow-400 font-extrabold text-base">
              <Trophy size={18} /> УРОВЕНЬ {level} / 50
            </span>
            <span className="text-blue-400 text-xs font-mono bg-blue-950/80 px-2 py-1 rounded-full border border-blue-800">
              O-BOT v1.3
            </span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              style={{ width: `${Math.min((xp / nextLevelXp) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Баланс монет */}
      <div className="text-center my-2">
        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_4px_10px_rgba(245,158,11,0.3)]">
          {coins.toLocaleString()} 🪙
        </div>
        <div className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">
          Доход: <span className="text-green-400">+{cps}/сек</span> • Клик: <span className="text-cyan-400">+{cpc}</span>
        </div>
      </div>

      {/* ОБЪЕМНЫЙ МУЛЬТЯШНЫЙ РОБОТ */}
      <div className="relative flex justify-center items-center h-72 my-2">
        {/* Анимация отрыжки пузырьками */}
        {isBelching && (
          <div className="absolute top-2 z-20 flex gap-3 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="w-5 h-5 bg-cyan-300/60 rounded-full border-2 border-white/80 animate-ping shadow-[0_0_10px_#38bdf8]" 
                style={{ animationDelay: `${i * 0.18}s`, animationDuration: '1.2s' }} 
              />
            ))}
          </div>
        )}

        {/* Кликабельное тело */}
        <div 
          onPointerDown={handleMainClick}
          className={`relative transition-all duration-150 cursor-pointer touch-none active:scale-95
            ${isJumping ? '-translate-y-4 scale-105' : 'translate-y-0'}
          `}
        >
          <svg width="220" height="260" viewBox="0 0 220 260" fill="none">
            <defs>
              {/* Градиенты для 3D объема */}
              <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="70%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Тень под роботом */}
            <ellipse cx="110" cy="245" rx="65" ry="12" fill="#000000" opacity="0.4" />

            {/* Руки (объемные) */}
            <rect x="18" y="115" width="22" height="75" rx="11" fill="url(#armGrad)" stroke="#475569" strokeWidth="3" />
            <rect x="180" y="115" width="22" height="75" rx="11" fill="url(#armGrad)" stroke="#475569" strokeWidth="3" />
            <circle cx="29" cy="185" r="10" fill="#475569" />
            <circle cx="191" cy="185" r="10" fill="#475569" />

            {/* Тело (с округлыми формами и бликами) */}
            <rect x="45" y="95" width="130" height="135" rx="28" fill="url(#bodyGrad)" stroke="#475569" strokeWidth="4" />
            {/* Блик на животе */}
            <path d="M 55 110 Q 110 100 165 110" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6" fill="none" />

            {/* Экрано-животик */}
            <rect x="62" y="125" width="96" height="80" rx="16" fill="url(#screenGrad)" stroke="#334155" strokeWidth="3" />

            {/* Уши / Антенны */}
            <rect x="35" y="40" width="12" height="24" rx="6" fill="#64748b" />
            <rect x="173" y="40" width="12" height="24" rx="6" fill="#64748b" />

            {/* Голова (крупная, мультяшная) */}
            <rect x="40" y="15" width="140" height="90" rx="25" fill="url(#headGrad)" stroke="#475569" strokeWidth="4" />
            {/* Блик на голове */}
            <path d="M 55 25 Q 110 20 165 25" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.7" fill="none" />

            {/* Лицевой экран */}
            <rect x="52" y="27" width="116" height="66" rx="18" fill="url(#screenGrad)" stroke="#1e293b" strokeWidth="2" />

            {/* --- ГЛАЗА И ЭМОЦИИ --- */}
            {emotion === 'happy' && (
              <>
                {/* Левый глаз со зрачком и бликом */}
                <circle cx="82" cy="55" r="16" fill="#38bdf8" filter="url(#glow)" />
                <circle cx="82" cy="55" r="10" fill="#020617" />
                <circle cx="86" cy="51" r="4" fill="#ffffff" />
                
                {/* Правый глаз со зрачком и бликом */}
                <circle cx="138" cy="55" r="16" fill="#38bdf8" filter="url(#glow)" />
                <circle cx="138" cy="55" r="10" fill="#020617" />
                <circle cx="142" cy="51" r="4" fill="#ffffff" />

                {/* Милая добрая улыбка */}
                <path d="M 98 72 Q 110 82 122 72" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" filter="url(#glow)" />
              </>
            )}

            {emotion === 'laugh' && (
              <>
                {/* Радостные прищуренные глазки */}
                <path d="M 70 58 Q 82 42 94 58" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#glow)" />
                <path d="M 126 58 Q 138 42 150 58" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#glow)" />
                {/* Широкая улыбка */}
                <path d="M 94 68 Q 110 86 126 68 Z" fill="#38bdf8" filter="url(#glow)" />
              </>
            )}

            {emotion === 'love' && (
              <>
                {/* Глаза-сердечки */}
                <path d="M 72 55 C 72 45, 82 45, 82 53 C 82 45, 92 45, 92 55 C 92 65, 82 72, 82 75 C 82 72, 72 65, 72 55 Z" fill="#f43f5e" filter="url(#glow)" />
                <path d="M 128 55 C 128 45, 138 45, 138 53 C 138 45, 148 45, 148 55 C 148 65, 138 72, 138 75 C 138 72, 128 65, 128 55 Z" fill="#f43f5e" filter="url(#glow)" />
                <path d="M 100 75 Q 110 82 120 75" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" fill="none" />
              </>
            )}

            {emotion === 'giggle' && (
              <>
                {/* Хитрая ухмылка и подмигивание */}
                <circle cx="82" cy="55" r="15" fill="#38bdf8" filter="url(#glow)" />
                <circle cx="82" cy="55" r="9" fill="#020617" />
                <circle cx="85" cy="52" r="3.5" fill="#ffffff" />
                <path d="M 126 55 Q 138 45 150 55" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#glow)" />
                <path d="M 95 72 Q 112 80 125 68" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* МАГАЗИН (Скроллится нормально) */}
      <div className="px-5 space-y-3 max-w-md mx-auto mt-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-200 mb-3 tracking-wide uppercase">
          <ShoppingBag className="text-cyan-400" /> Мастерская улучшений
        </h3>
        {SHOP_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => buyItem(item)}
            disabled={coins < item.cost}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 active:scale-98
              ${coins >= item.cost 
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-cyan-500/40 shadow-lg shadow-cyan-950/30 hover:border-cyan-400' 
                : 'bg-slate-900/60 border-slate-800 opacity-50 grayscale'}
            `}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-cyan-950/80 rounded-xl border border-cyan-800/50 text-cyan-400">
                {item.icon}
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-slate-100">{item.name}</div>
                <div className="text-xs text-cyan-400 font-medium mt-0.5">
                  +{item.boost} {item.type === 'click' ? 'к клику' : '/сек'}
                </div>
              </div>
            </div>
            <div className="font-extrabold text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-800/40 text-sm">
              {item.cost} 🪙
            </div>
          </button>
        ))}
      </div>

      {/* ПОДНЯТОЕ НИЖНЕЕ МЕНЮ (не перекрывается водяными знаками) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-slate-900/95 backdrop-blur-lg border border-slate-700/60 rounded-2xl p-3 flex justify-around items-center z-50 shadow-2xl shadow-black">
        <button className="flex flex-col items-center gap-1 text-cyan-400 font-medium text-xs">
          <MessageCircle size={24} />
          <span>Чат</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 font-medium text-xs hover:text-cyan-400 transition-colors">
          <Star size={24} />
          <span>Топ</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 font-medium text-xs hover:text-cyan-400 transition-colors">
          <Gift size={24} />
          <span>Призы</span>
        </button>
      </div>
    </div>
  );
}
