import { ActivityGrid } from "@/components/ActivityGrid";
import { ActivityManager } from "@/components/ActivityManager";

export default function AhoraPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600">
        Toca una actividad para empezar o cambiar. Toca la activa o{" "}
        <strong>Parar</strong> para detener.
      </p>
      <ActivityGrid />
      <ActivityManager />
    </div>
  );
}
