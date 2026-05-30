"use client";

import type { Activity, Session } from "@/lib/types";
import { durationMs, formatClockLocal, formatDuration } from "@/lib/time";

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="m2.695 14.762-1.262 3.154a1 1 0 0 0 1.347 1.347l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
    </svg>
  );
}

type Props = {
  sessions: Session[];
  activities: Activity[];
  dayStart: Date;
  now?: Date;
  onEditSession?: (session: Session) => void;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function DayTimeline({
  sessions,
  activities,
  dayStart,
  now = new Date(),
  onEditSession,
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
              <span className="min-w-0 flex-1">
                <span className="font-medium">{activity.name}</span>
                <span className="block text-zinc-500 sm:inline sm:before:content-['_']">
                  {formatClockLocal(session.startedAt)}
                  {" – "}
                  {session.endedAt
                    ? formatClockLocal(session.endedAt)
                    : "en curso"}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-zinc-600">
                {formatDuration(ms)}
              </span>
              {onEditSession && (
                <button
                  type="button"
                  onClick={() => onEditSession(session)}
                  className="shrink-0 rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  aria-label={`Editar sesión de ${activity.name}`}
                >
                  <PencilIcon />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
