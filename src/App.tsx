import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Trophy, MessageCircle, Home, User, ListTodo, Music, VolumeX, Lock, Unlock, Gift } from 'lucide-react';

const ROOMS = [
  { id: 0, name: 'Мастерская', cost: 0, bg: 'from-slate-900 to-slate-800' },
  { id: 1, name: 'Мойка', cost: 100, bg: 'from-cyan-900 to-blue-900' },
  { id: 2, name: 'Зарядная', cost: 500, bg: 'from-indigo-900 to-purple-900' },
  { id: 3, name: 'Игровая', cost: 2000, bg: 'from-fuchsia-900 to-pink-900' },
  { id: 4, name: 'Лаборатория', cost: 10000, bg: 'from-emerald-900 to-teal-900' },
  { id: 5, name: 'Космос', cost: 50000, bg: 'from-black to-slate-900' },
];

const ROBOT_TYPES = [
  { type: 'cheerful', name: 'Весельчак', color: '#f59e0b', eye: '#fef08a' },
  { type: 'smart', name: 'Умник', color: '#10b981', eye: '#a7f3d0' },
  { type: 'sleepy', name: 'Соня', color: '#6366f1', eye: '#c7d2fe' }
];

export default function App() {
  const getSaved = (key: string, def: any) => {
    const saved = localStorage.getItem(key);
    try { return saved ? JSON.parse(saved) : def; } catch { return def; }
  };

  const [hasStarted, setHasStarted] = useState(() => getSaved('obot_started', false));
  const [botType, setBotType] = useState(() => getSaved('obot_type', null));
  const [coins, setCoins] = useState(() => getSaved('obot_coins', 0));
  const [level, setLevel] = useState(() => getSaved('obot_level', 1));
  const [xp, setXp] = useState(() => getSaved('obot_xp', 0));
  const [cpc, setCpc] = useState(() => getSaved('obot_cpc', 1));
  const [cps, setCps] = useState(() => getSaved('obot_cps', 0));
  const [unlockedRooms, setUnlockedRooms] = useState<number[]>(() => getSaved('obot_rooms', [0]));
  
  const [currentRoom, setCurrentRoom] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [musicOn, setMusicOn] = useState(true);
  const [isJumping, setIsJumping] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('obot_started', JSON.stringify(hasStarted));
    localStorage.setItem('obot_type', JSON.stringify(botType));
    localStorage.setItem('obot_coins', JSON.stringify(coins));
    localStorage.setItem('obot_level', JSON.stringify(level));
    localStorage.setItem('obot_xp', JSON.stringify(xp));
    localStorage.setItem('obot_cpc', JSON.stringify(cpc));
    localStorage.setItem('obot_cps', JSON.stringify(cps));
    localStorage.setItem('obot_rooms', JSON.stringify(unlockedRooms));
  }, [hasStarted, botType, coins, level, xp, cpc, cps, unlockedRooms]);

  useEffect(() => {
    const timer = setInterval(() => { if (cps > 0) setCoins(p => p + cps); }, 1000);
    return () => clearInterval(timer);
  }, [cps]);

  const playBeep = () => {
    if (!musicOn) return;
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
  };

  const speak = (text: string) => {
    if (!musicOn) return;
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'ru-RU'; ut.pitch = 1.2;
    window.speechSynthesis.speak(ut);
  };

  const handleBoxOpen = () => {
    const b = ROBOT_TYPES[Math.floor(Math.random() * ROBOT_TYPES.length)];
    setBotType(b); setHasStarted(true);
    playBeep(); speak("Ого! Я родился!");
  };

  const handleMainClick = (e: React.PointerEvent) => {
    e.preventDefault(); playBeep();
    setCoins(p => p + cpc);
    setIsJumping(true); setTimeout(() => setIsJumping(false), 100);
    setXp(p => {
      if (p + 10 >= level * 100) { setLevel(l => l + 1); speak("Новый уровень!"); return 0; }
      return p + 10;
    });
  };

  const handleSwipe = () => {
    if (touchStart - touchEnd > 70 && currentRoom < ROOMS.length - 1) setCurrentRoom(c => c + 1);
    if (touchStart - touchEnd < -70 && currentRoom > 0) setCurrentRoom(c => c - 1);
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400">Выберите коробку 🎁</h1>
        <div className="flex gap-4">
          {[1,2,3].map(i => (
            <button key={i} onClick={handleBoxOpen} className="animate-bounce hover:scale-110 transition-transform bg-amber-700 w-20 h-20 rounded-xl border-4 border-amber-900 text-3xl">🎁</button>
          ))}
        </div>
      </div>
    );
  }

  const room = ROOMS[currentRoom];
  const isUnlocked = unlockedRooms.includes(room.id);

  return (
    <div className="min-h-screen bg-slate-950 text-white select-none overflow-hidden flex flex-col pb-20">
      <div className="flex justify-between items-center p-4 bg-slate-900/80 border-b border-slate-800">
        <button onClick={() => setActiveTab('chat')} className="p-2 bg-slate-800 rounded-full text-cyan-400"><MessageCircle size={20}/></button>
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-sm">УРОВЕНЬ {level}</div>
          <div className="w-24 bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
             <div className="bg-cyan-400 h-full" style={{width: `${(xp/(level*100))*100}%`}}/>
          </div>
        </div>
        <button onClick={() => setMusicOn(!musicOn)} className="p-2 bg-slate-800 rounded-full">
          {musicOn ? <Music size={20} className="text-cyan-400"/> : <VolumeX size={20} className="text-slate-500"/>}
        </button>
      </div>

      <div 
        className={`flex-1 flex flex-col items-center justify-center bg-gradient-to-b ${room.bg} transition-all duration-500`}
        onTouchStart={e => setTouchStart(e.targetTouches[0].clientX)}
        onTouchEnd={e => { setTouchEnd(e.changedTouches[0].clientX); handleSwipe(); }}
      >
        <div className="text-white/40 text-xs font-bold tracking-widest uppercase mb-2">{room.name}</div>
        
        {isUnlocked ? (
          <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-amber-400 mb-8">{coins.toLocaleString()} 🪙</div>
            <div onPointerDown={handleMainClick} className={`transition-transform duration-100 ${isJumping ? 'scale-90' : 'scale-100'}`}>
              <svg width="180" height="200" viewBox="0 0 180 200">
                <rect x="40" y="60" width="100" height="110" rx="25" fill={botType?.color} stroke="#1e293b" strokeWidth="4" />
                <rect x="50" y="75" width="80" height="50" rx="15" fill="#0f172a" />
                <circle cx="75" cy="100" r="12" fill={botType?.eye} />
                <circle cx="75" cy="100" r="5" fill="#000" />
                <circle cx="105" cy="100" r="12" fill={botType?.eye} />
                <circle cx="105" cy="100" r="5" fill="#000" />
                <path d="M 80 135 Q 90 145 100 135" stroke={botType?.eye} strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10">
            <Lock size={48} className="mx-auto mb-4 text-white/20"/>
            <div className="text-xl font-bold mb-2">Комната закрыта</div>
            <button 
              onClick={() => { if(coins>=room.cost){setCoins(c=>c-room.cost); setUnlockedRooms([...unlockedRooms, room.id]); speak("Комната куплена!");} }}
              className="bg-cyan-500 text-slate-950 px-6 py-2 rounded-full font-bold mt-2"
            >
              Открыть за {room.cost} 🪙
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3">
        <button onClick={()=>setActiveTab('home')} className={`flex flex-col items-center ${activeTab==='home'?'text-cyan-400':'text-slate-500'}`}><Home size={24}/><span className="text-[10px]">ДОМ</span></button>
        <button onClick={()=>setActiveTab('shop')} className={`flex flex-col items-center ${activeTab==='shop'?'text-cyan-400':'text-slate-500'}`}><ShoppingBag size={24}/><span className="text-[10px]">МАГАЗИН</span></button>
        <button onClick={()=>setActiveTab('quests')} className={`flex flex-col items-center ${activeTab==='quests'?'text-cyan-400':'text-slate-500'}`}><ListTodo size={24}/><span className="text-[10px]">КВЕСТЫ</span></button>
        <button onClick={()=>setActiveTab('profile')} className={`flex flex-col items-center ${activeTab==='profile'?'text-cyan-400':'text-slate-500'}`}><User size={24}/><span className="text-[10px]">ПРОФИЛЬ</span></button>
      </div>
    </div>
  );
}
