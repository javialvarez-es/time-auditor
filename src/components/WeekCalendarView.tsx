"use client";

import { useMemo } from "react";
import type { Activity, Session } from "@/lib/types";
import { sessionsIntersectingWeek } from "@/lib/summary";
import {
  addDays,
  formatShortWeekday,
  startOfLocalDay,
  startOfLocalWeek,
} from "@/lib/time";

const START_HOUR = 6;
const END_HOUR = 24;
const HOURS_VISIBLE = END_HOUR - START_HOUR;
const PX_PER_HOUR = 44;
const GRID_HEIGHT = HOURS_VISIBLE * PX_PER_HOUR;
const MIN_LABEL_HEIGHT_PX = 28;
const DAY_COLUMN_MIN_WIDTH = "4.25rem";
/** Altura fija del encabezado (día + fecha) para alinear todas las columnas. */
const DAY_HEADER_CLASS = "mb-1 flex h-11 flex-col items-center justify-end";

type Props = {
  weekAnchor: Date;
  sessions: Session[];
  activities: Activity[];
  now?: Date;
};

type BlockSegment = {
  session: Session;
  activity: Activity;
  topPx: number;
  heightPx: number;
};

function getBlockSegment(
  session: Session,
  dayStart: Date,
  now: Date,
): { topPx: number; heightPx: number } | null {
  const dayEnd = addDays(dayStart, 1);
  const start = new Date(session.startedAt);
  const end = session.endedAt ? new Date(session.endedAt) : now;

  const segStart = Math.max(start.getTime(), dayStart.getTime());
  const segEnd = Math.min(end.getTime(), dayEnd.getTime());
  if (segStart >= segEnd) return null;

  const viewStart = new Date(dayStart);
  viewStart.setHours(START_HOUR, 0, 0, 0);
  const viewEnd = new Date(dayStart);
  viewEnd.setHours(END_HOUR, 0, 0, 0);

  const clipStart = Math.max(segStart, viewStart.getTime());
  const clipEnd = Math.min(segEnd, viewEnd.getTime());
  if (clipStart >= clipEnd) return null;

  const minutesFromViewStart = (clipStart - viewStart.getTime()) / 60_000;
  const durationMinutes = (clipEnd - clipStart) / 60_000;

  const topPx = (minutesFromViewStart / 60) * PX_PER_HOUR;
  const heightPx = Math.max((durationMinutes / 60) * PX_PER_HOUR, 3);

  return { topPx, heightPx };
}

function blocksForDay(
  sessions: Session[],
  activityMap: Map<string, Activity>,
  dayStart: Date,
  now: Date,
): BlockSegment[] {
  const blocks: BlockSegment[] = [];

  for (const session of sessions) {
    const activity = activityMap.get(session.activityId);
    if (!activity) continue;

    const segment = getBlockSegment(session, dayStart, now);
    if (!segment) continue;

    blocks.push({
      session,
      activity,
      topPx: segment.topPx,
      heightPx: segment.heightPx,
    });
  }

  return blocks.sort(
    (a, b) =>
      new Date(a.session.startedAt).getTime() -
      new Date(b.session.startedAt).getTime(),
  );
}

export function WeekCalendarView({
  weekAnchor,
  sessions,
  activities,
  now = new Date(),
}: Props) {
  const weekStart = useMemo(
    () => startOfLocalWeek(weekAnchor),
    [weekAnchor],
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const weekSessions = useMemo(
    () => sessionsIntersectingWeek(sessions, weekStart, now),
    [sessions, weekStart, now],
  );

  const activityMap = useMemo(
    () => new Map(activities.map((a) => [a.id, a])),
    [activities],
  );

  const hourLabels = useMemo(() => {
    const labels: { hour: number; topPx: number }[] = [];
    for (let h = START_HOUR; h < END_HOUR; h += 2) {
      labels.push({
        hour: h,
        topPx: (h - START_HOUR) * PX_PER_HOUR,
      });
    }
    return labels;
  }, []);

  const todayKey = startOfLocalDay(now).getTime();

  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain">
      <div className="inline-flex min-w-max gap-0 px-1">
        {/* Columna de horas (mismo espacio de encabezado que las columnas de día) */}
        <div className="sticky left-0 z-10 w-10 shrink-0 bg-white pr-1">
          <div className={DAY_HEADER_CLASS} aria-hidden />
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {hourLabels.map(({ hour, topPx }) => (
              <span
                key={hour}
                className="absolute right-0 -translate-y-1/2 text-[10px] tabular-nums text-zinc-400"
                style={{ top: topPx }}
              >
                {String(hour).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>

        {/* Columnas de días */}
        {weekDays.map((day) => {
          const dayStart = startOfLocalDay(day);
          const isToday = dayStart.getTime() === todayKey;
          const blocks = blocksForDay(
            weekSessions,
            activityMap,
            dayStart,
            now,
          );

          return (
            <div
              key={dayStart.getTime()}
              className="flex shrink-0 flex-col"
              style={{ minWidth: DAY_COLUMN_MIN_WIDTH, width: DAY_COLUMN_MIN_WIDTH }}
            >
              <div className={DAY_HEADER_CLASS}>
                <div
                  className={`text-[10px] font-medium uppercase leading-tight ${
                    isToday ? "text-zinc-900" : "text-zinc-500"
                  }`}
                >
                  {formatShortWeekday(day)}
                </div>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${
                    isToday
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>

              <div
                className="relative rounded-md bg-zinc-50"
                style={{ height: GRID_HEIGHT }}
              >
                {hourLabels.map(({ hour, topPx }) => (
                  <div
                    key={hour}
                    className="pointer-events-none absolute inset-x-0 border-t border-zinc-200/80"
                    style={{ top: topPx }}
                  />
                ))}

                {blocks.map(({ session, activity, topPx, heightPx }) => (
                  <div
                    key={`${session.id}-${dayStart.getTime()}`}
                    title={activity.name}
                    className="absolute inset-x-0.5 overflow-hidden rounded px-0.5 text-[9px] font-medium leading-tight text-white shadow-sm"
                    style={{
                      top: topPx,
                      height: heightPx,
                      backgroundColor: activity.color,
                      minHeight: 3,
                    }}
                  >
                    {heightPx >= MIN_LABEL_HEIGHT_PX && (
                      <span className="line-clamp-2 break-words">
                        {activity.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
