import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Zap, Battery, Wrench, Magnet, Trophy, ShoppingBag, MessageSquare } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'cps' | 'cpt';
  value: number;
  icon: React.ReactNode;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'battery', name: 'Батарейка АА', description: '+1 монета/сек', cost: 50, type: 'cps', value: 1, icon: <Battery className="w-5 h-5" /> },
  { id: 'energy', name: 'Заряд энергии', description: '+5 монет/сек', cost: 200, type: 'cps', value: 5, icon: <Zap className="w-5 h-5" /> },
  { id: 'tool', name: 'Набор ключей', description: '+2 за клик', cost: 500, type: 'cpt', value: 2, icon: <Wrench className="w-5 h-5" /> },
  { id: 'magnet', name: 'Магнит (Любимое!)', description: '+10 за клик', cost: 1500, type: 'cpt', value: 10, icon: <Magnet className="w-5 h-5" /> },
];

export default function App() {
  const [coins, setCoins] = useState(0);
  const [cps, setCps] = useState(0);
  const [cpt, setCpt] = useState(1);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [emotion, setEmotion] = useState<'happy' | 'laugh' | 'sad' | 'love'>('happy');
  const [showBubbles, setShowBubbles] = useState(false);
  
  // Состояние для всплывающих "+1" при клике
  const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);

  const nextLevelXp = Math.floor(100 * Math.pow(1.5, level - 1));

  // ФИКС ЗВЕЗД: Генерируем их ОДИН РАЗ при загрузке, чтобы они не исчезали
  const stars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCoins(prev => prev + cps);
    }, 1000);
    return () => clearInterval(timer);
  }, [cps]);

  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
    setCoins(prev => prev + cpt);
    setXp(prev => prev + 1);
    setEmotion('laugh');
    setTimeout(() => setEmotion('happy'), 1000);

    // Добавляем всплывающий "+N" при клике
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX) || (rect.left + rect.width / 2)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY) || (rect.top + rect.height / 2)) - rect.top;
    
    const newClick = { id: Date.now(), x, y };
    setClicks(prev => [...prev, newClick]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== newClick.id));
    }, 800);

    if (xp + 1 >= nextLevelXp) {
      setLevel(prev => prev + 1);
      setXp(0);
      setEmotion('love');
      setTimeout(() => setEmotion('happy'), 2000);
    }
  };

  const buyItem = (item: ShopItem) => {
    if (coins >= item.cost) {
      setCoins(prev => prev - item.cost);
      if (item.type === 'cps') setCps(prev => prev + item.value);
      if (item.type === 'cpt') setCpt(prev => prev + item.value);
      
      if (item.id === 'magnet') {
        setShowBubbles(true);
        setEmotion('laugh');
        setTimeout(() => {
          setShowBubbles(false);
          setEmotion('happy');
        }, 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white font-sans selection:bg-orange-500 overflow-hidden relative flex flex-col items-center">
      
      {/* Звездное небо (фикс) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div 
            key={star.id}
            className="absolute bg-white rounded-full opacity-0"
            style={{
              width: star.size + 'px',
              height: star.size + 'px',
              top: star.top + '%',
              left: star.left + '%',
              animation: `twinkle ${star.duration}s infinite`,
              animationDelay: star.delay + 's'
            }}
          />
        ))}
      </div>

      {/* Верхняя панель */}
      <div className="relative z-10 p-4 w-full max-w-sm mt-4">
        <div className="bg-[#1F2833]/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_0_30px_rgba(79,195,247,0.1)] border border-blue-500/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-orange-400 font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5" /> УРОВЕНЬ {level}
            </span>
            <span className="text-blue-300 text-xs italic bg-blue-900/50 px-2 py-1 rounded-full">О-БОТ v1.1</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all duration-300 shadow-[0_0_10px_rgba(255,107,53,0.8)]" 
              style={{ width: `${(xp / nextLevelXp) * 100}%` }}
            />
          </div>
          <div className="mt-5 text-center">
            <div className="text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {Math.floor(coins).toLocaleString()} <span className="text-orange-500 text-4xl">₿</span>
            </div>
            <div className="text-blue-300 text-xs mt-2 uppercase tracking-widest font-semibold">
              Доход: {cps}/сек • Клик: +{cpt}
            </div>
          </div>
        </div>
      </div>

      {/* Робот, Пузыри и Клики */}
      <div className="relative flex-1 flex justify-center items-center w-full z-10">
        
        {/* Пузыри от магнита */}
        {showBubbles && (
          <div className="absolute bottom-48 flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="w-6 h-6 bg-gradient-to-tr from-blue-400/30 to-white/60 rounded-full border border-blue-200/50" 
                style={{ animation: `floatUp 1.5s ease-out forwards`, animationDelay: `${i * 0.15}s` }} 
              />
            ))}
          </div>
        )}

        <div 
          onClick={handleTouch}
          className="relative cursor-pointer transform transition-transform active:scale-95 select-none"
        >
          {/* Всплывающие цифры при клике */}
          {clicks.map(click => (
            <div 
              key={click.id} 
              className="absolute text-orange-400 font-bold text-xl pointer-events-none"
              style={{ 
                left: click.x, 
                top: click.y,
                animation: 'floatText 0.8s ease-out forwards'
              }}
            >
              +{cpt}
            </div>
          ))}

          <div className="drop-shadow-[0_0_20px_rgba(79,195,247,0.4)]">
            <svg width="220" height="240" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="50" y="80" width="100" height="90" rx="20" fill="url(#bodyGradient)" stroke="#4FC3F7" strokeWidth="2"/>
              <rect x="70" y="100" width="60" height="40" rx="5" fill="#0B0C10" stroke="#4FC3F7" strokeWidth="1"/>
              <rect x="60" y="30" width="80" height="60" rx="15" fill="url(#bodyGradient)" stroke="#4FC3F7" strokeWidth="2"/>
              
              <circle cx="85" cy="55" r={emotion === 'happy' ? "12" : "15"} fill={emotion === 'love' ? "#FF4081" : "#4FC3F7"} className="animate-pulse">
                <animate attributeName="ry" values="12;1;12" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="115" cy="55" r={emotion === 'happy' ? "12" : "15"} fill={emotion === 'love' ? "#FF4081" : "#4FC3F7"} className="animate-pulse">
                <animate attributeName="ry" values="12;1;12" dur="4s" repeatCount="indefinite" />
              </circle>
              
              <path d={emotion === 'laugh' ? "M85 75 Q100 85 115 75" : "M90 75 H110"} stroke="#4FC3F7" strokeWidth="3" strokeLinecap="round" />
              
              <rect x="55" y="170" width="90" height="20" rx="10" fill="#1F2833" stroke="#4FC3F7" strokeWidth="1"/>
              <rect x="65" y="175" width="70" height="10" rx="5" fill="#333" />
              
              <defs>
                <linearGradient id="bodyGradient" x1="100" y1="30" x2="100" y2="170" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F5F5F5"/>
                  <stop offset="1" stopColor="#A9A9A9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {emotion === 'laugh' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold animate-bounce shadow-[0_0_15px_rgba(255,255,255,0.5)] whitespace-nowrap">
              {showBubbles ? "МАГНИТИК! НЯМ!" : "БИП-БУП!"}
            </div>
          )}
        </div>
      </div>

      {/* Магазин */}
      <div className="relative z-20 px-4 pb-24 w-full max-w-sm">
        <div className="bg-[#1F2833]/90 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-300">
            <ShoppingBag className="w-5 h-5" /> МАСТЕРСКАЯ
          </h2>
          <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
            {SHOP_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => buyItem(item)}
                disabled={coins < item.cost}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                  coins >= item.cost 
                    ? 'bg-gradient-to-r from-blue-600/30 to-blue-800/30 hover:from-blue-600/50 hover:to-blue-800/50 border border-blue-400/30 shadow-[0_0_10px_rgba(79,195,247,0.1)]' 
                    : 'bg-gray-800/40 opacity-50 cursor-not-allowed border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-[#0B0C10] rounded-xl text-orange-400 shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-100">{item.name}</div>
                    <div className="text-[10px] text-blue-300/70">{item.description}</div>
                  </div>
                </div>
                <div className="text-orange-400 font-bold whitespace-nowrap">{item.cost} ₿</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0B0C10]/90 backdrop-blur-lg flex justify-around items-center border-t border-white/5 z-30">
        <button className="text-blue-400 opacity-50"><MessageSquare className="w-6 h-6" /></button>
        <button className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full shadow-[0_0_20px_rgba(255,107,53,0.5)] transform -translate-y-5 border border-orange-400/50">
          <Zap className="w-8 h-8 text-white" />
        </button>
        <button className="text-blue-400 opacity-50"><Sparkles className="w-6 h-6" /></button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4FC3F7; border-radius: 10px; }
        
        @keyframes twinkle {
          0% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 8px #fff; }
          100% { opacity: 0.1; transform: scale(0.8); }
        }

        @keyframes floatText {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(1.5); }
        }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-80px) scale(1.2); }
        }
      `}</style>
    </div>
  );
}