# Plan pracy — Dzień 2: Baza danych i uruchomienie

> Cel dnia: działające środowisko lokalne (web + api), migracja bazy Supabase, Google OAuth, pierwszy test rejestracji.

---

## Blok 0 — Zanim zaczniesz (zrób to sam, bez Claude)

### Zmienne środowiskowe — skopiuj i uzupełnij klucze

1. `apps/api/.env.example` → `apps/api/.env`
   - `SUPABASE_ANON_KEY` — wejdź na supabase.com → projekt → Settings → API → anon/public
   - `SUPABASE_SERVICE_KEY` — tamże → service_role
   - `JWT_SECRET` — wpisz dowolny długi losowy ciąg znaków

2. `apps/web/.env.local.example` → `apps/web/.env.local`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — ten sam anon key co wyżej

3. `apps/mobile/.env.example` → `apps/mobile/.env`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — ten sam anon key co wyżej

### Google OAuth (Supabase)
- Supabase dashboard → Authentication → Providers → Google → włącz
- Potrzebujesz Client ID i Client Secret z Google Cloud Console (console.cloud.google.com)
- W Google Cloud: APIs & Services → Credentials → Create OAuth 2.0 Client ID
- Authorized redirect URI: `https://qiutuicvnolextyjufcr.supabase.co/auth/v1/callback`

---

## Blok 1 — Migracja bazy danych (z Claude, ok. 20 min)

Utworzenie tabel w Supabase:
- `users` (id, email, created_at)
- `routes` (id, user_id, origin, destination, travel_time_minutes, created_at)
- `stops` (id, route_id, city, order_index, ai_suggested)
- `parkings` z PostGIS (location GEOMETRY, name, type, price_per_hour, source, osm_id, verified)
- Indeksy geospatial na `parkings.location`
- Row Level Security (RLS) — użytkownik widzi tylko swoje trasy

## Blok 2 — Uruchomienie lokalne (z Claude, ok. 15 min)

```bash
pnpm dev:web    # http://localhost:3000
pnpm dev:api    # http://localhost:4000
```

Test manualny:
- [ ] Strona główna się ładuje
- [ ] Rejestracja email/hasło działa
- [ ] Logowanie działa
- [ ] `/auth/me` na API zwraca dane zalogowanego użytkownika

## Blok 3 — GitHub Secrets dla CI/CD (z Claude, ok. 10 min)

Dodaj w repozytorium (GitHub → Settings → Secrets and variables → Actions):
- `VERCEL_TOKEN` — z vercel.com → Settings → Tokens
- `VERCEL_ORG_ID` i `VERCEL_PROJECT_ID` — po połączeniu projektu z Vercel

## Blok 4 — Deploy web na Vercel (z Claude, ok. 15 min)

- Połącz repo z Vercel (vercel.com → Import Project → GitHub)
- Ustaw env variables w Vercel (te same co w `.env.local`)
- Pierwszy deploy

---

> _Zaktualizowano 2026-06-23 · Dzień 1 ukończony — monorepo, auth code, CI na GitHub_
