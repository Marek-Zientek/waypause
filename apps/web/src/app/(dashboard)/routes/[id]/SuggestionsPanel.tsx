'use client';

import { useState } from 'react';
import { suggestStops, type Suggestion } from '@/lib/api';

export default function SuggestionsPanel({ routeId }: { routeId: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSuggest() {
    setError('');
    setLoading(true);
    try {
      const result = await suggestStops(routeId);
      setSuggestions(result);
      setDone(true);
    } catch {
      setError('Nie udało się pobrać sugestii. Sprawdź czy API jest uruchomione.');
    } finally {
      setLoading(false);
    }
  }

  if (done && suggestions.length > 0) {
    return (
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
          Proponowane przystanki
        </h2>
        {suggestions.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-lg">{s.city}</span>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {s.detour_minutes > 0 && (
                  <span>+{s.detour_minutes} min odchylenia</span>
                )}
                <span>{s.visit_duration_minutes} min zwiedzania</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{s.reason}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
      <div>
        <p className="text-gray-500 text-sm">
          Kliknij, żeby AI zaproponowało ciekawe miejsca po drodze.
        </p>
      </div>
      <button
        onClick={handleSuggest}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI analizuje trasę…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.47 3.47 0 00-1.017 2.45V21H9.25v-.604a3.47 3.47 0 00-1.017-2.45l-.347-.347z" />
            </svg>
            Zaproponuj przystanek
          </>
        )}
      </button>
    </div>
  );
}
