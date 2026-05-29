"use client";

import type { Activity, Session } from "@/lib/types";
import { durationMs, formatClockLocal, formatDuration } from "@/lib/time";

type Props = {
  sessions: Session[];
  activities: Activity[];
  dayStart: Date;
  now?: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function DayTimeline({
  sessions,
  activities,
  dayStart,
  now = new Date(),
}: Props) {
  const activityMap = new Map(activities.map((a) => [a.id, a]));

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No hay sesiones este día.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-10 w-full overflow-hidden rounded-lg bg-zinc-100">
        {sessions.map((session) => {
          const activity = activityMap.get(session.activityId);
          if (!activity) return null;

          const start = new Date(session.startedAt).getTime();
          const endMs = session.endedAt
            ? new Date(session.endedAt).getTime()
            : now.getTime();
          const dayStartMs = dayStart.getTime();
          const left = ((start - dayStartMs) / DAY_MS) * 100;
          const width = ((endMs - start) / DAY_MS) * 100;

          if (left >= 100 || left + width <= 0) return null;

          return (
            <div
              key={session.id}
              title={`${activity.name}: ${formatClockLocal(session.startedAt)} – ${
                session.endedAt
                  ? formatClockLocal(session.endedAt)
                  : "ahora"
              }`}
              className="absolute top-1 bottom-1 min-w-[2px] rounded"
              style={{
                left: `${Math.max(0, left)}%`,
                width: `${Math.min(100 - Math.max(0, left), width)}%`,
                backgroundColor: activity.color,
              }}
            />
          );
        })}
      </div>

      <ul className="space-y-2 text-sm">
        {sessions.map((session) => {
          const activity = activityMap.get(session.activityId);
          if (!activity) return null;
          const ms = durationMs(
            session.startedAt,
            session.endedAt,
            now,
          );

          return (
            <li
              key={session.id}
              className="flex items-center gap-2 border-l-4 pl-3"
              style={{ borderColor: activity.color }}
            >
              <span className="font-medium">{activity.name}</span>
              <span className="text-zinc-500">
                {formatClockLocal(session.startedAt)}
                {" – "}
                {session.endedAt
                  ? formatClockLocal(session.endedAt)
                  : "en curso"}
              </span>
              <span className="ml-auto tabular-nums text-zinc-600">
                {formatDuration(ms)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
