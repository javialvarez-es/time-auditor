import type { SupabaseClient } from "@supabase/supabase-js";
import { mapActivity, mapSession } from "@/lib/supabase/mappers";
import type { Activity, Session } from "@/lib/types";
import { toUtcIso } from "@/lib/time";

export async function fetchActivities(
  supabase: SupabaseClient,
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("id, user_id, name, color, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapActivity);
}

export async function fetchSessions(
  supabase: SupabaseClient,
): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("id, user_id, activity_id, started_at, ended_at")
    .order("started_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapSession);
}

/** Solo inserta actividades por defecto la primera vez (función atómica en Supabase). */
export async function ensureDefaultActivities(
  supabase: SupabaseClient,
): Promise<void> {
  const { error } = await supabase.rpc("seed_default_activities");
  if (error) throw error;
}

export async function tapActivityDb(
  supabase: SupabaseClient,
  userId: string,
  activityId: string,
): Promise<void> {
  const now = toUtcIso();

  const { data: active, error: activeError } = await supabase
    .from("sessions")
    .select("id, activity_id")
    .eq("user_id", userId)
    .is("ended_at", null)
    .maybeSingle();

  if (activeError) throw activeError;

  if (!active) {
    const { error } = await supabase.from("sessions").insert({
      user_id: userId,
      activity_id: activityId,
      started_at: now,
    });
    if (error) throw error;
    return;
  }

  if (active.activity_id === activityId) {
    const { error } = await supabase
      .from("sessions")
      .update({ ended_at: now })
      .eq("id", active.id);
    if (error) throw error;
    return;
  }

  const { error: closeError } = await supabase
    .from("sessions")
    .update({ ended_at: now })
    .eq("id", active.id);
  if (closeError) throw closeError;

  const { error: openError } = await supabase.from("sessions").insert({
    user_id: userId,
    activity_id: activityId,
    started_at: now,
  });
  if (openError) throw openError;
}

export async function stopActiveDb(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const now = toUtcIso();

  const { data: active, error: activeError } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", userId)
    .is("ended_at", null)
    .maybeSingle();

  if (activeError) throw activeError;
  if (!active) return;

  const { error } = await supabase
    .from("sessions")
    .update({ ended_at: now })
    .eq("id", active.id);
  if (error) throw error;
}

export async function addActivityDb(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  color: string,
): Promise<void> {
  const { error } = await supabase.from("activities").insert({
    user_id: userId,
    name: name.trim(),
    color,
  });
  if (error) throw error;
}

export async function deleteActivityDb(
  supabase: SupabaseClient,
  activityId: string,
): Promise<void> {
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);
  if (error) throw error;
}
