"use client";

import { AppNav } from "@/components/AppNav";
import { LogoutButton } from "@/components/LogoutButton";
import { useTimeTracker } from "@/context/TimeTrackerContext";

export function TrackerShell({ children }: { children: React.ReactNode }) {
  const { loading, error } = useTimeTracker();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
      <header className="mb-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-zinc-900">
            Auditor de tiempo
          </h1>
          <LogoutButton />
        </div>
        <AppNav />
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Cargando…</p>
      ) : (
        <main className="flex-1">{children}</main>
      )}
    </div>
  );
}
