const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? money.format(amount) : 'Price on request';
}
