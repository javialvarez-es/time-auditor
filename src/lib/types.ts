export type Activity = {
  id: string;
  name: string;
  color: string;
};

export type Session = {
  id: string;
  activityId: string;
  /** ISO 8601 en UTC */
  startedAt: string;
  /** null mientras la sesión está activa */
  endedAt: string | null;
};

export type RangeMode = "day" | "week";

export type ResumenViewMode = RangeMode | "calendar";
