import { ShoppingBag, Lock } from 'lucide-react';
import type { ShopItem } from '@/game/data';
import { formatNumber } from '@/game/format';

interface ShopProps {
  items: ShopItem[];
  coins: number;
  owned: Record<string, number>;
  potionActive: boolean;
  onBuy: (item: ShopItem) => void;
}

export default function Shop({ items, coins, owned, potionActive, onBuy }: ShopProps) {
  return (
    <div className="rounded-t-3xl bg-white px-3 pb-4 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
      <div className="mb-2 flex items-center gap-2 px-1">
        <ShoppingBag size={18} className="text-purple-600" />
        <h2 className="text-base font-extrabold text-slate-800">Магазин</h2>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const count = owned[item.id] ?? 0;
          const affordable = coins >= item.price;
          const isPotion = item.kind === 'potion';
          const disabled = !affordable || (isPotion && potionActive);

          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onBuy(item)}
              className={`group flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-150 ${
                disabled
                  ? 'border-slate-100 bg-slate-50 opacity-70'
                  : 'border-purple-100 bg-white hover:border-purple-300 hover:bg-purple-50 active:scale-[0.98]'
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                  affordable ? 'bg-purple-100' : 'bg-slate-100 grayscale'
                }`}
              >
                {item.emoji}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-extrabold text-slate-800">
                    {item.name}
                  </span>
                  {isPotion ? (
                    potionActive ? (
                      <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-bold text-yellow-700">
                        Активно
                      </span>
                    ) : (
                      <span className="rounded-full bg-fuchsia-100 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-700">
                        Буст
                      </span>
                    )
                  ) : count > 0 ? (
                    <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
                      ×{count}
                    </span>
                  ) : null}
                </div>
                <div className="truncate text-xs font-medium text-slate-500">
                  {item.description}
                </div>
              </div>

              <div
                className={`flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-bold ${
                  affordable
                    ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {affordable ? (
                  <>
                    <span className="text-xs">🪙</span>
                    {formatNumber(item.price)}
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    {formatNumber(item.price)}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
