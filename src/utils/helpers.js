export function toRoman(num) {
  const romans = ['I', 'II', 'III', 'IV'];
  return romans[num - 1] || num;
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
