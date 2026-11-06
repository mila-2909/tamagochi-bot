import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Trophy, MessageCircle, Home, User, ListTodo, Zap, VolumeX, Lock, Sparkles } from 'lucide-react';

const ROOMS = [
  { id: 0, name: 'Мастерская', cost: 0, bg: 'from-slate-950 via-slate-900 to-slate-950' },
  { id: 1, name: 'Мойка', cost: 100, bg: 'from-cyan-950 via-blue-900 to-slate-950' },
  { id: 2, name: 'Зарядка', cost: 500, bg: 'from-indigo-950 via-purple-900 to-slate-950' },
  { id: 3, name: 'Игровая', cost: 2000, bg: 'from-fuchsia-950 via-pink-900 to-slate-950' },
  { id: 4, name: 'Лаборатория', cost: 10000, bg: 'from-emerald-950 via-teal-900 to-slate-950' },
  { id: 5, name: 'Космос', cost: 50000, bg: 'from-black via-slate-950 to-black' },
];

const ROBOT_MODELS = [
  { id: 'classic', name: 'О-Бот Классик', desc: 'Добряк в стиле Валли', eyeColor: '#38bdf8' },
  { id: 'sphere', name: 'Сфера-Бот', desc: 'Футуристичный и элегантный', eyeColor: '#34d399' },
  { id: 'retro', name: 'Ретро-Бот', desc: 'Ламповый стимпанк', eyeColor: '#fbbf24' },
];

