"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="font-mono text-sm font-medium text-zinc-900 dark:text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-700 dark:hover:text-white"
        title="Copiar"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>
    </div>
  );
}
