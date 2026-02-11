export function toRoman(num: number): string {
  const romans = ['I', 'II', 'III', 'IV'];
  return romans[num - 1] || String(num);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
