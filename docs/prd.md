# PRD — Waypause

> Waypause to polska aplikacja web+mobile dla kierowców, która jako jedyna łączy wielopunktowe planowanie trasy z AI-sugestiami atrakcji i wyszukiwarką parkingów przy każdym przystanku.

---

## 1. Kontekst i problem

Polscy kierowcy planujący podróż z przystankami muszą dziś żonglować kilkoma aplikacjami: Yanosik nawiguje, ale nie planuje trasy wielopunktowej. Google Maps planuje, ale nie podpowiada aktywnie co warto zobaczyć po drodze. Żadna aplikacja nie pokazuje parkingów przy konkretnych atrakcjach. Efekt: użytkownik albo jedzie "na przełaj" i mija ciekawe miejsca, albo spędza godziny na researchu przed wyjazdem.

Waypause rozwiązuje to w jednym flow: wpisujesz skąd i dokąd, AI analizuje trasę i mówi "masz 2h rezerwy — w Bydgoszczy warto zajrzeć do X, parking tuż obok".

---

## 2. Cele projektu

- Zbudować pierwszą polską aplikację łączącą planowanie trasy + AI-sugestie atrakcji + parkingi
- Osiągnąć **5 000 zaplanowanych tras miesięcznie** w ciągu roku od launchu
- Zbudować społecznościową bazę parkingów jako trwałą przewagę (Faza 2)
- Uruchomić model przychodowy z reklam przed wyczerpaniem budżetu startowego (Faza 3)

### Miary sukcesu

| Miara | Rok 1 |
|---|---|
| Zaplanowane trasy / miesiąc | 5 000 |
| Retencja 30-dniowa (DAU/MAU) | > 20% |
| NPS | > 40 |
| Baza parkingów PL (Faza 2) | 50 000 zweryfikowanych miejsc |

---

## 3. Użytkownicy

| Grupa | Kim jest | Główna potrzeba |
|---|---|---|
| **Kierowca-odkrywca** *(główna)* | 25–55 lat, planuje wyjazdy weekendowe lub urlopowe samochodem | Jedna aplikacja zamiast trzech, konkretne sugestie co zobaczyć po drodze |
| Rodzina na trasie | Para/rodzina z dziećmi, potrzebuje parkingów przy atrakcjach familijnych | Bezpieczny parking blisko atrakcji, bez szukania na miejscu |
| Operator parkingu *(Faza 3)* | Właściciel płatnego parkingu w Polsce | Widoczność w aplikacji, rezerwacje online |

---

## 4. Zakres MVP — funkcje

| ID | Funkcja | Opis | Priorytet |
|---|---|---|---|
| F-1 | Rejestracja i logowanie | Email + hasło; logowanie przez Google (OAuth) | must-have |
| F-2 | Planowanie trasy | Formularz: skąd / dokąd / deklarowany czas podróży | must-have |
| F-3 | AI-sugestia przystanku | Claude API analizuje trasę i czas → proponuje miasto(-a) do zatrzymania z uzasadnieniem | must-have |
| F-4 | Widok przystanku | TOP 3 atrakcje w mieście-przystanku + lista parkingów w pobliżu każdej | must-have |
| F-5 | Wyszukiwarka parkingów | Parkingi z bazy OSM; filtry: darmowy / płatny / uliczny; promień w km | must-have |
| F-6 | Trasa finalna z nawigacją | Podsumowanie trasy z przystankami; przycisk "Nawiguj" otwiera Google Maps lub Waze | must-have |
| F-7 | Historia tras | Lista poprzednich tras zalogowanego użytkownika; możliwość ponownego użycia | nice-to-have |

---

## 5. Ścieżki użytkownika

**Główny scenariusz — planowanie trasy z przystankiem:**

