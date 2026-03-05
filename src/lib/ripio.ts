import type { PaymentMethod } from "@/types/orders";

interface RipioRate {
  ticker: string;
  buy_rate: string;
  sell_rate: string;
}

const TICKER_MAP: Partial<Record<PaymentMethod, string>> = {
  crypto_usdt_trc20: "USDT_ARS",
  crypto_usdt_polygon: "USDT_ARS",
  crypto_ltc: "LTC_ARS",
};

/**
 * Convierte un monto en ARS a su equivalente en cripto usando la API de Ripio.
 * Usa buy_rate (el precio al que Ripio vende crypto) para que el monto calculado
 * coincida con lo que el cliente ve al cotizar en Ripio.
 */
export async function getCryptoConversion(
  arsAmount: number,
  paymentMethod: PaymentMethod
): Promise<{ amount: string; ticker: string } | null> {
  const ticker = TICKER_MAP[paymentMethod];
  if (!ticker) return null;

  try {
    const res = await fetch("https://app.ripio.com/api/v3/rates/?country=AR", {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const rates: RipioRate[] = await res.json();
    const rate = rates.find((r) => r.ticker === ticker);
    if (!rate) return null;

    // buy_rate: precio al que Ripio vende 1 crypto (lo que el cliente pagaría en ARS)
    const buyRate = parseFloat(rate.buy_rate);
    if (!buyRate) return null;

    const cryptoAmount = arsAmount / buyRate;
    const decimals = ticker.startsWith("LTC") ? 4 : 2;

    return {
      amount: cryptoAmount.toFixed(decimals),
      ticker: ticker.replace("_ARS", ""),
    };
  } catch {
    return null;
  }
}
