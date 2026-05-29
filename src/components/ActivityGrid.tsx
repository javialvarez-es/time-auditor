"use client";

import { useTimeTracker } from "@/context/TimeTrackerContext";
import { useNowTick } from "@/hooks/useNowTick";
import { durationMs, formatElapsed } from "@/lib/time";

export function ActivityGrid() {
  const { activities, activeSession, tapActivity, stop, loading } =
    useTimeTracker();
  const now = useNowTick(!!activeSession);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {activities.map((activity) => {
          const isActive = activeSession?.activityId === activity.id;
          const elapsed =
            isActive && activeSession
              ? formatElapsed(
                  durationMs(activeSession.startedAt, null, now),
                )
              : null;

          return (
            <button
              key={activity.id}
              type="button"
              disabled={loading}
              onClick={() => void tapActivity(activity.id)}
              className={`relative flex min-h-[7.5rem] flex-col items-center justify-center rounded-2xl border-2 p-4 text-white shadow-md transition-transform active:scale-[0.98] ${
                isActive
                  ? "ring-4 ring-white ring-offset-2 ring-offset-zinc-900 scale-[1.02]"
                  : "opacity-95 hover:opacity-100"
              }`}
              style={{ backgroundColor: activity.color }}
            >
              <span className="text-lg font-semibold">{activity.name}</span>
              {isActive && elapsed && (
                <span className="mt-2 font-mono text-2xl tabular-nums">
                  {elapsed}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => void stop()}
        disabled={!activeSession || loading}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Parar
      </button>
    </div>
  );
}
