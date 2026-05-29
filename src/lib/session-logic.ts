import type { Session } from "./types";
import { toUtcIso } from "./time";

export function getActiveSession(sessions: Session[]): Session | null {
  return sessions.find((s) => s.endedAt === null) ?? null;
}

/** Aplica la regla de negocio al tocar una actividad. */
export function tapActivity(
  sessions: Session[],
  activityId: string,
): Session[] {
  const active = getActiveSession(sessions);
  const now = toUtcIso();

  if (!active) {
    return [
      ...sessions,
      {
        id: crypto.randomUUID(),
        activityId,
        startedAt: now,
        endedAt: null,
      },
    ];
  }

  if (active.activityId === activityId) {
    return sessions.map((s) =>
      s.id === active.id ? { ...s, endedAt: now } : s,
    );
  }

  const closed = sessions.map((s) =>
    s.id === active.id ? { ...s, endedAt: now } : s,
  );

  return [
    ...closed,
    {
      id: crypto.randomUUID(),
      activityId,
      startedAt: now,
      endedAt: null,
    },
  ];
}

/** Cierra la sesión activa si existe. */
export function stopActive(sessions: Session[]): Session[] {
  const active = getActiveSession(sessions);
  if (!active) return sessions;
  const now = toUtcIso();
  return sessions.map((s) =>
    s.id === active.id ? { ...s, endedAt: now } : s,
  );
}
