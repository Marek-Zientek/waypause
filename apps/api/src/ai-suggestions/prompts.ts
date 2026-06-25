export const SYSTEM_PROMPT = `Jesteś asystentem planowania podróży samochodem po Polsce. \
Pomagasz kierowcom znaleźć interesujące miejsca na trasie. \
Odpowiadasz wyłącznie po polsku. \
Zwracasz wyłącznie poprawny JSON — bez żadnego tekstu przed ani po, bez bloków kodu markdown.`;

export function buildUserPrompt(
  origin: string,
  destination: string,
  travelTimeMinutes: number | null,
): string {
  const timeInfo =
    travelTimeMinutes != null
      ? `Deklarowany czas podróży: ${travelTimeMinutes} minut`
      : 'Czas podróży: bez limitu';

  return `Trasa: ${origin} → ${destination}
${timeInfo}

Zaproponuj 2–3 miasta, w których warto się zatrzymać po drodze (leżące między ${origin} a ${destination} lub z małym odchyleniem).

Dla każdego miasta zwróć:
- city: nazwa miasta
- reason: dlaczego warto się tam zatrzymać (1–2 zdania, konkretna atrakcja lub charakter miejsca)
- detour_minutes: szacowany czas odchylenia od trasy głównej (0 jeśli miasto leży na trasie)
- visit_duration_minutes: rekomendowany czas zwiedzania w minutach

Odpowiedz wyłącznie JSON-em w formacie:
[{"city":"...","reason":"...","detour_minutes":0,"visit_duration_minutes":60}]`;
}
