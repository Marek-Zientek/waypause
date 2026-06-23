# Architektura — Waypause

> System klient–serwer: dwa klienty (Next.js web i React Native mobile) komunikują się ze wspólnym REST API (NestJS) opartym na geospatialnej bazie PostgreSQL+PostGIS, z integracją Claude API do sugestii tras i Google Maps Platform do renderowania map.

---

## 1. Przegląd

```
┌─────────────┐     ┌──────────────┐
│  Next.js    │     │ React Native │
│  (web)      │     │  (Expo)      │
└──────┬──────┘     └──────┬───────┘
       │  HTTPS / JWT       │
       └────────┬───────────┘
                │
       ┌────────▼────────┐
       │   NestJS API    │
       │  (REST + auth)  │
       └────────┬────────┘
        ┌───────┼──────────────────┐
        │       │                  │
┌───────▼──┐ ┌──▼──────┐  ┌──────▼──────┐
│PostgreSQL│ │ Claude  │  │ Google Maps │
│+PostGIS  │ │   API   │  │  Platform   │
│(Supabase)│ └─────────┘  └─────────────┘
└──────────┘
```

Supabase dostarcza bazę danych i auth. Zewnętrzne API: Claude (sugestie AI), Google Maps Platform (mapa + routing), Google Places (atrakcje), OpenStreetMap/Overpass (seed parkingów).

---

## 2. Stack technologiczny

| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| Mobile | React Native (Expo SDK 51+) | Jeden codebase → iOS + Android; Expo upraszcza build pipeline i umożliwia OTA updates bez review App Store |
| Web | Next.js 14 (App Router) | SSR dla SEO; PWA support; React — współdzielona logika z mobile; edge caching przez Vercel |
| Backend | NestJS (Node.js, TypeScript) | Moduły NestJS wymuszają czytelną strukturę — ważne gdy cały kod pisze AI; TypeScript end-to-end eliminuje klasę błędów |
| Baza danych | PostgreSQL 15 + PostGIS 3 | PostGIS umożliwia natywne zapytania geospatial (`ST_DWithin`) bez zewnętrznych usług — zero dodatkowych kosztów za "parkingi w promieniu X km" |
| Auth | Supabase Auth | JWT (access + refresh token) out-of-box; Google OAuth gotowy; integruje się z Next.js middleware i Expo |
| AI sugestie | Claude API (`claude-sonnet-4-6`) | Najlepsza jakość rozumowania tras i kontekstu podróży; streaming API poprawia odczuwalną prędkość (F-3) |
| Mapy | Google Maps Platform | Maps JS SDK (web) + Maps SDK Android/iOS (mobile); wymagany do handoff nawigacji (F-6) |
| Atrakcje | Google Places API | Zdjęcia, oceny, godziny otwarcia, kategorie — wymagane w Fazie 2; w MVP dane z Claude |
| Parkingi (seed) | OpenStreetMap (Overpass API) | ≈200 000 miejsc parkingowych w Polsce; dane darmowe; import jednorazowy + tygodniowy delta sync |
| Hosting FE | Vercel | Zero-config deploy Next.js; auto-preview na każdy PR; edge CDN |
| Hosting BE/DB | Supabase (Pro $25/mies.) | Managed PostgreSQL + realtime + storage; darmowy tier na start; skaluje bez ops |
| Reklamy | Google AdMob (mobile) + AdSense (web) | Faza 3; natywna integracja z Expo i Next.js |

---

## 3. Komponenty systemu

### API Gateway (NestJS)
- **Odpowiedzialność:** Główny punkt wejścia dla obu klientów. Routing, autoryzacja JWT (`JwtAuthGuard`), walidacja requestów (`ValidationPipe`), rate limiting
- **Moduły:** `AuthModule`, `RoutesModule`, `StopsModule`, `ParkingsModule`, `AiSuggestionsModule`, `UsersModule`
- **Zależności:** Supabase (DB), Claude API, Google Maps, Google Places, Overpass API
- **Obsługuje:** F-1 → F-7

