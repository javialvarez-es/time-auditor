/** Duración en milisegundos entre dos instantes ISO (UTC). */
export function durationMs(
  startedAt: string,
  endedAt: string | null,
  now: Date = new Date(),
): number {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : now.getTime();
  return Math.max(0, end - start);
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}min`;
}

/** Cronómetro en vivo (horas:minutos:segundos). */
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

/** Inicio del día en hora local (para filtros del resumen). */
export function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Lunes 00:00 de la semana que contiene `date` (hora local). */
export function startOfLocalWeek(date: Date): Date {
  const d = startOfLocalDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** YYYY-MM-DD en calendario local. */
export function localDateKeyFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** YYYY-MM-DD en calendario local (para agrupar sesiones por día de inicio). */
export function localDateKey(isoUtc: string): string {
  return localDateKeyFromDate(new Date(isoUtc));
}

export function formatClockLocal(isoUtc: string): string {
  return new Date(isoUtc).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Rango de semana para el encabezado del calendario (ej. "26 may – 1 jun"). */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(startOfLocalDay(weekStart), 6);
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  const startStr = weekStart.toLocaleDateString(undefined, opts);
  const endStr = weekEnd.toLocaleDateString(undefined, opts);
  return `${startStr} – ${endStr}`;
}

/** Día corto para cabecera de columna (ej. "lun"). */
export function formatShortWeekday(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function toUtcIso(date: Date = new Date()): string {
  return date.toISOString();
}

/** Combina fecha y hora en calendario local → ISO UTC. */
export function localDateTimeToUtcIso(
  dateKey: string,
  timeHHMM: string,
): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [h, min] = timeHHMM.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0).toISOString();
}

/** HH:mm en hora local a partir de un instante UTC. */
export function utcIsoToLocalTimeHHMM(isoUtc: string): string {
  const d = new Date(isoUtc);
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}
