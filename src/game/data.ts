import type { GameState } from './types';

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
  kind: 'perSecond' | 'perClick' | 'potion';
  value: number;
}

export const ITEMS: ShopItem[] = [
  { id: 'food', name: 'Корм', emoji: '🍖', price: 50, description: '+1 монета/сек', kind: 'perSecond', value: 1 },
  { id: 'treat', name: 'Вкусняшка', emoji: '🐟', price: 200, description: '+3 монеты/сек', kind: 'perSecond', value: 3 },
  { id: 'toy', name: 'Игрушка', emoji: '🧶', price: 500, description: '+2 за клик', kind: 'perClick', value: 2 },
  { id: 'pillow', name: 'Подушка', emoji: '🛏️', price: 1000, description: '+10 монет/сек', kind: 'perSecond', value: 10 },
  { id: 'potion', name: 'Зелье', emoji: '⚗️', price: 5000, description: '×2 ко всему на 60 сек', kind: 'potion', value: 60 },
];

export interface Stage {
  emoji: string;
  name: string;
  threshold: number;
}

export const STAGES: Stage[] = [
  { emoji: '🥚', name: 'Яйцо', threshold: 0 },
  { emoji: '🐱', name: 'Котёнок', threshold: 100 },
  { emoji: '🐈', name: 'Кот', threshold: 1000 },
  { emoji: '🦁', name: 'Лев', threshold: 10000 },
];

export interface StageInfo {
  stage: Stage;
  level: number;
  next: Stage | null;
}

export function getStage(totalEarned: number): StageInfo {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (totalEarned >= STAGES[i].threshold) idx = i;
  }
  return { stage: STAGES[idx], level: idx + 1, next: STAGES[idx + 1] ?? null };
}

export function itemCount(state: GameState, id: string): number {
  return state.items[id] ?? 0;
}

export function basePerSecond(state: GameState): number {
  let cps = 0;
  for (const item of ITEMS) {
    if (item.kind === 'perSecond') cps += itemCount(state, item.id) * item.value;
  }
  return cps;
}

export function basePerClick(state: GameState): number {
  let cpc = 1;
  for (const item of ITEMS) {
    if (item.kind === 'perClick') cpc += itemCount(state, item.id) * item.value;
  }
  return cpc;
}

export function potionActive(state: GameState, now: number): boolean {
  return state.potionUntil !== null && now < state.potionUntil;
}

export function potionMultiplier(state: GameState, now: number): number {
  return potionActive(state, now) ? 2 : 1;
}

export function perSecond(state: GameState, now: number): number {
  return basePerSecond(state) * potionMultiplier(state, now);
}

export function perClick(state: GameState, now: number): number {
  return basePerClick(state) * potionMultiplier(state, now);
}
