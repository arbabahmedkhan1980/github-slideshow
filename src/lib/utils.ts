export const formatDimension = (lengthMm: number, widthMm: number) => {
  const toMeters = (mm: number) => (Math.round(mm / 10) / 100).toFixed(2);
  return `${toMeters(lengthMm)}m x ${toMeters(widthMm)}m`;
};

export const formatCurrency = (
  value: number,
  currency = "AED",
  locale = "en-US"
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