1. Użytkownik otwiera aplikację → loguje się (F-1)
2. Ekran główny: wpisuje "Skąd?" i "Dokąd?" → zaznacza "Chcę się zatrzymać po drodze"
3. Suwak czasu: "Ile masz łącznie czasu?" (4h / 6h / 8h / bez limitu)
4. AI (F-3) analizuje trasę → wyświetla propozycję: "Masz 90 min rezerwy — warto zajrzeć do Bydgoszczy lub Torunia"
5. Użytkownik wybiera miasto → widok przystanku (F-4): mapa + TOP 3 atrakcje + parkingi przy każdej
6. Użytkownik zatwierdza przystanek → trasa finalna (F-6) z pełną mapą
7. "Nawiguj" → deeplink do Google Maps / Waze z wszystkimi punktami

**Scenariusz — szukanie parkingu bez planowania trasy:**

1. Ekran główny → zakładka "Parkingi" → wyszukiwarka (F-5)
2. Miasto + promień → mapa z pinezkami parkingów (kolor: zielony=darmowy, pomarańczowy=płatny, szary=uliczny)
3. Klik w pinezkę → szczegóły: typ, cena, odległość, źródło danych

---

## 6. Poza zakresem MVP

- Crowdsourcing parkingów przez użytkowników (→ Faza 2)
- System ocen i komentarzy do parkingów i atrakcji (→ Faza 2)
- Google Places API (wzbogacone zdjęcia i oceny atrakcji) (→ Faza 2)
- Reklamy AdMob / AdSense (→ Faza 3)
- Panel operatorów parkingów i model prowizyjny (→ Faza 3)
- Personalizacja AI (profil: rodzina z dziećmi, senior itp.) (→ Faza 4)
- Historia tras i "odkryj spontanicznie" AI (→ Faza 4)
- Offline mapy
- Angielska wersja językowa
- Rezerwacja parkingów online
- Powiadomienia push

---

## 7. Wymagania pozafunkcjonalne

- **Język:** Polski (jedyny język MVP)
- **Platformy:** iOS 16+, Android 11+; przeglądarka: Chrome / Safari / Firefox (2 ostatnie wersje)
- **Wydajność:** Odpowiedź AI (F-3) < 5 s (streaming); ładowanie mapy < 2 s na LTE
- **RODO:** Dane osobowe — email i historia tras. Wymagana polityka prywatności. Endpoint usunięcia konta kasuje kaskadowo wszystkie dane użytkownika
- **GPS:** Opcjonalny (do auto-uzupełniania pola "Skąd?"); aplikacja działa bez zgody na lokalizację

---

## 8. Ryzyka i otwarte pytania

- ⚠️ **Jakość danych OSM** — parkingi w mniejszych miastach mogą być niekompletne; mitygacja: jasna informacja w UI "dane z OpenStreetMap, mogą być nieaktualne" + crowdsourcing od Fazy 2
- ⚠️ **Koszt Claude API przy skalowaniu** — przy 5 000 tras/mies. koszt OK (~$50); przy 50 000 wymaga cache'owania popularnych tras
- ⚠️ **Cold start** — bez dużej bazy parkingów wartość F-5 jest ograniczona; import OSM (≈200 000 miejsc PL) rozwiązuje start
- ⚠️ **Google Maps billing** — $200/mies. darmowy limit; monitoring od dnia 1 (alerty budżetowe w Google Cloud)
- ⚠️ **Do ustalenia:** Format i język promptów dla Claude API przed startem kodowania modułu AI

---

## 9. Plany na przyszłość

**Faza 2 — Społeczność i jakość danych**
- Formularz dodawania parkingu przez użytkownika
- Weryfikacja społecznościowa (głosowanie + moderacja)
- Google Places API (zdjęcia, oceny, godziny otwarcia atrakcji)
- Oceny i komentarze do parkingów

**Faza 3 — Monetyzacja**
- Google AdMob (mobile) + AdSense (web)
- Panel operatora parkingu (zarządzanie cennikiem)
- Model prowizyjny od rezerwacji

**Faza 4 — AI i personalizacja**
- Profil podróżnika (rodzina z dziećmi → atrakcje familijne; senior → wolne tempo)
- "Odkryj spontanicznie" — AI planuje całą trasę od zera
- Powiadomienia push: "Za 30 min Bydgoszcz — zarezerwuj parking?"
- Historia tras z możliwością ponownego użycia i udostępniania

---

> _Dokument wygenerowany 2026-06-18 · status: szkic do akceptacji_