export default function App() {
  const [hasStarted, setHasStarted] = useState(() => localStorage.getItem('obot_started') === 'true');
  const [selectedBot, setSelectedBot] = useState(() => localStorage.getItem('obot_model') || 'classic');
  const [coins, setCoins] = useState(() => Number(localStorage.getItem('obot_coins')) || 0);
  const [level, setLevel] = useState(() => Number(localStorage.getItem('obot_level')) || 1);
  const [xp, setXp] = useState(() => Number(localStorage.getItem('obot_xp')) || 0);
  const [unlockedRooms, setUnlockedRooms] = useState<number[]>(() => 
    JSON.parse(localStorage.getItem('obot_rooms') || '[0]')
  );
  
  const [currentRoom, setCurrentRoom] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [soundOn, setSoundOn] = useState(true);
  const [isJumping, setIsJumping] = useState(false);
  const [clicks, setClicks] = useState<{id: number, x: number, y: number}[]>([]);
  const [touchStart, setTouchStart] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('obot_started', String(hasStarted));
    localStorage.setItem('obot_model', selectedBot);
    localStorage.setItem('obot_coins', String(coins));
    localStorage.setItem('obot_level', String(level));
    localStorage.setItem('obot_xp', String(xp));
    localStorage.setItem('obot_rooms', JSON.stringify(unlockedRooms));
  }, [hasStarted, selectedBot, coins, level, xp, unlockedRooms]);

  const playBeep = (freq = 600) => {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Игнорируем ошибки аудио на некоторых мобильных устройствах
    }
  };

  const handleMainClick = (e: React.PointerEvent) => {
    e.preventDefault();
    playBeep(700 + Math.random() * 300);
    setCoins(p => p + level);
    setClicks(prev => [...prev, { id: Date.now(), x: e.clientX, y: e.clientY }]);
    setIsJumping(true); 
    setTimeout(() => setIsJumping(false), 90);
    
    setXp(p => {
      if (p + 10 >= level * 100) { 
        setLevel(l => l + 1); 
        playBeep(1200);
        return 0; 
      }
      return p + 10;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setClicks(prev => prev.filter(c => Date.now() - c.id < 800));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Экран выбора первого робота
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-tight">
            Выберите Вашего Робота
          </h1>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">
            Каждая модель обладает уникальным характером
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          {ROBOT_MODELS.map(bot => (
            <button
              key={bot.id}
              onClick={() => {
                setSelectedBot(bot.id);
                setHasStarted(true);
                playBeep(900);
              }}
              className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-2xl text-left transition-all active:scale-95 shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <Sparkles size={24} />
              </div>
              <div>
                <div className="font-bold text-white text-base">{bot.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{bot.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const room = ROOMS[currentRoom];
  const isUnlocked = unlockedRooms.includes(room.id);

  return (
    <div className="min-h-screen bg-slate-950 text-white select-none overflow-hidden flex flex-col font-sans">
      {/* Летящие цифры +1 */}
      {clicks.map(c => (
        <div 
          key={c.id} 
          className="fixed pointer-events-none text-cyan-400 font-black text-2xl animate-bounce z-[100] drop-shadow-[0_0_10px_#38bdf8]" 
          style={{ left: c.x - 15, top: c.y - 35 }}
        >
          +{level}
        </div>
      ))}

      {/* Верхняя шапка */}
      <div className="flex justify-between items-center p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
            <User size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Платформа</div>
            <div className="text-xs font-extrabold text-cyan-400 uppercase">
              {ROBOT_MODELS.find(m => m.id === selectedBot)?.name}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
           <div className="text-amber-400 font-black text-xs flex items-center gap-1">
             <Trophy size={14}/> УРОВЕНЬ {level}
           </div>
           <div className="w-24 bg-slate-800 h-2 rounded-full mt-1 overflow-hidden p-0.5 border border-slate-700">
             <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300" 
                  style={{width: `${(xp/(level*100))*100}%`}}/>
           </div>
        </div>

        <button 
          onClick={() => setSoundOn(!soundOn)} 
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          {soundOn ? <Zap size={18} className="text-yellow-400"/> : <VolumeX size={18}/>}
        </button>
      </div>

      {/* Комната и Робот */}
      <div 
        className={`flex-1 flex flex-col items-center justify-center bg-gradient-to-b ${room.bg} relative transition-all duration-500`}
        onTouchStart={e => setTouchStart(e.targetTouches[0].clientX)}
        onTouchEnd={e => {
          const diff = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 60) {
            const next = diff > 0 ? Math.min(currentRoom + 1, 5) : Math.max(currentRoom - 1, 0);
            setCurrentRoom(next);
            playBeep(400);
          }
        }}
      >
        <div className="absolute top-6 text-white/30 text-xs font-black uppercase tracking-widest">
          {room.name}
        </div>
        
        {isUnlocked ? (
          <div className="flex flex-col items-center z-10">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 mb-6 drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
              {coins.toLocaleString()} 🪙
            </div>
            
            <div 
              onPointerDown={handleMainClick} 
              className={`relative cursor-pointer transition-transform duration-100 touch-none active:scale-95 ${isJumping ? '-translate-y-3' : ''}`}
            >
              {/* --- ОБЪЕМНЫЙ КЛАССИЧЕСКИЙ РОБОТ (ВАЛЛИ) --- */}
              {selectedBot === 'classic' && (
                <svg width="220" height="250" viewBox="0 0 220 250" fill="none">
                  <defs>
                    <linearGradient id="cHead" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e2e8f0" /><stop offset="70%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                    <linearGradient id="cBody" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f1f5f9" /><stop offset="50%" stopColor="#cbd5e1" /><stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                    <linearGradient id="cScreen" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#020617" /><stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <filter id="cGlow"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
                  </defs>
                  <ellipse cx="110" cy="235" rx="65" ry="12" fill="#000" opacity="0.4" />
                  <rect x="18" y="110" width="22" height="75" rx="11" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
                  <rect x="180" y="110" width="22" height="75" rx="11" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
                  <rect x="45" y="90" width="130" height="135" rx="28" fill="url(#cBody)" stroke="#475569" strokeWidth="4" />
                  <rect x="62" y="120" width="96" height="80" rx="16" fill="url(#cScreen)" stroke="#334155" strokeWidth="3" />
                  <rect x="40" y="15" width="140" height="90" rx="25" fill="url(#cHead)" stroke="#475569" strokeWidth="4" />
                  <rect x="52" y="27" width="116" height="66" rx="18" fill="url(#cScreen)" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="82" cy="55" r="16" fill="#38bdf8" filter="url(#cGlow)" />
                  <circle cx="82" cy="55" r="10" fill="#020617" />
                  <circle cx="86" cy="51" r="4" fill="#ffffff" />
                  <circle cx="138" cy="55" r="16" fill="#38bdf8" filter="url(#cGlow)" />
                  <circle cx="138" cy="55" r="10" fill="#020617" />
                  <circle cx="142" cy="51" r="4" fill="#ffffff" />
                  <path d="M 98 72 Q 110 82 122 72" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" filter="url(#cGlow)" />
                </svg>
              )}

              {/* --- СФЕРА-БОТ (ФУТУРИСТИЧНЫЙ/ЕВА) --- */}
              {selectedBot === 'sphere' && (
                <svg width="220" height="250" viewBox="0 0 220 250" fill="none">
                  <defs>
                    <linearGradient id="sBody" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" /><stop offset="80%" stopColor="#cbd5e1" /><stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                    <linearGradient id="sVisor" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#020617" /><stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <filter id="sGlow"><feGaussianBlur stdDeviation="4" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
                  </defs>
                  <ellipse cx="110" cy="230" rx="50" ry="10" fill="#38bdf8" opacity="0.3" filter="url(#sGlow)" />
                  <path d="M 60 110 C 60 80, 160 80, 160 110 C 160 180, 60 180, 60 110 Z" fill="url(#sBody)" stroke="#94a3b8" strokeWidth="3" />
                  <ellipse cx="110" cy="55" rx="65" ry="45" fill="url(#sBody)" stroke="#94a3b8" strokeWidth="3" />
                  <ellipse cx="110" cy="55" rx="52" ry="32" fill="url(#sVisor)" />
                  <ellipse cx="85" cy="55" rx="10" ry="14" fill="#34d399" filter="url(#sGlow)" />
                  <ellipse cx="135" cy="55" rx="10" ry="14" fill="#34d399" filter="url(#sGlow)" />
                </svg>
              )}

              {/* --- РЕТРО-БОТ (СТИМПАНК) --- */}
              {selectedBot === 'retro' && (
                <svg width="220" height="250" viewBox="0 0 220 250" fill="none">
                  <defs>
                    <linearGradient id="rMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d97706" /><stop offset="70%" stopColor="#b45309" /><stop offset="100%" stopColor="#78350f" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="110" cy="235" rx="60" ry="10" fill="#000" opacity="0.5" />
                  <line x1="70" y1="20" x2="70" y2="40" stroke="#fbbf24" strokeWidth="4" />
                  <circle cx="70" cy="16" r="6" fill="#ef4444" />
                  <line x1="150" y1="20" x2="150" y2="40" stroke="#fbbf24" strokeWidth="4" />
                  <circle cx="150" cy="16" r="6" fill="#ef4444" />
                  <rect x="40" y="40" width="140" height="85" rx="10" fill="url(#rMetal)" stroke="#451a03" strokeWidth="5" />
                  <rect x="55" y="52" width="110" height="60" rx="6" fill="#451a03" />
                  <circle cx="85" cy="82" r="14" fill="#fbbf24" />
                  <circle cx="85" cy="82" r="6" fill="#78350f" />
                  <circle cx="135" cy="82" r="14" fill="#fbbf24" />
                  <circle cx="135" cy="82" r="6" fill="#78350f" />
                  <rect x="50" y="130" width="120" height="95" rx="12" fill="url(#rMetal)" stroke="#451a03" strokeWidth="5" />
                  <circle cx="110" cy="175" r="22" fill="#78350f" stroke="#fbbf24" strokeWidth="3" />
                </svg>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-slate-900/90 backdrop-blur rounded-3xl border border-slate-800 shadow-2xl">
            <Lock size={48} className="mx-auto mb-4 text-slate-500"/>
            <div className="text-lg font-bold mb-1">Комната заблокирована</div>
            <div className="text-xs text-slate-400 mb-6">Требуется монет для открытия</div>
            <button 
              onClick={() => {
                if (coins >= room.cost) {
                  setCoins(c => c - room.cost);
                  setUnlockedRooms([...unlockedRooms, room.id]);
                  playBeep(1000);
                }
              }}
              disabled={coins < room.cost}
              className={`px-6 py-3 rounded-xl font-extrabold text-sm transition-all ${
                coins >= room.cost 
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/30' 
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              Разблокировать за {room.cost} 🪙
            </button>
          </div>
        )}
      </div>

      {/* Нижняя панель навигации */}
      <div className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50">
        {[
          { id: 'home', icon: <Home size={22}/>, name: 'Главная' },
          { id: 'shop', icon: <ShoppingBag size={22}/>, name: 'Магазин' },
          { id: 'quests', icon: <ListTodo size={22}/>, name: 'Квесты' },
          { id: 'profile', icon: <User size={22}/>, name: 'Профиль' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)} 
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === t.id ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.icon}
            <span className="text-[10px] font-bold uppercase">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
