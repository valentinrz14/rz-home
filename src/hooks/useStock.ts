"use client";

import { useEffect, useState } from "react";
import type { StockStatus } from "@/lib/amazon-stock";
import { STOCK_DEFAULT } from "@/lib/amazon-stock";

export function useStock(): { stock: StockStatus; loading: boolean } {
  const [stock, setStock] = useState<StockStatus>(STOCK_DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stock")
      .then((r) => (r.ok ? (r.json() as Promise<StockStatus>) : null))
      .then((data) => {
        if (data) setStock(data);
      })
      .catch(() => {
        // Keep defaults (all null = optimistic)
      })
      .finally(() => setLoading(false));
  }, []);

  return { stock, loading };
}
