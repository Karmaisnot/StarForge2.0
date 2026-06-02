// Currency rates (relative to UZS) and money formatting.
// Rates mirror the design source: 1 UZS base, FX divisors per currency.
export const SF_RATES = { UZS: 1, USD: 1 / 12650, EUR: 1 / 13700, RUB: 1 / 138 };
export const SF_SYM = { UZS: "so'm", USD: '$', EUR: '€', RUB: '₽' };
export const CURRENCIES = Object.keys(SF_RATES);

export function fmtMoney(uzs, cur = 'UZS') {
  const v = uzs * SF_RATES[cur];
  if (cur === 'UZS') {
    if (Math.abs(uzs) >= 1e9) return (uzs / 1e9).toFixed(2) + ' mlrd';
    if (Math.abs(uzs) >= 1e6) return (uzs / 1e6).toFixed(1) + ' mln';
    if (Math.abs(uzs) >= 1e3) return Math.round(uzs / 1e3) + 'k';
    return Math.round(uzs).toLocaleString('ru-RU');
  }
  const sym = SF_SYM[cur];
  if (Math.abs(v) >= 1e6) return sym + (v / 1e6).toFixed(2) + 'M';
  if (Math.abs(v) >= 1e3) return sym + (v / 1e3).toFixed(1) + 'k';
  return sym + v.toFixed(cur === 'RUB' ? 0 : 1);
}

export function fmtCount(n) {
  return n > 999 ? (n / 1000).toFixed(1) + 'k' : String(n);
}
