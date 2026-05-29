"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ActivityTotal } from "@/lib/summary";
import { formatDuration } from "@/lib/time";

type Props = {
  totals: ActivityTotal[];
};

export function SummaryChart({ totals }: Props) {
  if (totals.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        Sin tiempo registrado en este rango.
      </p>
    );
  }

  const data = totals.map((t) => ({
    name: t.activity.name,
    value: t.ms,
    color: t.activity.color,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatDuration(value)}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
