"use client";

import { useMemo, useState } from "react";
import { useTimeTracker } from "@/context/TimeTrackerContext";
import { useNowTick } from "@/hooks/useNowTick";
import {
  sessionsForLocalDay,
  sessionsInRange,
  totalsByActivity,
} from "@/lib/summary";
import type { RangeMode } from "@/lib/types";
import {
  addDays,
  formatDayLabel,
  startOfLocalDay,
} from "@/lib/time";
import { DayTimeline } from "./DayTimeline";
import { SummaryChart } from "./SummaryChart";
import { SummaryTotalsList } from "./SummaryTotalsList";

export function ResumenView() {
  const { activities, sessions } = useTimeTracker();
  const [mode, setMode] = useState<RangeMode>("day");
  const [anchor, setAnchor] = useState(() => startOfLocalDay(new Date()));
  const now = useNowTick(true);

  const inRange = useMemo(
    () => sessionsInRange(sessions, mode, anchor),
    [sessions, mode, anchor],
  );

  const totals = useMemo(
    () => totalsByActivity(inRange, activities, now),
    [inRange, activities, now],
  );

  const daySessions = useMemo(
    () => sessionsForLocalDay(sessions, anchor),
    [sessions, anchor],
  );

  function shiftAnchor(delta: number) {
    setAnchor((prev) =>
      startOfLocalDay(
        addDays(prev, mode === "day" ? delta : delta * 7),
      ),
    );
  }

  const rangeLabel =
    mode === "day"
      ? formatDayLabel(anchor)
      : `Semana del ${formatDayLabel(anchor)}`;

  return (
    <div className="space-y-8">
      <div className="flex gap-2 rounded-xl bg-zinc-100 p-1">
        {(["day", "week"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              mode === m
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600"
            }`}
          >
            {m === "day" ? "Día" : "Semana"}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftAnchor(-1)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          aria-label="Anterior"
        >
          ←
        </button>
        <p className="text-center text-sm font-medium capitalize">
          {rangeLabel}
        </p>
        <button
          type="button"
          onClick={() => shiftAnchor(1)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          aria-label="Siguiente"
        >
          →
        </button>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-500">
          Distribución
        </h2>
        <SummaryChart totals={totals} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-500">Totales</h2>
        <SummaryTotalsList totals={totals} />
      </section>

      {mode === "day" && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-500">
            Línea de tiempo del día
          </h2>
          <DayTimeline
            sessions={daySessions}
            activities={activities}
            dayStart={anchor}
            now={now}
          />
        </section>
      )}
    </div>
  );
}
