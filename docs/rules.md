# Zasady projektu — Waypause

> Ten plik zbiera zasady dla asystenta AI (Claude) pracującego nad kodem projektu. Właściciel projektu nie ma tła technicznego — Claude podejmuje wszystkie decyzje techniczne i powinien wyjaśniać je prostym językiem.

---

## Część 1 — Zasady dla asystenta AI (Claude)

### Kontekst przed każdą sesją

Przed rozpoczęciem pracy zawsze przejrzyj:
- `docs/prd.md` — co budujemy, dla kogo, jakie funkcje (F-1 → F-7)
- `docs/architecture.md` — stack, model danych, decyzje architektoniczne
- Ten plik — konwencje i ograniczenia

Właściciel nie ma tła technicznego. Każdą decyzję techniczną wyjaśniaj w jednym zdaniu prostym językiem. Nie stosuj skrótów bez rozwinięcia przy pierwszym użyciu.

### Konwencje kodu

- **Język kodu:** TypeScript (strict mode) wszędzie — backend (NestJS) i frontend (Next.js, React Native)
- **Nazwy:** zmienne, funkcje, klasy, pliki — angielski, camelCase (np. `suggestStops`, `parkingService`)
- **Komentarze:** polskie, tylko gdy "dlaczego" jest nieoczywiste — nigdy "co robi ten kod"
- **Formatowanie:** Prettier (konfiguracja w repo, 2 spacje, single quotes, trailing commas)
- **Linter:** ESLint z regułami dla TypeScript; kod musi przejść lint bez błędów

**Struktura backendu (NestJS) — jeden moduł na domenę:**
```
src/
  auth/         auth.module.ts, auth.controller.ts, auth.service.ts, dto/
  routes/       routes.module.ts, routes.controller.ts, routes.service.ts, dto/
  stops/        ...
  parkings/     ...
  ai-suggestions/ ...
  users/        ...
```

**Struktura frontendu (Next.js App Router):**
```
app/
  (auth)/       login, register
  (app)/        dashboard, routes, parkings
  api/          tylko thin proxy jeśli absolutnie konieczne (logika w NestJS)
components/     współdzielone komponenty UI
lib/            utils, api client, hooks
```

**React Native (Expo):**
```
app/            expo-router screens
components/
lib/            współdzielone z Next.js gdzie możliwe
```

### Testy

- **Framework:** Vitest (backend NestJS) + Jest (React Native)
- **Co testować:** Serwisy (logika biznesowa), nie kontrolery. W szczególności:
  - `AiSuggestionsService` — parsowanie odpowiedzi Claude, fallback przy awarii
  - `ParkingsService` — zapytania geospatial (z mockiem PostGIS)
- **Coverage:** Serwisy > 70% pokrycia linii
- **Kiedy:** Każda nowa funkcja publiczna serwisu ma co najmniej jeden test jednostkowy

### Czego NIE robić bez pytania właściciela

- Nie dodawaj nowych npm packages — każda nowa zależność to decyzja do omówienia
- Nie zmieniaj schematu bazy danych bez tworzenia migracji Supabase (`supabase migration new`)
- Nie commituj żadnych kluczy API, haseł ani sekretów — nawet w komentarzach
- Nie implementuj funkcji z Fazy 2, 3 ani 4 podczas pracy nad Fazą 1 MVP
- Nie modyfikuj `docs/prd.md` ani `docs/architecture.md` bez wyraźnej prośby
- Nie używaj `any` w TypeScript — zawsze prawidłowy typ lub `unknown`

### Zasady pracy z AI (Claude API)

- Prompty do Claude API trzymaj w osobnym pliku `src/ai-suggestions/prompts.ts` — nie inline w serwisie
- Odpowiedź Claude musi być walidowana przez Zod schema przed użyciem
- Zawsze implementuj fallback gdy Claude zwróci błąd (patrz `docs/architecture.md` sekcja 5)
- Rate limiting na endpointy wywołujące Claude — 10 req/min/user

### Bezpieczeństwo — zasady bezwzględne

- Klucze API wyłącznie w zmiennych środowiskowych backendu (`.env.local`, Vercel Env Vars)
- Google Maps Key w kliencie: ograniczony po domenach i bundle ID — nigdy pełny klucz serwisowy
- Wszystkie dane od użytkownika przechodzą przez NestJS `ValidationPipe` z `whitelist: true`
- Endpoint `DELETE /me` musi kasować kaskadowo wszystkie dane użytkownika (RODO)

---

## Część 2 — Git i workflow

### Nazewnictwo gałęzi

```
feature/F-1-auth          # nowa funkcja (F-N z PRD)
feature/F-3-ai-suggestions
fix/parking-geospatial    # naprawa błędu
faza2/crowdsourcing       # praca nad kolejną fazą
chore/eslint-config       # konfiguracja, dev-tooling
```

### Format commitów

```
feat(F-1): dodaj rejestrację email i hasło
feat(F-3): zintegruj Claude API do sugestii tras
fix(F-5): napraw zapytanie PostGIS dla promienia > 5km
chore: dodaj ESLint + Prettier config
db: migracja — dodaj kolumnę parkings.verified
```

Jeden commit = jedna logicznie zamknięta zmiana. Migracje DB w oddzielnych commitach.

### Definition of Done

Zadanie jest ukończone gdy:
- Kod przechodzi `tsc --noEmit` (TypeScript bez błędów)
- Kod przechodzi ESLint bez błędów ani ostrzeżeń
- Nowa funkcja serwisu ma co najmniej jeden test jednostkowy
- Nowy endpoint API ma walidację requestu (NestJS DTO + ValidationPipe)
- Nowe zmienne środowiskowe są dodane do `.env.example` (bez wartości, z komentarzem co to jest)
- Zmiany schematu DB mają migrację Supabase

---

> _Dokument wygenerowany 2026-06-18 · status: szkic do akceptacji_
