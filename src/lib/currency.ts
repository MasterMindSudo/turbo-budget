// src/lib/currency.ts

const API_BASE_URL = 'https://api.exchangerate.host';

/**
 * Fetches the latest exchange rate between two currencies.
 * @param fromCurrency The currency to convert from (e.g., 'USD').
 * @param toCurrency The currency to convert to (e.g., 'EUR').
 * @returns The exchange rate.
 */
export const getExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    const url = `${API_BASE_URL}/latest?base=${fromCurrency}&symbols=${toCurrency}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.success && data.rates && data.rates[toCurrency]) {
      return data.rates[toCurrency];
    } else {
      console.error('Failed to fetch exchange rate. Response:', data);
      throw new Error(`Failed to fetch exchange rate for ${fromCurrency} to ${toCurrency}.`);
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};

/**
 * Converts an amount from one currency to another.
 * @param amount The amount to convert.
 * @param fromCurrency The currency to convert from.
 * @param toCurrency The currency to convert to.
 * @returns The converted amount.
 */
export const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
};
