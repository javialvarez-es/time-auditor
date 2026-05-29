"use client";

import { useState } from "react";
import { useTimeTracker } from "@/context/TimeTrackerContext";

const PRESET_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#6366f1",
  "#f59e0b",
  "#ec4899",
  "#ef4444",
  "#14b8a6",
  "#8b5cf6",
];

export function ActivityManager() {
  const { activities, addActivity, deleteActivity } = useTimeTracker();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [open, setOpen] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addActivity(name, color);
    setName("");
    setOpen(false);
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-zinc-700"
      >
        {open ? "Ocultar actividades" : "Gestionar actividades"}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre (ej. Lectura)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              maxLength={40}
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 ${
                    color === c ? "border-zinc-900" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Añadir actividad
            </button>
          </form>

          <ul className="divide-y divide-zinc-200 border-t border-zinc-200 pt-2">
            {activities.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: a.color }}
                  />
                  {a.name}
                </span>
                <button
                  type="button"
                  onClick={() => void deleteActivity(a.id)}
                  className="text-red-600 hover:underline"
                >
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