### AI Suggestions Engine (`AiSuggestionsModule`)
- **Odpowiedzialność:** Analizuje trasę i czas podróży → zwraca propozycję miasta-przystanku z uzasadnieniem (F-3); pobiera TOP 3 atrakcje dla wybranego miasta (F-4 w MVP przez Claude, w Fazie 2 przez Google Places)
- **Przepływ:** `POST /routes/:id/suggest-stops` → buduje prompt z trasą i parametrami → Claude API (streaming) → parsuje JSON z propozycją → cache w Supabase dla popularnych tras
- **Fallback:** Gdy Claude API niedostępny — zwraca 3 największe miasta na trasie wg. odległości z komunikatem "sugestie AI tymczasowo niedostępne"

### Parking Service (`ParkingsModule`)
- **Odpowiedzialność:** Wyszukiwanie parkingów w promieniu (F-5); seed z OSM; w Fazie 2 — przyjmowanie zgłoszeń od użytkowników
- **Kluczowe zapytanie:** `SELECT * FROM parkings WHERE ST_DWithin(location, ST_MakePoint($lng, $lat)::geography, $radius_m) ORDER BY ST_Distance(...)`
- **Zależności:** PostgreSQL+PostGIS

### Maps Integration
- **Odpowiedzialność:** Renderowanie mapy w obu klientach; handoff nawigacji (F-6)
- **Web:** `@googlemaps/js-api-loader` w Next.js Client Component
- **Mobile:** `react-native-maps` z Google Maps provider
- **Handoff (F-6):** Deeplink `https://maps.google.com/maps?daddr=...&waypoints=...` lub `waze://ul?ll=...`

### Auth Module (`AuthModule`)
- **Odpowiedzialność:** Rejestracja, logowanie, odświeżanie tokenów (F-1)
- **Implementacja:** Wrapper na Supabase Auth; NestJS guard weryfikuje JWT na każdy request

---

## 4. Model danych

### `users`
| Pole | Typ | Opis |
|---|---|---|
| id | UUID (PK) | Generowany przez Supabase Auth |
| email | TEXT UNIQUE | Dane osobowe (RODO) |
| created_at | TIMESTAMPTZ | |

### `routes`
| Pole | Typ | Opis |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | Kaskadowe usuwanie przy DELETE user |
| origin | TEXT | Adres/miasto startowe |
| destination | TEXT | Adres/miasto docelowe |
| travel_time_minutes | INTEGER | Deklarowany czas podróży |
| created_at | TIMESTAMPTZ | |

### `stops`
| Pole | Typ | Opis |
|---|---|---|
| id | UUID (PK) | |
| route_id | UUID (FK → routes) | Kaskadowe usuwanie |
| city | TEXT | Miasto przystankowe |
| order_index | INTEGER | Kolejność na trasie |
| ai_suggested | BOOLEAN | Czy zaproponowane przez AI |

### `parkings`
| Pole | Typ | Opis |
|---|---|---|
| id | UUID (PK) | |
| location | GEOMETRY(Point, 4326) | PostGIS — wymagane do zapytań geospatial |
| name | TEXT | Nazwa lub adres |
| type | ENUM('free','paid','street') | Typ parkingu |
| price_per_hour | DECIMAL(8,2) | NULL dla darmowych |
| source | ENUM('osm','user','operator') | Źródło danych |
| osm_id | TEXT | ID z OpenStreetMap (NULL dla user-contributed) |
| verified | BOOLEAN DEFAULT false | Zweryfikowane przez społeczność (aktywne od Fazy 2) |
| created_at | TIMESTAMPTZ | |

**Powiązania:**
- `User` 1—N `Route` → `Route` 1—N `Stop`
- `Stop` ↔ `Parking`: brak FK — parkingi wyszukiwane geospatial na żądanie (nie przechowywane per stop)

**Dane osobowe (RODO):** `users.email` i powiązane `routes` / `stops`. Endpoint `DELETE /me` usuwa kaskadowo wszystkie dane użytkownika.

