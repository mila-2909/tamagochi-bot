import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Trophy, MessageCircle, Home, User, ListTodo, Music, VolumeX, Lock, Unlock, Zap } from 'lucide-react';

const ROOMS = [
  { id: 0, name: 'Мастерская', cost: 0, bg: 'from-[#0f172a] via-[#1e293b] to-[#0f172a]', decor: 'grid' },
  { id: 1, name: 'Мойка', cost: 100, bg: 'from-[#075985] to-[#0c4a6e]', decor: 'bubbles' },
  { id: 2, name: 'Зарядка', cost: 500, bg: 'from-[#312e81] to-[#1e1b4b]', decor: 'stars' },
  { id: 3, name: 'Игровая', cost: 2000, bg: 'from-[#831843] to-[#500724]', decor: 'dots' },
  { id: 4, name: 'Лаборатория', cost: 10000, bg: 'from-[#064e3b] to-[#022c22]', decor: 'circuit' },
  { id: 5, name: 'Космос', cost: 50000, bg: 'from-[#020617] to-[#000000]', decor: 'nebula' },
];

const ROBOT_TYPES = [
  { type: 'cheerful', name: 'Весельчак', color: 'url(#metalGold)', eye: '#fbbf24' },
  { type: 'smart', name: 'Умник', color: 'url(#metalSilver)', eye: '#22d3ee' },
  { type: 'sleepy', name: 'Соня', color: 'url(#metalBlue)', eye: '#818cf8' }
];

