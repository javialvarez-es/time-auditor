"use client";

import { useMemo, useState } from "react";
import { useTimeTracker } from "@/context/TimeTrackerContext";
import { useNowTick } from "@/hooks/useNowTick";
import {
  sessionsForLocalDay,
  sessionsInRange,
  totalsByActivity,
} from "@/lib/summary";
import type { ResumenViewMode, Session } from "@/lib/types";
import {
  addDays,
  formatDayLabel,
  formatWeekRange,
  localDateKeyFromDate,
  startOfLocalDay,
  startOfLocalWeek,
} from "@/lib/time";
import { DayTimeline } from "./DayTimeline";
import { SessionFormModal } from "./SessionFormModal";
import { SummaryChart } from "./SummaryChart";
import { SummaryTotalsList } from "./SummaryTotalsList";
import { WeekCalendarView } from "./WeekCalendarView";

type SessionModalState =
  | { mode: "add" }
  | { mode: "edit"; session: Session }
  | null;

export function ResumenView() {
  const { activities, sessions } = useTimeTracker();
  const [mode, setMode] = useState<ResumenViewMode>("day");
  const [anchor, setAnchor] = useState(() => startOfLocalDay(new Date()));
  const [sessionModal, setSessionModal] = useState<SessionModalState>(null);
  const now = useNowTick(true);

  const summaryMode = mode === "calendar" ? "day" : mode;

  const inRange = useMemo(
    () => sessionsInRange(sessions, summaryMode, anchor),
    [sessions, summaryMode, anchor],
  );

  const totals = useMemo(
    () => totalsByActivity(inRange, activities, now),
    [inRange, activities, now],
  );

  const daySessions = useMemo(
    () => sessionsForLocalDay(sessions, anchor),
    [sessions, anchor],
  );

  const weekStart = useMemo(() => startOfLocalWeek(anchor), [anchor]);

  function shiftAnchor(delta: number) {
    setAnchor((prev) => {
      const base =
        mode === "day"
          ? startOfLocalDay(prev)
          : startOfLocalWeek(prev);
      const step = mode === "day" ? delta : delta * 7;
      const next = addDays(base, step);
      return mode === "day" ? next : startOfLocalWeek(next);
    });
  }

  function goToToday() {
    setAnchor(
      mode === "calendar"
        ? startOfLocalWeek(new Date())
        : startOfLocalDay(new Date()),
    );
  }

  const rangeLabel =
    mode === "day"
      ? formatDayLabel(anchor)
      : mode === "week"
        ? `Semana del ${formatDayLabel(weekStart)}`
        : formatWeekRange(weekStart);

  return (
    <div className="space-y-8">
      <div className="flex gap-2 rounded-xl bg-zinc-100 p-1">
        {(
          [
            { id: "day" as const, label: "Día" },
            { id: "week" as const, label: "Semana" },
            { id: "calendar" as const, label: "Calendario" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              mode === id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
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
        {mode === "calendar" && (
          <button
            type="button"
            onClick={goToToday}
            className="w-full rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Hoy
          </button>
        )}
      </div>

      {mode === "calendar" ? (
        <section>
          <WeekCalendarView
            weekAnchor={anchor}
            sessions={sessions}
            activities={activities}
            now={now}
          />
        </section>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setSessionModal({ mode: "add" })}
            className="w-full rounded-xl border-2 border-dashed border-zinc-300 bg-white px-4 py-3 text-base font-medium text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50"
          >
            + Añadir sesión
          </button>

          <section>
            <h2 className="mb-3 text-sm font-medium text-zinc-500">
              Distribución
            </h2>
            <SummaryChart totals={totals} />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium text-zinc-500">
              Totales
            </h2>
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
                onEditSession={(session) =>
                  setSessionModal({ mode: "edit", session })
                }
              />
            </section>
          )}
        </>
      )}

      {sessionModal && (
        <SessionFormModal
          mode={sessionModal.mode}
          session={
            sessionModal.mode === "edit" ? sessionModal.session : undefined
          }
          defaultDateKey={localDateKeyFromDate(anchor)}
          activities={activities}
          onClose={() => setSessionModal(null)}
        />
      )}
    </div>
  );
}
