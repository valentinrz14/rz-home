import MercadoPago from "mercadopago";

export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno."
    );
  }
  return new MercadoPago({ accessToken });
}