export default function App() {
  const [hasStarted, setHasStarted] = useState(() => localStorage.getItem('obot_started') === 'true');
  const [botType, setBotType] = useState(() => JSON.parse(localStorage.getItem('obot_type') || 'null'));
  const [coins, setCoins] = useState(() => Number(localStorage.getItem('obot_coins')) || 0);
  const [level, setLevel] = useState(() => Number(localStorage.getItem('obot_level')) || 1);
  const [xp, setXp] = useState(() => Number(localStorage.getItem('obot_xp')) || 0);
  const [unlockedRooms, setUnlockedRooms] = useState(() => JSON.parse(localStorage.getItem('obot_rooms') || '[0]'));
  
  const [currentRoom, setCurrentRoom] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [musicOn, setMusicOn] = useState(true);
  const [isJumping, setIsJumping] = useState(false);
  const [clicks, setClicks] = useState<{id: number, x: number, y: number}[]>([]);
  const [touchStart, setTouchStart] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('obot_started', String(hasStarted));
    localStorage.setItem('obot_type', JSON.stringify(botType));
    localStorage.setItem('obot_coins', String(coins));
    localStorage.setItem('obot_level', String(level));
    localStorage.setItem('obot_xp', String(xp));
    localStorage.setItem('obot_rooms', JSON.stringify(unlockedRooms));
  }, [hasStarted, botType, coins, level, xp, unlockedRooms]);

  const playBeep = (freq = 800) => {
    if (!musicOn) return;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const osc = audioCtxRef.current.createOscillator();
    const g = audioCtxRef.current.createGain();
    osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);
    osc.connect(g); g.connect(audioCtxRef.current.destination);
    osc.start(); osc.stop(audioCtxRef.current.currentTime + 0.1);
  };

  const handleMainClick = (e: React.PointerEvent) => {
    e.preventDefault();
    playBeep(900 + Math.random() * 200);
    setCoins(p => p + level);
    setClicks(prev => [...prev, { id: Date.now(), x: e.clientX, y: e.clientY }]);
    setIsJumping(true); setTimeout(() => setIsJumping(false), 80);
    setXp(p => {
      if (p + 10 >= level * 100) { setLevel(l => l + 1); return 0; }
      return p + 10;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setClicks(prev => prev.filter(c => Date.now() - c.id < 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <h1 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-tighter">O-BOT ORIGINS</h1>
        <p className="text-slate-400 mb-12 text-sm uppercase tracking-widest">Выберите капсулу для активации</p>
        <div className="flex gap-6 z-10">
          {[1,2,3].map(i => (
            <button key={i} onClick={() => {
              const b = ROBOT_TYPES[Math.floor(Math.random()*3)];
              setBotType(b); setHasStarted(true);
            }} className="group relative">
              <div className="absolute -inset-2 bg-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative w-24 h-32 bg-gradient-to-b from-slate-700 to-slate-900 rounded-2xl border-2 border-slate-600 flex flex-col items-center justify-center text-4xl shadow-2xl">
                <div className="absolute top-2 w-16 h-1 bg-cyan-500/50 rounded-full animate-pulse"></div>
                📦
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
    <div className="min-h-screen bg-[#020617] text-white select-none overflow-hidden flex flex-col font-sans">
      {/* ЛЕТЯЩИЕ ЦИФРЫ */}
      {clicks.map(c => (
        <div key={c.id} className="fixed pointer-events-none text-cyan-400 font-black text-2xl animate-ping z-[100]" 
             style={{ left: c.x - 20, top: c.y - 40 }}>
          +{level}
        </div>
      ))}

      {/* ШАПКА */}
      <div className="flex justify-between items-center p-4 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <User size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Статус системы</div>
            <div className="text-xs font-black text-cyan-400 uppercase tracking-widest">{botType.name}</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
           <div className="text-amber-400 font-black text-sm tracking-widest">LVL {level}</div>
           <div className="w-20 bg-slate-800 h-1 rounded-full mt-1 overflow-hidden border border-white/5">
             <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full shadow-[0_0_8px_#22d3ee]" 
                  style={{width: `${(xp/(level*100))*100}%`}}/>
           </div>
        </div>

        <button onClick={() => setMusicOn(!musicOn)} className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
          {musicOn ? <Zap size={18} className="text-yellow-400 animate-pulse"/> : <VolumeX size={18} className="text-slate-600"/>}
        </button>
      </div>

      {/* ИГРОВОЕ ПОЛЕ */}
      <div 
        className={`flex-1 flex flex-col items-center justify-center bg-gradient-to-b ${room.bg} relative transition-all duration-700`}
        onTouchStart={e => setTouchStart(e.targetTouches[0].clientX)}
        onTouchEnd={e => {
          const diff = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 70) {
            const next = diff > 0 ? Math.min(currentRoom + 1, 5) : Math.max(currentRoom - 1, 0);
            setCurrentRoom(next);
            playBeep(400);
          }
        }}
      >
        {/* ДЕКОР КОМНАТЫ */}
        {room.decor === 'grid' && <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>}
        {room.decor === 'stars' && <div className="absolute inset-0 animate-pulse bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>}

        <div className="absolute top-8 text-white/20 text-[60px] font-black uppercase tracking-tighter select-none pointer-events-none">
          {room.name}
        </div>
        
        {isUnlocked ? (
          <div className="flex flex-col items-center z-10">
            <div className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-8 tracking-tighter">
              {coins.toLocaleString()}<span className="text-cyan-400 text-3xl">🪙</span>
            </div>
            
            <div onPointerDown={handleMainClick} className={`relative cursor-pointer transition-all duration-75 active:scale-90 ${isJumping ? '-translate-y-2' : 'animate-bounce-slow'}`}>
              <svg width="220" height="240" viewBox="0 0 200 240" className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                <defs>
                  <linearGradient id="metalGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" /><stop offset="50%" stopColor="#fbce77" /><stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                  <linearGradient id="metalSilver" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" /><stop offset="50%" stopColor="#f1f5f9" /><stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                  <linearGradient id="metalBlue" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#312e81" /><stop offset="50%" stopColor="#818cf8" /><stop offset="100%" stopColor="#1e1b4b" />
                  </linearGradient>
                  <filter id="light">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#bbbbbb" result="specOut">
                      <fePointLight x="-50" y="-100" z="200" />
                    </feSpecularLighting>
                  </filter>
                </defs>
                
                {/* ТЕНЬ */}
                <ellipse cx="100" cy="225" rx="70" ry="15" fill="#000" opacity="0.4" />
                
                {/* ТЕЛО РОБОТА */}
                <rect x="40" y="70" width="120" height="130" rx="35" fill={botType.color} filter="url(#light)" />
                <rect x="45" y="75" width="110" height="120" rx="32" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                
                {/* ЛИЦО-ЭКРАН */}
                <rect x="55" y="85" width="90" height="65" rx="20" fill="#020617" stroke="#334155" strokeWidth="3" />
                
                {/* ГЛАЗА */}
                <g className="animate-pulse">
                  <circle cx="80" cy="115" r="18" fill={botType.eye} opacity="0.2" />
                  <circle cx="80" cy="115" r="12" fill={botType.eye} />
                  <circle cx="80" cy="115" r="5" fill="#000" />
                  <circle cx="84" cy="111" r="2" fill="#fff" />
                  
                  <circle cx="120" cy="115" r="18" fill={botType.eye} opacity="0.2" />
                  <circle cx="120" cy="115" r="12" fill={botType.eye} />
                  <circle cx="120" cy="115" r="5" fill="#000" />
                  <circle cx="124" cy="111" r="2" fill="#fff" />
                </g>
                
                {/* РОТ */}
                <path d="M 85 138 Q 100 148 115 138" stroke={botType.eye} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="text-center z-10 p-10 bg-slate-900/60 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl">
            <Lock size={60} className="mx-auto mb-6 text-cyan-500 animate-pulse"/>
            <div className="text-2xl font-black mb-2 uppercase tracking-tighter">Сектор заблокирован</div>
            <div className="text-slate-400 text-sm mb-8 uppercase tracking-widest">Требуется энергия для доступа</div>
            <button 
              onClick={() => {
                if(coins >= room.cost) {
                  setCoins(c => c - room.cost);
                  setUnlockedRooms([...unlockedRooms, room.id]);
                  playBeep(1200);
                }
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(6,182,212,0.3)] active:translate-y-1 transition-all"
            >
              ОТКРЫТЬ ЗА {room.cost} 🪙
            </button>
          </div>
        )}
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ */}
      <div className="fixed bottom-0 w-full bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 px-4 pt-4 pb-8 flex justify-around z-50">
        {[
          { id: 'home', icon: <Home/>, label: 'Система' },
          { id: 'shop', icon: <ShoppingBag/>, label: 'Склад' },
          { id: 'quests', icon: <ListTodo/>, label: 'Миссии' },
          { id: 'profile', icon: <User/>, label: 'Данные' }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} 
                  className={`flex flex-col items-center gap-1 transition-all ${activeTab === t.id ? 'text-cyan-400 scale-110' : 'text-slate-600'}`}>
            <div className={`${activeTab === t.id ? 'shadow-[0_0_15px_rgba(34,211,238,0.4)]' : ''} p-2 rounded-xl`}>{t.icon}</div>
            <span className="text-[9px] font-black uppercase tracking-tighter">{t.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
