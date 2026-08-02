"use client";

import { useEffect, useState } from "react";

const DEFAULT_WORDS = ["itself", "autonomously", "onchain"];

export function RotatingWord({
  words = DEFAULT_WORDS,
  interval = 2600,
}: {
  words?: string[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || words.length < 2) {
      return;
    }

    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const enterTimer = setInterval(() => {
      setSwapping(true);
      exitTimer = setTimeout(() => {
        setIndex((current) => (current + 1) % words.length);
        setSwapping(false);
      }, 280);
    }, interval);
    return () => {
      clearInterval(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [interval, words.length]);

  return (
    <span className="rotating-word-wrap">
      <span
        className={`rotating-word${swapping ? " is-swapping" : ""}`}
        aria-hidden="true"
      >
        {words[index]}
      </span>
      <span className="sr-only" aria-live="polite">
        {words[index]}
      </span>
    </span>
  );
}
