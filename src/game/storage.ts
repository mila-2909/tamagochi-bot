import type { GameState } from './types';

const SAVE_KEY = 'o-tamagotchi-save-v1';

export const DEFAULT_STATE: GameState = {
  coins: 0,
  totalEarned: 0,
  items: {},
  potionUntil: null,
  lastSeen: Date.now(),
};

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return {
      coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
      totalEarned: typeof parsed.totalEarned === 'number' ? parsed.totalEarned : 0,
      items: parsed.items && typeof parsed.items === 'object' ? parsed.items : {},
      potionUntil: typeof parsed.potionUntil === 'number' ? parsed.potionUntil : null,
      lastSeen: typeof parsed.lastSeen === 'number' ? parsed.lastSeen : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — ignore */
  }
}
