import type { Activity, Session } from "@/lib/types";

type DbActivity = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

type DbSession = {
  id: string;
  user_id: string;
  activity_id: string;
  started_at: string;
  ended_at: string | null;
};

export function mapActivity(row: DbActivity): Activity {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}

export function mapSession(row: DbSession): Session {
  return {
    id: row.id,
    activityId: row.activity_id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}