**Indeksy:**
```sql
CREATE INDEX parkings_location_idx ON parkings USING GIST(location);
CREATE INDEX parkings_type_idx ON parkings(type);
```

---

## 5. Przepływy kluczowe

**Planowanie trasy z AI (F-2 → F-4):**
1. Użytkownik wypełnia formularz (origin, destination, travel_time_minutes) → `POST /routes`
2. API zapisuje route w DB, zwraca `route_id`
3. Klient wywołuje `POST /routes/:id/suggest-stops` (streaming SSE)
4. NestJS buduje prompt: *"Trasa: {origin} → {destination}, czas: {N} minut. Jakie miasto po drodze warto odwiedzić przez 60–120 minut? Zwróć JSON: [{city, reason, detour_minutes}]"*
5. Claude streamuje odpowiedź → klient renderuje tekst na bieżąco (UX: odpowiedź "pojawia się")
6. Użytkownik wybiera miasto → `GET /stops/{city}/attractions?lat=&lng=` (Faza 1: Claude generuje 3 atrakcje; Faza 2: Google Places)
7. Równolegle: `GET /parkings?lat=&lng=&radius=1000` → PostGIS → posortowana lista po odległości
8. Klient łączy atrakcje + parkingi → widok przystanku

**Rejestracja (F-1):**
1. `POST /auth/register` {email, password}
2. Supabase Auth hashuje hasło (bcrypt), tworzy rekord w `users`, zwraca `access_token` (1h) + `refresh_token` (7d)
3. Mobile: tokeny w `expo-secure-store`; Web: `access_token` w memory, `refresh_token` w httpOnly cookie

---

## 6. Uwierzytelnianie i autoryzacja

- **Provider:** Supabase Auth (email/hasło + Google OAuth)
- **Tokeny:** JWT access token (TTL: 1h), refresh token (TTL: 7d)
- **Mobile:** `expo-secure-store` przechowuje oba tokeny; auto-refresh przy wygaśnięciu
- **Web:** access token w pamięci (React state/context); refresh token w httpOnly cookie; Next.js middleware weryfikuje JWT przed renderowaniem chronionych stron
- **Backend guard:** `JwtAuthGuard` (NestJS) na wszystkich endpointach poza `/auth/register` i `/auth/login`
- **Role:** W MVP jedna rola — `user`. Rola `operator` (dla parkingów) wchodzi w Fazie 3.

---

## 7. Integracje zewnętrzne

| Integracja | Cel | Uwagi dotyczące awarii |
|---|---|---|
| Claude API (`claude-sonnet-4-6`) | AI sugestie przystanków (F-3) i atrakcji (F-4 MVP) | Fallback: top 3 miasta na trasie wg. odległości; komunikat w UI |
| Google Maps Platform | Renderowanie mapy, routing wizualny, handoff nawigacji (F-6) | Bez mapy aplikacja traci core UI — monitoring alertów billing obowiązkowy |
| Google Places API | Dane o atrakcjach: zdjęcia, oceny, godziny otwarcia | Faza 2; w MVP atrakcje z Claude |
| Overpass API (OSM) | Seed bazy parkingów — import jednorazowy + delta tygodniowy | Przy niedostępności Overpass: baza działa na ostatnim imporcie |
| Supabase Auth | Rejestracja, logowanie, Google OAuth (F-1) | Supabase SLA 99.9%; obsługa błędów 5xx w warstwie auth |
| Google AdMob / AdSense | Reklamy (Faza 3) | — |

**Klucze API:** Wyłącznie po stronie backendu (NestJS). Klucz Google Maps w kliencie tylko do renderowania mapy — ograniczony po domenach i bundle ID (nie daje dostępu do Places ani Directions API).

---

## 8. Wdrożenie i środowiska

| Środowisko | Web (Next.js) | Backend (NestJS) | Baza (Supabase) |
|---|---|---|---|
| **Lokalne** | `npm run dev` (:3000) | `npm run start:dev` (:4000) | `supabase start` (lokalny Docker) |
| **Staging** | Vercel Preview (auto z każdego PR) | Railway / Render preview | Supabase Branch DB |
| **Produkcja** | Vercel (merge do `main`) | Railway / Render (main) | Supabase Pro |

