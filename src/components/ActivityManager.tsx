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

function ColorPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className={`h-8 w-8 rounded-full border-2 ${
            selected === c ? "border-zinc-900" : "border-transparent"
          }`}
          style={{ backgroundColor: c }}
          aria-label={`Color ${c}`}
        />
      ))}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m2.695 14.762-1.262 3.154a1 1 0 0 0 1.347 1.347l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
    </svg>
  );
}

export function ActivityManager() {
  const { activities, addActivity, updateActivity, deleteActivity } =
    useTimeTracker();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(PRESET_COLORS[0]);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addActivity(name, color);
    setName("");
    setOpen(false);
  }

  function startEdit(activityId: string, activityName: string, activityColor: string) {
    setUpdateSuccess(false);
    setEditingId(activityId);
    setEditName(activityName);
    setEditColor(activityColor);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    const ok = await updateActivity(editingId, editName, editColor);
    if (!ok) return;
    setEditingId(null);
    setUpdateSuccess(true);
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
          {updateSuccess && (
            <p
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
            >
              El nombre se ha actualizado. Tus registros históricos se conservan.
            </p>
          )}

          <form onSubmit={handleAdd} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre (ej. Lectura)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              maxLength={40}
            />
            <ColorPicker selected={color} onSelect={setColor} />
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
              <li key={a.id} className="py-2 text-sm">
                {editingId === a.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <p className="font-medium text-zinc-700">Editar actividad</p>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      maxLength={40}
                      autoFocus
                    />
                    <ColorPicker selected={editColor} onSelect={setEditColor} />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={!editName.trim()}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: a.color }}
                      />
                      {a.name}
                    </span>
                    <span className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(a.id, a.name, a.color)}
                        className="text-zinc-600 hover:text-zinc-900"
                        aria-label={`Editar ${a.name}`}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteActivity(a.id)}
                        className="text-red-600 hover:underline"
                      >
                        Borrar
                      </button>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
