import { CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { getBankDetails, getCryptoWallets, getWhatsappNumber } from "@/lib/env";
import { getCryptoConversion } from "@/lib/ripio";
import type { PaymentMethod } from "@/types/orders";
import { CopyableField } from "./CopyableField";

// ── Helpers ────────────────────────────────────────────────────────────────────

function cryptoLabel(method: PaymentMethod) {
  switch (method) {
    case "crypto_usdt_trc20":
      return "USDT (TRC-20)";
    case "crypto_usdt_polygon":
      return "USDT (Polygon)";
    case "crypto_ltc":
      return "Litecoin (LTC)";
    default:
      return "Cripto";
  }
}

// ── Página ────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{
    orderId?: string;
    method?: string;
    amount?: string;
  }>;
}

export default async function CheckoutPendingPage({ searchParams }: Props) {
  const { orderId, method, amount } = await searchParams;

  const paymentMethod = (method ?? "transfer") as PaymentMethod;
  const isTransfer = paymentMethod === "transfer";
  const isCrypto = paymentMethod.startsWith("crypto_");

  const bank = getBankDetails();
  const wallets = getCryptoWallets();
  const whatsapp = getWhatsappNumber();

  const arsAmount = Number(amount ?? 0);
  const formattedARS = arsAmount
    ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(arsAmount)
    : null;

  // Cotización cripto desde Ripio
  const cryptoConversion =
    isCrypto && arsAmount ? await getCryptoConversion(arsAmount, paymentMethod) : null;

  const cryptoWallet =
    paymentMethod === "crypto_usdt_trc20"
      ? wallets.usdt_trc20
      : paymentMethod === "crypto_usdt_polygon"
        ? wallets.usdt_polygon
        : paymentMethod === "crypto_ltc"
          ? wallets.ltc
          : null;

  const label = cryptoLabel(paymentMethod);

  const waText = orderId
    ? encodeURIComponent(
        isCrypto && cryptoConversion
          ? `Hola! Les envío el comprobante del pedido Ref: ${orderId} — ${cryptoConversion.amount} ${cryptoConversion.ticker}${formattedARS ? ` (${formattedARS})` : ""}. Adjunto el hash de la transacción.`
          : `Hola! Les envío el comprobante del pedido Ref: ${orderId}${formattedARS ? ` — ${formattedARS}` : ""}. Adjunto el comprobante de transferencia.`
      )
    : "";

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          ¡Pedido realizado!
        </h1>
        {orderId && (
          <p className="mt-2 font-mono text-base text-zinc-500">
            Ref: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{orderId}</span>
          </p>
        )}
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
          Una vez que confirmemos tu pago, te enviamos la información de envío por email.
        </p>
      </div>

      {/* Datos de pago */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {isTransfer && (
          <>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
              Datos para transferencia
            </h2>
            <p className="mb-4 text-sm text-zinc-500">
              Realizá la transferencia por el monto exacto y envianos el comprobante por WhatsApp.
            </p>
            <div className="space-y-2">
              {bank.cbu && <CopyableField label="CBU" value={bank.cbu} />}
              {bank.alias && <CopyableField label="Alias" value={bank.alias} />}
              {bank.titular && <CopyableField label="Titular" value={bank.titular} />}
              {bank.number_of_account && (
                <CopyableField label="Numero de cuenta" value={bank.number_of_account} />
              )}
              {formattedARS && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/30">
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Monto a transferir
                  </span>
                  <span className="font-display text-lg font-bold text-green-700 dark:text-green-400">
                    {formattedARS}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {isCrypto && (
          <>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
              Pago con {label}
            </h2>
            <p className="mb-4 text-sm text-zinc-500">
              Enviá el monto exacto a la siguiente wallet y compartinos el hash de la transacción
              por WhatsApp.
            </p>
            <div className="space-y-2">
              {cryptoWallet && <CopyableField label={`Wallet ${label}`} value={cryptoWallet} />}

              {/* Monto en crypto */}
              {cryptoConversion ? (
                <div className="mt-3 space-y-1.5">
                  <CopyableField
                    label={`Monto a abonar en ${cryptoConversion.ticker}`}
                    value={`${cryptoConversion.amount} ${cryptoConversion.ticker}`}
                  />
                  {formattedARS && (
                    <p className="text-right text-xs text-zinc-400">
                      Cotización Ripio al momento del pedido · {formattedARS} ARS
                    </p>
                  )}
                </div>
              ) : (
                formattedARS && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Monto a abonar (ARS equiv.)
                    </span>
                    <span className="font-display text-lg font-bold text-amber-700 dark:text-amber-400">
                      {formattedARS}
                    </span>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Botones */}
      <div className="mt-6 flex flex-col gap-3">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white transition hover:bg-green-700"
          >
            <MessageCircle size={20} /> Enviar comprobante por WhatsApp
          </a>
        )}
        <Link
          href="/"
          className="flex items-center justify-center rounded-xl border border-zinc-200 px-6 py-3.5 text-base font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Volver al inicio
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-zinc-400">
        ¿Alguna duda? Escribinos por WhatsApp y te ayudamos.
      </p>
    </div>
  );
}