**CI/CD (GitHub Actions):**
- Na każdy PR: `lint` + `type-check` + testy jednostkowe
- Na merge do `main`: auto-deploy Vercel + `supabase db push` (migracje) + deploy backend

**Zmienne środowiskowe (nigdy w repo):**
```
CLAUDE_API_KEY
GOOGLE_MAPS_KEY
GOOGLE_PLACES_KEY
SUPABASE_URL
SUPABASE_SERVICE_KEY
SUPABASE_ANON_KEY
```
Przechowywane w: Vercel Environment Variables + GitHub Secrets + `.env.local` lokalnie.

---

## 9. Bezpieczeństwo

- **Klucze API:** Wyłącznie w zmiennych środowiskowych backendu; nigdy w repo ani w kodzie klienta
- **Google Maps Key:** Ograniczony po dozwolonych domenach (web) i bundle ID (mobile) — uniemożliwia użycie poza aplikacją
- **Walidacja requestów:** NestJS `ValidationPipe` + `class-validator` na każdym DTO; odrzuca nieoczekiwane pola (`whitelist: true`)
- **Rate limiting:** Endpoint `POST /routes/:id/suggest-stops` ograniczony do 10 req/min/user (Claude jest drogi)
- **RODO:** Endpoint `DELETE /me` usuwa kaskadowo: `users` → `routes` → `stops`. Polityka prywatności obowiązkowa przed publikacją w App Store / Google Play
- **Hasła:** bcrypt przez Supabase Auth (cost factor 12)
- **Transport:** HTTPS wymagany; HSTS header w produkcji

---

## 10. Decyzje architektoniczne i kompromisy

- **NestJS zamiast Express lub Next.js API Routes** — moduły NestJS wymuszają czytelną strukturę kodu gdy cały development prowadzi AI; wyraźna granica między frontendem a backendem chroni klucze API. Kompromis: więcej boilerplate na start.

- **Osobny backend zamiast Next.js Server Actions do wszystkiego** — klucze Claude/Google nigdy nie trafiają do przeglądarki; jeden backend obsługuje web i mobile bez duplikacji logiki. Kompromis: dwie usługi do hostowania zamiast jednej.

- **Supabase zamiast własnego Postgres + własnego auth** — managed DB + auth + storage za $25/mies.; zero ops na start. Kompromis: zależność od jednego dostawcy; vendor lock-in jest akceptowalny przy tym budżecie i braku zespołu DevOps.

- **PostGIS zamiast zewnętrznego Geo API (np. Mapbox Geocoding)** — zapytania "parkingi w promieniu X km" są natywne w PostGIS; brak kosztu per-query. Kompromis: migracja schematu przy zmianie DB jest droższa.

- **Expo zamiast natywnego React Native** — OTA updates (poprawki bez review App Store), uproszczony build pipeline, szybszy start. Kompromis: niektóre natywne moduły wymagają Expo Bare Workflow lub EAS Build.

- **Claude Sonnet zamiast Haiku** — jakość sugestii tras jest kluczowym differentiator aplikacji; Haiku jest tańszy, ale gorzej rozumuje kontekst geograficzny. Do rewizji przy skalowaniu kosztów.

---

## 11. Otwarte kwestie

- ⚠️ **Do ustalenia przed startem modułu AI:** Format i język promptów dla Claude API (system prompt, schemat odpowiedzi JSON, obsługa edge cases — trasa A=B, zbyt krótki czas)
- ⚠️ **Do ustalenia w Fazie 1:** Czy cache popularnych tras (np. Redis przez Upstash) od razu, czy dopiero gdy billing Claude stanie się problemem przy skalowaniu?
- ⚠️ **Do ustalenia przed Fazą 2:** Schemat moderacji crowdsourcingu parkingów — automatyczna weryfikacja (N potwierdzeń) czy panel admina?

---

> _Dokument wygenerowany 2026-06-18 · status: szkic do akceptacji_
