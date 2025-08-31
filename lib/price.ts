export type PriceOptions = {
  withUnit?: boolean;
  unit?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

/**
 * Format a number as a MAD currency value using fr-FR grouping rules.
 * Styling is left to the caller; this only returns the formatted string.
 */
export function price(value: number | null | undefined, options: PriceOptions = {}): string {
  const {
    withUnit = true,
    unit = "MAD",
    locale = "fr-FR",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  const numeric = typeof value === "number" && !isNaN(value) ? value : 0;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numeric);

  return withUnit ? `${formatted} ${unit}` : formatted;
}
