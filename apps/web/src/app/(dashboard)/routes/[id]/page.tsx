import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import SuggestionsPanel from './SuggestionsPanel';

export default async function RouteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: route } = await supabase
    .from('routes')
    .select('id, origin, destination, travel_time_minutes, created_at')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!route) notFound();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Moje trasy
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <div className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <span>{route.origin}</span>
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span>{route.destination}</span>
          </div>
          {route.travel_time_minutes && (
            <p className="text-sm text-gray-400">
              Szacowany czas: {route.travel_time_minutes} min
            </p>
          )}
        </div>

        <SuggestionsPanel routeId={route.id} />
      </div>
    </main>
  );
}
