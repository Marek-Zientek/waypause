import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Waypause
        </h1>
        <p className="text-lg text-gray-600">
          Planuj trasę z przystankami. AI podpowie co warto zobaczyć po drodze,
          a my znajdziemy parking tuż obok.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            Zacznij za darmo
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    </main>
  );
}
