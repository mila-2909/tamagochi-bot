export function formatNumber(n: number): string {
  const v = Math.floor(n);
  if (v < 1000) return v.toString();
  if (v < 1_000_000) {
    const s = (v / 1000).toFixed(v < 10_000 ? 1 : 0);
    return s.replace(/\.0$/, '') + 'K';
  }
  if (v < 1_000_000_000) {
    const s = (v / 1_000_000).toFixed(1);
    return s.replace(/\.0$/, '') + 'M';
  }
  const s = (v / 1_000_000_000).toFixed(1);
  return s.replace(/\.0$/, '') + 'B';
}

export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
  }
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m} мин ${sec} сек` : `${m} мин`;
  }
  return `${s} сек`;
}
