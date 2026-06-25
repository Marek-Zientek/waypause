import { createClient } from './supabase';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Brak sesji');
  return session.access_token;
}

export interface Suggestion {
  city: string;
  reason: string;
  detour_minutes: number;
  visit_duration_minutes: number;
}

export async function suggestStops(routeId: string): Promise<Suggestion[]> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/routes/${routeId}/suggest-stops`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = (await res.json()) as { suggestions: Suggestion[] };
  return data.suggestions;
}
