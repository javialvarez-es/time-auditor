"use client";

import { useState } from "react";
import { useTimeTracker } from "@/context/TimeTrackerContext";
import { validateManualSession } from "@/lib/session-manual";
import {
  localDateKeyFromDate,
  localDateTimeToUtcIso,
  utcIsoToLocalTimeHHMM,
} from "@/lib/time";
import type { Activity, Session } from "@/lib/types";

type Props = {
  mode: "add" | "edit";
  session?: Session;
  defaultDateKey: string;
  activities: Activity[];
  onClose: () => void;
};

const inputClass =
  "w-full rounded-xl border border-zinc-300 px-4 py-3 text-base";

export function SessionFormModal({
  mode,
  session,
  defaultDateKey,
  activities,
  onClose,
}: Props) {
  const {
    activeSession,
    addManualSession,
    updateSession,
    deleteSession,
  } = useTimeTracker();

  const initialEnd =
    session?.endedAt ?? new Date().toISOString();

  const [activityId, setActivityId] = useState(
    session?.activityId ?? activities[0]?.id ?? "",
  );
  const [dateKey, setDateKey] = useState(
    session
      ? localDateKeyFromDate(new Date(session.startedAt))
      : defaultDateKey,
  );
  const [startTime, setStartTime] = useState(
    session ? utcIsoToLocalTimeHHMM(session.startedAt) : "09:00",
  );
  const [endTime, setEndTime] = useState(
    session ? utcIsoToLocalTimeHHMM(initialEnd) : "10:00",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [formWarn, setFormWarn] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormWarn(null);

    if (!activityId) {
      setFormError("Selecciona una actividad.");
      return;
    }
    if (!dateKey || !startTime || !endTime) {
      setFormError("La fecha y ambas horas son obligatorias.");
      return;
    }

    const startedAt = localDateTimeToUtcIso(dateKey, startTime);
    const endedAt = localDateTimeToUtcIso(dateKey, endTime);

    const validation = validateManualSession(
      startedAt,
      endedAt,
      activeSession,
      mode === "edit" ? session?.id : undefined,
    );

    if (!validation.valid) {
      setFormError(validation.error ?? "Datos no válidos.");
      return;
    }
    if (validation.warn) setFormWarn(validation.warn);

    setSaving(true);
    const ok =
      mode === "add"
        ? await addManualSession(activityId, startedAt, endedAt)
        : await updateSession(
            session!.id,
            activityId,
            startedAt,
            endedAt,
          );
    setSaving(false);

    if (ok) onClose();
  }

  async function handleDelete() {
    if (!session) return;
    setSaving(true);
    const ok = await deleteSession(session.id);
    setSaving(false);
    if (ok) onClose();
  }

  const title =
    mode === "add" ? "Añadir sesión" : "Editar sesión";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2
            id="session-modal-title"
            className="text-lg font-semibold text-zinc-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>

        {confirmDelete ? (
          <div className="space-y-4">
            <p className="text-base text-zinc-700">
              ¿Seguro que quieres eliminar esta sesión? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleDelete()}
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-base font-medium text-white disabled:opacity-40"
              >
                Sí, eliminar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmDelete(false)}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base font-medium text-zinc-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-zinc-700">
                Actividad
              </span>
              <select
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                className={inputClass}
                required
              >
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-zinc-700">Fecha</span>
              <input
                type="date"
                value={dateKey}
                onChange={(e) => setDateKey(e.target.value)}
                className={inputClass}
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-zinc-700">
                  Hora de inicio
                </span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-zinc-700">
                  Hora de fin
                </span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </label>
            </div>

            {formError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}
            {formWarn && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {formWarn}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !activities.length}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-base font-medium text-white disabled:opacity-40"
            >
              {mode === "add" ? "Añadir sesión" : "Guardar cambios"}
            </button>

            {mode === "edit" && (
              <div className="border-t border-zinc-200 pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-base font-medium text-red-700"
                >
                  Eliminar sesión
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
