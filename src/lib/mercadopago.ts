import MercadoPago from "mercadopago";
import { getMpAccessToken } from "./env";

export function getMercadoPagoClient() {
  return new MercadoPago({ accessToken: getMpAccessToken() });
}
