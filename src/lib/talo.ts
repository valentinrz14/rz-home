import { TaloClient } from "talo-pay";
import { getTaloCredentials, getTaloEnvironment } from "./env";

let _client: TaloClient | null = null;

export function getTaloClient(): TaloClient {
  if (!_client) {
    const creds = getTaloCredentials();
    _client = new TaloClient({
      clientId: creds.clientId,
      clientSecret: creds.clientSecret,
      userId: creds.userId,
      environment: getTaloEnvironment(),
    });
  }
  return _client;
}

/** Devuelve el user_id de Talo (necesario en el body de payments.create) */
export function getTaloUserId(): string {
  return getTaloCredentials().userId;
}
