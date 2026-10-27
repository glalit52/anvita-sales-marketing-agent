const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const num = new Intl.NumberFormat("en-IN");

export const formatCurrency = (value: number) => inr.format(value);
export const formatCompact = (value: number) => compact.format(value);
export const formatNumber = (value: number) => num.format(value);
export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
