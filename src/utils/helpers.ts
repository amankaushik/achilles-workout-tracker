export function toRoman(num: number): string {
  const romans = ['I', 'II', 'III', 'IV'];
  return romans[num - 1] || String(num);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
