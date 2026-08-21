// Utility helpers for formatting currency, numbers, text

export function formatNaira(amount) {
  const num = Number(amount) || 0;
  return '₦' + num.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatCompactNaira(amount) {
  const num = Number(amount) || 0;
  if (num >= 1_000_000) {
    return '₦' + (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return '₦' + (num / 1_000).toFixed(1) + 'k';
  }
  return formatNaira(amount);
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
