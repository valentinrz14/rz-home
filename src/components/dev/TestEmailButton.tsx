"use client";

import { CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import { useState } from "react";

export function TestEmailButton() {
  const [email, setEmail] = useState("valentinrz@hotmail.com");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [result, setResult] = useState<Record<string, string> | null>(null);

  async function handleSend() {
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email }),
      });
      const data = await res.json();
      setResult(data);
      setStatus(data.buyer === "ok" ? "ok" : "error");
    } catch {
      setStatus("error");
      setResult({ error: "No se pudo conectar con la API" });
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-amber-500/30 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-sm">
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Dev · Test Email
      </p>
      <p className="mb-3 text-xs text-zinc-500">Usá tu email verificado como Sender en SendGrid</p>

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-amber-500/60"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={status === "loading" || !email}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
          Enviar
        </button>
      </div>

      {result && (
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-xs">
          {status === "ok" ? (
            <p className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle size={13} /> Emails enviados correctamente
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-red-400">
              <XCircle size={13} /> Error al enviar
            </p>
          )}
          <div className="mt-2 space-y-0.5 text-zinc-500">
            {Object.entries(result).map(([k, v]) => (
              <p key={k}>
                <span className="text-zinc-400">{k}:</span>{" "}
                {String(v).length > 60 ? `${String(v).slice(0, 60)}…` : String(v)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
