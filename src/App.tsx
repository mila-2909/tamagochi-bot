import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Trophy, Star, MessageCircle, Home, User, ListTodo, Music, VolumeX, Lock, Unlock } from 'lucide-react';

// --- КОНСТАНТЫ И БАЗЫ ДАННЫХ ---
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

const SHOP_ITEMS = [
  { id: 1, name: 'Винтик', cost: 50, boost: 1, type: 'click' },
  { id: 2, name: 'Масло', cost: 200, boost: 5, type: 'second' },
  { id: 3, name: 'Супер Чип', cost: 1000, boost: 20, type: 'click' },
];

// --- ГЛАВНОЕ ПРИЛОЖЕНИЕ ---
export default function App() {
  // --- СОХРАНЕНИЕ ---
  const getSaved = (key: string, def: any) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : def;
  };

  const [hasStarted, setHasStarted] = useState(() => getSaved('obot_started', false));
  const [botType, setBotType] = useState(() => getSaved('obot_type', null));
  const [coins, setCoins] = useState(() => getSaved('obot_coins', 0));
  const [level, setLevel] = useState(() => getSaved('obot_level', 1));
  const [xp, setXp] = useState(() => getSaved('obot_xp', 0));
  const [cpc, setCpc] = useState(() => getSaved('obot_cpc', 1));
  const [cps, setCps] = useState(() => getSaved('obot_cps', 0));
  const [unlockedRooms, setUnlockedRooms] = useState<number[]>(() => getSaved('obot_rooms', [0]));
  
  // --- ТЕКУЩЕЕ СОСТОЯНИЕ ---
  const [currentRoom, setCurrentRoom] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'quests' | 'profile' | 'chat'>('home');
  const [musicOn, setMusicOn] = useState(true);
  const [emotion, setEmotion] = useState('happy');
  const [isJumping, setIsJumping] = useState(false);
  
  // --- СВАЙП ---
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // --- АУДИО СИСТЕМА ---
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = () => {
    if (!musicOn) return;
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const speak = (text: string) => {
    if (!musicOn) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.pitch = botType?.type === 'sleepy' ? 0.8 : botType?.type === 'cheerful' ? 1.6 : 1.2;
    window.speechSynthesis.speak(utterance);
  };

  // Сохранение при изменениях
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

  // Пассивный доход
  useEffect(() => {
    const timer = setInterval(() => { if (cps > 0) setCoins(p => p + cps); }, 1000);
    return () => clearInterval(timer);
  }, [cps]);

  // Эволюция
  const evoStage = level < 5 ? 1 : level < 15 ? 2 : 3;

  // --- ЛОГИКА ---
  const handleBoxOpen = () => {
    playBeep();
    const randomBot = ROBOT_TYPES[Math.floor(Math.random() * ROBOT_TYPES.length)];
    setBotType(randomBot);
    setHasStarted(true);
    speak("Привет! Я твой новый робот!");
  };

  const handleMainClick = (e: React.PointerEvent) => {
    e.preventDefault();
    playBeep();
    setCoins(p => p + cpc);
    setXp(p => {
      if (p + 10 >= level * 100 && level < 100) {
        setLevel(l => l + 1);
        speak(`Ура! Уровень ${level + 1}`);
        return 0;
      }
      return p + 10;
    });
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 100);
  };

  const handleSwipe = () => {
    if (touchStart - touchEnd > 50 && currentRoom < ROOMS.length - 1) setCurrentRoom(c => c + 1);
    if (touchStart - touchEnd < -50 && currentRoom > 0) setCurrentRoom(c => c - 1);
  };

  const buyRoom = () => {
    const room = ROOMS[currentRoom];
    if (coins >= room.cost && !unlockedRooms.includes(room.id)) {
      setCoins(c => c - room.cost);
      setUnlockedRooms([...unlockedRooms, room.id]);
      speak("Новая комната открыта!");
    }
  };

  const buyItem = (item: any) => {
    if (coins >= item.cost) {
      setCoins(c => c - item.cost);
      if (item.type === 'click') setCpc(c => c + item.boost);
      if (item.type === 'second') setCps(c => c + item.boost);
      playBeep();
    }
  };

  // --- ЭКРАН ЛУТБОКСОВ ---
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <h1 className="text-3xl font-bold mb-4 text-cyan-400">Вам посылка!</h1>
        <p className="text-slate-400 mb-10">Выберите одну из коробок. Внутри — ваш будущий друг.</p>
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <button key={i} onClick={handleBoxOpen} className="animate-bounce hover:scale-110 transition-transform">
              <div className="w-24 h-24 bg-amber-600 rounded-lg border-4 border-amber-800 flex items-center justify-center relative shadow-[0_0_20px_rgba(217,119,6,0.5)]">
                <div className="absolute top-0 w-full h-4 bg-red-500"></div>
                <div className="absolute left-10 w-4 h-full bg-red-500"></div>
                <span className="text-4xl">🎁</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- ГЛАВНЫЙ ЭКРАН ИГРЫ ---
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans select-none overflow-hidden flex flex-col pb-24">
      {/* Шапка */}
      <div className="flex justify-between items-center p-4 bg-slate-900/80 backdrop-blur z-10 border-b border-slate-800">
        <button onClick={() => setActiveTab('chat')} className="p-2 bg-slate-800 rounded-full text-cyan-400">
          <MessageCircle size={20} />
        </button>
        
        <div className="flex flex-col items-center bg-slate-800 px-6 py-1 rounded-2xl border border-slate-700 shadow-lg">
          <span className="text-yellow-400 font-bold text-sm flex items-center gap-1">
            <Trophy size={14}/> Ур. {level}
          </span>
          <div className="w-24 bg-slate-700 h-1.5 rounded-full mt-1">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${(xp / (level * 100)) * 100}%` }}/>
          </div>
        </div>

        <button onClick={() => setMusicOn(!musicOn)} className={`p-2 rounded-full ${musicOn ? 'bg-cyan-900/50 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
          {musicOn ? <Music size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Центральная часть с комнатами (СВАЙП) */}
      <div 
        className={`flex-1 flex flex-col relative bg-gradient-to-b ${ROOMS[currentRoom].bg} transition-colors duration-500`}
        onTouchStart={e => setTouchStart(e.targetTouches[0].clientX)}
        onTouchEnd={e => { setTouchEnd(e.changedTouches[0].clientX); handleSwipe(); }}
      >
        {/* Индикатор комнат */}
        <div className="absolute top-4 w-full flex justify-center gap-2 z-10">
          {ROOMS.map((r, idx) => (
            <div key={r.id} className={`w-2 h-2 rounded-full transition-all ${currentRoom === idx ? 'bg-white scale-150' : unlockedRooms.includes(r.id) ? 'bg-white/50' : 'bg-red-500/30'}`} />
          ))}
        </div>

        {/* Название комнаты */}
        <div className="text-center mt-8 text-xl font-bold tracking-widest uppercase text-white/80 drop-shadow-md">
          {ROOMS[currentRoom].name}
        </div>

        {/* КОНТЕНТ ВКЛАДОК */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          
          {activeTab === 'home' && (
            <>
              {unlockedRooms.includes(ROOMS[currentRoom].id) ? (
                <>
                  <div className="text-4xl font-black text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)] mb-4">
                    {coins.toLocaleString()} 🪙
                  </div>
                  
                  {/* РОБОТ С ЭВОЛЮЦИЕЙ */}
                  <div 
                    onPointerDown={handleMainClick}
                    className={`relative cursor-pointer touch-none transition-transform duration-100 ${isJumping ? '-translate-y-4 scale-105' : ''}`}
                  >
                    <svg width="200" height="240" viewBox="0 0 200 240">
                      {/* Тень */}
                      <ellipse cx="100" cy="220" rx="60" ry="10" fill="#000" opacity="0.3" />
                      
                      {/* Тело (Стадия 1+) */}
                      <rect x="50" y="100" width="100" height="110" rx="20" fill={botType?.color} stroke="#334155" strokeWidth="4" />
                      
                      {/* Экран-лицо (Стадия 2+) */}
                      {evoStage >= 2 && (
                        <rect x="60" y="115" width="80" height="50" rx="10" fill="#0f172a" />
                      )}
                      
                      {/* Глаза (Стадия 2+) */}
                      {evoStage >= 2 && emotion === 'happy' && (
                        <>
                          <circle cx="80" cy="140" r="10" fill={botType?.eye} />
                          <circle cx="120" cy="140" r="10" fill={botType?.eye} />
                        </>
                      )}

                      {/* Руки и Улыбка (Стадия 3+) */}
                      {evoStage >= 3 && (
                        <>
                          <rect x="25" y="120" width="15" height="60" rx="7" fill={botType?.color} stroke="#334155" strokeWidth="3" />
                          <rect x="160" y="120" width="15" height="60" rx="7" fill={botType?.color} stroke="#334155" strokeWidth="3" />
                          <path d="M 85 150 Q 100 160 115 150" stroke={botType?.eye} strokeWidth="3" strokeLinecap="round" fill="none" />
                        </>
                      )}
                    </svg>
                  </div>
                </>
              ) : (
                /* КОМНАТА ЗАКРЫТА */
                <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-700 text-center backdrop-blur-md">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-bold mb-2">Комната закрыта</h3>
                  <p className="text-slate-400 mb-6 text-sm">Требуется для расширения возможностей робота.</p>
                  <button 
                    onClick={buyRoom}
                    disabled={coins < ROOMS[currentRoom].cost}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all
                      ${coins >= ROOMS[currentRoom].cost ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-500'}`}
                  >
                    <Unlock size={18}/> Купить за {ROOMS[currentRoom].cost} 🪙
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'shop' && (
            <div className="w-full max-w-md bg-slate-900/90 rounded-3xl p-4 h-full overflow-y-auto border border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2"><ShoppingBag/> Магазин</h2>
              <div className="space-y-3">
                {SHOP_ITEMS.map(item => (
                  <button key={item.id} onClick={() => buyItem(item)} disabled={coins < item.cost}
                    className={`w-full flex justify-between items-center p-3 rounded-xl border ${coins >= item.cost ? 'bg-slate-800 border-cyan-500/50' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                    <div className="text-left">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-cyan-400">+{item.boost} {item.type === 'click' ? 'клик' : '/сек'}</div>
                    </div>
                    <div className="font-bold text-amber-400">{item.cost} 🪙</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="w-full max-w-md bg-slate-900/90 rounded-3xl p-4 h-full border border-slate-700 flex flex-col items-center justify-center text-slate-400">
              <ListTodo size={48} className="mb-4 opacity-50" />
              <p>Задания появятся на уровне 10!</p>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="w-full max-w-md bg-slate-900/90 rounded-3xl p-4 h-full border border-slate-700 flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Чат с {botType?.name}</h2>
              <div className="flex-1 bg-slate-950 rounded-xl p-4 mb-4 text-sm text-cyan-300 font-mono">
                > Анализ системы...<br/>
                > Модуль речи активен.<br/>
                > {botType?.name}: Привет, Создатель! Погладь меня по экрану!
              </div>
              <button onClick={() => speak("Я хороший робот!")} className="bg-cyan-500 text-slate-900 py-3 rounded-xl font-bold">
                Сказать "Привет"
              </button>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="w-full max-w-md bg-slate-900/90 rounded-3xl p-4 h-full border border-slate-700 text-center">
              <User size={48} className="mx-auto mb-4 text-cyan-400" />
              <h2 className="text-xl font-bold mb-2">Ваш Робот: {botType?.name}</h2>
              <p className="text-slate-400 mb-6 text-sm">Характер: {botType?.type}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-3 rounded-xl">Клик: <span className="text-cyan-400 font-bold">{cpc}</span></div>
                <div className="bg-slate-800 p-3 rounded-xl">Сек: <span className="text-green-400 font-bold">{cps}</span></div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* НИЖНЕЕ МЕНЮ (4 кнопки) */}
      <div className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 pb-safe">
        <div className="flex justify-around p-3">
          {[
            { id: 'home', icon: <Home size={24}/>, name: 'Дом' },
            { id: 'shop', icon: <ShoppingBag size={24}/>, name: 'Магазин' },
            { id: 'quests', icon: <ListTodo size={24}/>, name: 'Задания' },
            { id: 'profile', icon: <User size={24}/>, name: 'Профиль' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
