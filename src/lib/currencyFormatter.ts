/**
 * Currency formatting utility for consistent price display
 * Supports RTL (Persian/Dari) and LTR (English) formats
 */

interface CurrencyConfig {
  symbol: string;
  symbolFa: string;
  name: string;
  nameFa: string;
}

const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  AFN: { symbol: "AFN", symbolFa: "؋", name: "Afghani", nameFa: "افغانی" },
  USD: { symbol: "$", symbolFa: "$", name: "US Dollar", nameFa: "دالر" },
  EUR: { symbol: "€", symbolFa: "€", name: "Euro", nameFa: "یورو" },
  GBP: { symbol: "£", symbolFa: "£", name: "British Pound", nameFa: "پوند" },
  IRR: { symbol: "IRR", symbolFa: "﷼", name: "Iranian Rial", nameFa: "ریال" },
};

/**
 * Get currency symbol based on currency code and language direction
 */
export const getCurrencySymbol = (currency: string, isRTL: boolean = false): string => {
  const config = CURRENCY_MAP[currency?.toUpperCase()];
  if (!config) return currency || "AFN";
  return isRTL ? config.symbolFa : config.symbol;
};

/**
 * Get currency name based on currency code and language direction
 */
export const getCurrencyName = (currency: string, isRTL: boolean = false): string => {
  const config = CURRENCY_MAP[currency?.toUpperCase()];
  if (!config) return currency || "AFN";
  return isRTL ? config.nameFa : config.name;
};

/**
 * Format a price with currency for display
 * @param amount - The numeric amount to format
 * @param currency - The currency code (e.g., "AFN", "USD")
 * @param isRTL - Whether to use RTL formatting (Persian/Dari)
 * @returns Formatted price string with currency
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = "AFN",
  isRTL: boolean = false
): string => {
  const safeAmount = amount ?? 0;
  const symbol = getCurrencySymbol(currency, isRTL);
  
  // Format number with locale-appropriate separators
  const formattedAmount = isRTL
    ? safeAmount.toLocaleString("fa-IR")
    : safeAmount.toLocaleString("en-US");
  
  // For USD, put symbol before amount; for others, put after
  if (currency?.toUpperCase() === "USD") {
    return `${symbol}${formattedAmount}`;
  }
  
  return `${formattedAmount} ${symbol}`;
};

/**
 * Format a price with currency for display (compact version)
 * Uses shorter symbol format
 */
export const formatCurrencyCompact = (
  amount: number | null | undefined,
  currency: string = "AFN",
  isRTL: boolean = false
): string => {
  const safeAmount = amount ?? 0;
  const config = CURRENCY_MAP[currency?.toUpperCase()];
  const symbol = config?.symbolFa || currency || "AFN";
  
  const formattedAmount = isRTL
    ? safeAmount.toLocaleString("fa-IR")
    : safeAmount.toLocaleString("en-US");
  
  if (currency?.toUpperCase() === "USD") {
    return `${symbol}${formattedAmount}`;
  }
  
  return `${formattedAmount} ${symbol}`;
};
