import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

type Route = {
  id: string;
  origin: string;
  destination: string;
  travel_time_minutes: number | null;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: routes } = await supabase
    .from('routes')
    .select('id, origin, destination, travel_time_minutes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  async function signOut() {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moje trasy</h1>
            <p className="mt-0.5 text-sm text-gray-400">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/routes/new"
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              + Nowa trasa
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                Wyloguj
              </button>
            </form>
          </div>
        </div>

        {routes && routes.length > 0 ? (
          <ul className="space-y-3">
            {routes.map((route: Route) => (
              <li key={route.id}>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <span className="truncate">{route.origin}</span>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="truncate">{route.destination}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      {route.travel_time_minutes && (
                        <span>{route.travel_time_minutes} min</span>
                      )}
                      <span>
                        {new Date(route.created_at).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">Nie masz jeszcze żadnych tras.</p>
            <Link
              href="/routes/new"
              className="mt-4 inline-block px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Utwórz pierwszą trasę
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
