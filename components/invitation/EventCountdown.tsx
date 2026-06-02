"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type EventCountdownProps = {
  startsAt: string;
  compact?: boolean;
};

function getRemainingParts(startsAt: string) {
  const diff = new Date(startsAt).getTime() - Date.now();
  const remaining = Math.max(diff, 0);
  const totalSeconds = Math.floor(remaining / 1000);

  return {
    isPast: diff <= 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

export function EventCountdown({ startsAt, compact }: EventCountdownProps) {
  const [, setNowTick] = useState(0);
  const remaining = getRemainingParts(startsAt);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (remaining.isPast) {
    return <p className="text-sm font-medium text-sage">Bu güzel gün başladı.</p>;
  }

  const parts = [
    { label: "Gün", value: remaining.days },
    { label: "Saat", value: remaining.hours },
    { label: "Dakika", value: remaining.minutes },
    { label: "Saniye", value: remaining.seconds }
  ];

  return (
    <div className={cn("grid grid-cols-4 gap-2", compact ? "max-w-sm" : "max-w-xl")}>
      {parts.map((part) => (
        <div
          key={part.label}
          className="rounded-lg border border-copper/18 bg-white/68 px-2 py-3 text-center shadow-line backdrop-blur"
        >
          <p className={cn("font-semibold tabular-nums", compact ? "text-lg" : "text-2xl")}>
            {String(part.value).padStart(2, "0")}
          </p>
          <p className="mt-1 text-[11px] uppercase text-muted-foreground">{part.label}</p>
        </div>
      ))}
    </div>
  );
}
