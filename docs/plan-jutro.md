# Plan pracy — Dzień 1: Setup środowiska

> Cel dnia: działające repo z trzema aplikacjami (web + mobile + backend) połączonymi z Supabase i pierwszą migracją bazy danych.

---

## Blok 1 — Monorepo i projekty (ok. 45 min z Claude)

1. Stworzenie repozytorium GitHub `waypause` jako **monorepo** (pnpm workspaces)
2. Inicjalizacja trzech aplikacji:
   - `apps/web` → Next.js 14 (App Router, TypeScript, Tailwind CSS)
   - `apps/mobile` → Expo SDK 51 (TypeScript, expo-router)
   - `apps/api` → NestJS (TypeScript)
3. Wspólny `packages/types` → współdzielone typy TypeScript między web/mobile/api
4. ESLint + Prettier skonfigurowane dla całego monorepo

## Blok 2 — Supabase (ok. 30 min — część ręczna)

Kroki które WYKONUJESZ SAM (Claude nie może tego zrobić za Ciebie):
- [ ] Wejdź na supabase.com → utwórz konto i nowy projekt "waypause"
- [ ] Skopiuj: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
- [ ] W ustawieniach Supabase → Authentication → Providers → włącz Google OAuth
- [ ] Zainstaluj Supabase CLI: `npm install -g supabase`

Resztę (migracje, konfiguracja) Claude zrobi.

## Blok 3 — Schemat bazy danych (ok. 20 min z Claude)

Pierwsza migracja Supabase:
- Tabela `users` (id, email, created_at)
- Tabela `routes` (id, user_id, origin, destination, travel_time_minutes, created_at)
- Tabela `stops` (id, route_id, city, order_index, ai_suggested)
- Tabela `parkings` z PostGIS (location GEOMETRY, name, type, price_per_hour, source, verified)
- Indeksy geospatial na `parkings.location`

## Blok 4 — Rejestracja i logowanie F-1 (ok. 60 min z Claude)

- Ekran `/register` i `/login` w Next.js (web)
- Ekran logowania w Expo (mobile)  
- Supabase Auth: email/hasło + Google OAuth
- NestJS `AuthModule` z `JwtAuthGuard`
- Test: można się zarejestrować, zalogować, JWT działa na chronionym endpoincie

## Blok 5 — GitHub Actions CI (ok. 15 min z Claude)

- Workflow: na każdy PR → lint + type-check
- Workflow: na merge do `main` → auto-deploy Vercel (web)

---

## Czego NIE robimy jutro

- Nie integrujemy Claude API (to Dzień 2–3)
- Nie dotykamy parkingów ani map (to Dzień 3–4)
- Nie instalujemy żadnych dodatkowych paczek bez planu

---

## Zanim zaczniesz jutrzejszą sesję

Przygotuj:
1. Konto GitHub (jeśli nie masz — github.com → Sign up)
2. Konto Supabase (supabase.com → Sign up przez GitHub)
3. Konto Google Cloud (console.cloud.google.com) — potrzebne do Google Maps Key (możemy to zrobić w Dniu 2)
4. Node.js 20 LTS zainstalowany na komputerze — sprawdź: `node --version`
5. pnpm zainstalowany: `npm install -g pnpm`

> _Plan wygenerowany 2026-06-18 · Dzień 1 z budowy Waypause MVP_
