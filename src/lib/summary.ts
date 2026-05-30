import type { Activity, RangeMode, Session } from "./types";
import {
  addDays,
  durationMs,
  localDateKey,
  localDateKeyFromDate,
  startOfLocalDay,
  startOfLocalWeek,
} from "./time";

export type ActivityTotal = {
  activity: Activity;
  ms: number;
};

export function sessionsInRange(
  sessions: Session[],
  mode: RangeMode,
  anchor: Date,
): Session[] {
  const rangeStart =
    mode === "day" ? startOfLocalDay(anchor) : startOfLocalWeek(anchor);
  const rangeEnd =
    mode === "day" ? addDays(rangeStart, 1) : addDays(rangeStart, 7);

  return sessions.filter((s) => {
    const started = new Date(s.startedAt);
    if (started < rangeStart || started >= rangeEnd) return false;
    return true;
  });
}

export function totalsByActivity(
  sessions: Session[],
  activities: Activity[],
  now: Date = new Date(),
): ActivityTotal[] {
  const map = new Map<string, number>();

  for (const s of sessions) {
    const ms = durationMs(s.startedAt, s.endedAt, now);
    map.set(s.activityId, (map.get(s.activityId) ?? 0) + ms);
  }

  return activities
    .map((activity) => ({
      activity,
      ms: map.get(activity.id) ?? 0,
    }))
    .filter((t) => t.ms > 0)
    .sort((a, b) => b.ms - a.ms);
}

/** Sesiones de un día concreto (por `started_at` en calendario local). */
export function sessionsForLocalDay(
  sessions: Session[],
  day: Date,
): Session[] {
  const key = localDateKeyFromDate(startOfLocalDay(day));
  return sessions
    .filter((s) => localDateKey(s.startedAt) === key)
    .sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    );
}

/** Sesiones que solapan con la semana [weekStart, weekStart + 7 días). */
export function sessionsIntersectingWeek(
  sessions: Session[],
  weekStart: Date,
  now: Date = new Date(),
): Session[] {
  const rangeStart = startOfLocalWeek(weekStart);
  const rangeEnd = addDays(rangeStart, 7);

  return sessions.filter((s) => {
    const started = new Date(s.startedAt);
    const ended = s.endedAt ? new Date(s.endedAt) : now;
    return started < rangeEnd && ended > rangeStart;
  });
}
