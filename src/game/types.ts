export interface GameState {
  coins: number;
  totalEarned: number;
  items: Record<string, number>;
  potionUntil: number | null;
  lastSeen: number;
}
