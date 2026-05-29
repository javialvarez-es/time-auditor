"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    authError ? "error" : "idle",
  );
  const [message, setMessage] = useState(
    authError
      ? "No se pudo completar el inicio de sesión. Pide un enlace nuevo."
      : "",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage(
      "Te hemos enviado un enlace por email. Ábrelo en este mismo dispositivo para entrar.",
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Auditor de tiempo
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Entra con tu email. Te enviaremos un enlace mágico (sin contraseña).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {status === "loading" ? "Enviando…" : "Enviar enlace"}
        </button>
      </form>

      {message && (
        <p
          className={`text-sm ${
            status === "error" ? "text-red-600" : "text-zinc-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
