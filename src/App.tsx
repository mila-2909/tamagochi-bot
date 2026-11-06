import React, { useState, useEffect } from 'react';
import { Battery, Zap, Heart, ShoppingBag, Trophy, RefreshCw } from 'lucide-react';

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
];

export default function App() {
  const getSaved = (key: string, def: number) => {
    const saved = localStorage.getItem(key);
    return saved ? parseInt(saved) : def;
  };

  const [coins, setCoins] = useState(() => getSaved('obot_coins', 0));
  const [level, setLevel] = useState(() => getSaved('obot_level', 1));
  const [xp, setXp] = useState(() => getSaved('obot_xp', 0));
  const [cpc, setCpc] = useState(() => getSaved('obot_cpc', 1));
  const [cps, setCps] = useState(() => getSaved('obot_cps', 0));

  useEffect(() => {
    localStorage.setItem('obot_coins', coins.toString());
    localStorage.setItem('obot_level', level.toString());
    localStorage.setItem('obot_xp', xp.toString());
    localStorage.setItem('obot_cpc', cpc.toString());
    localStorage.setItem('obot_cps', cps.toString());
  }, [coins, level, xp, cpc, cps]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (cps > 0) setCoins(prev => prev + cps);
    }, 1000);
    return () => clearInterval(timer);
  }, [cps]);

  const handleMainClick = (e: React.PointerEvent) => {
    e.preventDefault();
    setCoins(prev => prev + cpc);
    setXp(prev => {
      if (prev + 10 >= level * 150 && level < 100) {
        setLevel(l => l + 1);
        return 0;
      }
      return prev + 10;
    });
  };

  const buyItem = (item: Item) => {
    if (coins >= item.cost) {
      setCoins(prev => prev - item.cost);
      if (item.type === 'click') setCpc(prev => prev + item.boost);
      if (item.type === 'second') setCps(prev => prev + item.boost);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans select-none p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <div className="text-amber-400 font-bold flex items-center gap-2">
              <Trophy size={18} /> Уровень {level}
            </div>
            <div className="text-xs text-slate-400 mt-1">Опыт: {xp} / {level * 150}</div>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="text-xs bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="text-center py-4">
          <div className="text-5xl font-black text-amber-400">{coins.toLocaleString()} 🪙</div>
          <div className="text-xs text-slate-400 mt-2">Клик: +{cpc} | В секунду: +{cps}</div>
        </div>

        <div className="flex justify-center my-6">
          <button 
            onPointerDown={handleMainClick}
            className="w-40 h-40 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-3xl border-4 border-cyan-300 shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform flex items-center justify-center text-6xl"
          >
            🤖
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-300 flex items-center gap-2">
            <ShoppingBag size={18} /> Магазин
          </h3>
          {SHOP_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => buyItem(item)}
              disabled={coins < item.cost}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                coins >= item.cost ? 'bg-slate-900 border-cyan-500/40' : 'bg-slate-900/50 border-slate-800 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-cyan-400">{item.icon}</div>
                <div className="text-left">
                  <div className="font-bold text-sm">{item.name}</div>
                  <div className="text-xs text-cyan-400">+{item.boost} {item.type === 'click' ? 'к клику' : '/сек'}</div>
                </div>
              </div>
              <div className="font-bold text-amber-400">{item.cost} 🪙</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
