import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

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
          <h1 className="text-2xl font-bold text-gray-900">Witaj w Waypause</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Wyloguj
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Zalogowany jako</p>
          <p className="mt-1 font-medium text-gray-900">{user.email}</p>
          {user.app_metadata?.provider && (
            <p className="mt-0.5 text-xs text-gray-400 capitalize">
              via {user.app_metadata.provider}
            </p>
          )}
        </div>

        <p className="text-gray-400 text-sm">Planowanie trasy — wkrótce tutaj.</p>
      </div>
    </main>
  );
}
