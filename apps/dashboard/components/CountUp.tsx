"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  duration = 700,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(() => value.toFixed(decimals));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window.matchMedia !== "undefined") {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotion.matches) {
        setDisplay(value.toFixed(decimals));
        return;
      }
    }
    const start = performance.now();
    const from = 0;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay((from + (value - from) * eased).toFixed(decimals));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, decimals, duration]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}
