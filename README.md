# Auditor de tiempo manual

App web para registrar manualmente en qué actividades gastas el tiempo.

## Requisitos

- Node.js 18+
- Proyecto en [Supabase](https://supabase.com)

## Variables de entorno

Copia `.env.local.example` a `.env.local` y rellena los valores de tu proyecto Supabase.

## Fase 2 — Base de datos

Ejecuta el SQL de `supabase/schema.sql` en el SQL Editor de Supabase (tablas + RLS).

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — te redirigirá a login si no hay sesión.
