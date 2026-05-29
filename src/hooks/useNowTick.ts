"use client";

import { useEffect, useState } from "react";

/** Fuerza un re-render cada segundo (cronómetro en vivo). */
export function useNowTick(enabled: boolean) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [enabled]);

  return now;
}
