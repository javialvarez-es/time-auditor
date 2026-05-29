import type { ActivityTotal } from "@/lib/summary";
import { formatDuration } from "@/lib/time";

type Props = {
  totals: ActivityTotal[];
};

export function SummaryTotalsList({ totals }: Props) {
  if (totals.length === 0) return null;

  return (
    <ul className="space-y-2">
      {totals.map(({ activity, ms }) => (
        <li
          key={activity.id}
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
        >
          <span className="flex items-center gap-2 font-medium">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: activity.color }}
            />
            {activity.name}
          </span>
          <span className="tabular-nums text-zinc-600">
            {formatDuration(ms)}
          </span>
        </li>
      ))}
    </ul>
  );
}
