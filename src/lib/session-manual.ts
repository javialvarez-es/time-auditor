import type { Session } from "./types";

export type ManualSessionValidation = {
  valid: boolean;
  error?: string;
  warn?: string;
};

/** Comprueba fin > inicio y solape con sesión activa (solo aviso, no bloquea). */
export function validateManualSession(
  startedAtUtc: string,
  endedAtUtc: string,
  activeSession: Session | null,
  excludeSessionId?: string,
  now: Date = new Date(),
): ManualSessionValidation {
  const startMs = new Date(startedAtUtc).getTime();
  const endMs = new Date(endedAtUtc).getTime();

  if (endMs <= startMs) {
    return {
      valid: false,
      error: "La hora de fin debe ser posterior a la hora de inicio.",
    };
  }

  if (
    activeSession &&
    activeSession.id !== excludeSessionId &&
    activeSession.endedAt === null
  ) {
    const activeStart = new Date(activeSession.startedAt).getTime();
    const activeEnd = now.getTime();
    if (startMs < activeEnd && endMs > activeStart) {
      return {
        valid: true,
        warn: "Hay una sesión en curso en este intervalo. Puedes guardar igualmente.",
      };
    }
  }

  return { valid: true };
}
