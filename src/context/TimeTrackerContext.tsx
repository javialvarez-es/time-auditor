"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getActiveSession } from "@/lib/session-logic";
import { createClient } from "@/lib/supabase/client";
import {
  addActivityDb,
  addManualSessionDb,
  deleteActivityDb,
  deleteSessionDb,
  updateActivityDb,
  updateSessionDb,
  ensureDefaultActivities,
  fetchActivities,
  fetchSessions,
  stopActiveDb,
  tapActivityDb,
} from "@/lib/tracker-db";
import type { Activity, Session } from "@/lib/types";

type TimeTrackerContextValue = {
  activities: Activity[];
  sessions: Session[];
  activeSession: Session | null;
  loading: boolean;
  error: string | null;
  tapActivity: (activityId: string) => Promise<void>;
  stop: () => Promise<void>;
  addActivity: (name: string, color: string) => Promise<void>;
  updateActivity: (
    activityId: string,
    name: string,
    color: string,
  ) => Promise<boolean>;
  deleteActivity: (activityId: string) => Promise<void>;
  addManualSession: (
    activityId: string,
    startedAt: string,
    endedAt: string,
  ) => Promise<boolean>;
  updateSession: (
    sessionId: string,
    activityId: string,
    startedAt: string,
    endedAt: string,
  ) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const TimeTrackerContext = createContext<TimeTrackerContextValue | null>(null);

export function TimeTrackerProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadGenerationRef = useRef(0);

  const activeSession = useMemo(
    () => getActiveSession(sessions),
    [sessions],
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [acts, sess] = await Promise.all([
      fetchActivities(supabase),
      fetchSessions(supabase),
    ]);
    setActivities(acts);
    setSessions(sess);
  }, [supabase, userId]);

  useEffect(() => {
    let cancelled = false;

    async function loadUserData(user: User) {
      const generation = ++loadGenerationRef.current;
      setLoading(true);
      setError(null);
      setUserId(user.id);

      try {
        await ensureDefaultActivities(supabase);
        const [acts, sess] = await Promise.all([
          fetchActivities(supabase),
          fetchSessions(supabase),
        ]);
        if (cancelled || generation !== loadGenerationRef.current) return;
        setActivities(acts);
        setSessions(sess);
      } catch (e) {
        if (cancelled || generation !== loadGenerationRef.current) return;
        setError(
          e instanceof Error ? e.message : "Error al cargar los datos",
        );
      } finally {
        if (!cancelled && generation === loadGenerationRef.current) {
          setLoading(false);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadUserData(session.user);
        return;
      }

      loadGenerationRef.current += 1;
      setUserId(null);
      setActivities([]);
      setSessions([]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const runMutation = useCallback(
    async (fn: () => Promise<void>) => {
      if (!userId) return;
      setError(null);
      try {
        await fn();
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    },
    [userId, refresh],
  );

  const handleTap = useCallback(
    (activityId: string) =>
      runMutation(() => tapActivityDb(supabase, userId!, activityId)),
    [runMutation, supabase, userId],
  );

  const handleStop = useCallback(
    () => runMutation(() => stopActiveDb(supabase, userId!)),
    [runMutation, supabase, userId],
  );

  const addActivity = useCallback(
    (name: string, color: string) => {
      const trimmed = name.trim();
      if (!trimmed || !userId) return Promise.resolve();
      return runMutation(() =>
        addActivityDb(supabase, userId, trimmed, color),
      );
    },
    [runMutation, supabase, userId],
  );

  const updateActivity = useCallback(
    async (activityId: string, name: string, color: string) => {
      const trimmed = name.trim();
      if (!trimmed || !userId) return false;
      setError(null);
      try {
        await updateActivityDb(supabase, activityId, trimmed, color);
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
        return false;
      }
    },
    [supabase, userId, refresh],
  );

  const deleteActivity = useCallback(
    (activityId: string) =>
      runMutation(() => deleteActivityDb(supabase, activityId)),
    [runMutation, supabase],
  );

  const addManualSession = useCallback(
    async (activityId: string, startedAt: string, endedAt: string) => {
      if (!userId) return false;
      setError(null);
      try {
        await addManualSessionDb(
          supabase,
          userId,
          activityId,
          startedAt,
          endedAt,
        );
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
        return false;
      }
    },
    [supabase, userId, refresh],
  );

  const updateSession = useCallback(
    async (
      sessionId: string,
      activityId: string,
      startedAt: string,
      endedAt: string,
    ) => {
      if (!userId) return false;
      setError(null);
      try {
        await updateSessionDb(
          supabase,
          sessionId,
          activityId,
          startedAt,
          endedAt,
        );
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
        return false;
      }
    },
    [supabase, userId, refresh],
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!userId) return false;
      setError(null);
      try {
        await deleteSessionDb(supabase, sessionId);
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
        return false;
      }
    },
    [supabase, userId, refresh],
  );

  const value = useMemo(
    () => ({
      activities,
      sessions,
      activeSession,
      loading,
      error,
      tapActivity: handleTap,
      stop: handleStop,
      addActivity,
      updateActivity,
      deleteActivity,
      addManualSession,
      updateSession,
      deleteSession,
      refresh,
    }),
    [
      activities,
      sessions,
      activeSession,
      loading,
      error,
      handleTap,
      handleStop,
      addActivity,
      updateActivity,
      deleteActivity,
      addManualSession,
      updateSession,
      deleteSession,
      refresh,
    ],
  );

  return (
    <TimeTrackerContext.Provider value={value}>
      {children}
    </TimeTrackerContext.Provider>
  );
}

export function useTimeTracker() {
  const ctx = useContext(TimeTrackerContext);
  if (!ctx) {
    throw new Error("useTimeTracker debe usarse dentro de TimeTrackerProvider");
  }
  return ctx;
}
