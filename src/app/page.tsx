export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          MK3 Platform
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          A Next.js 16 application built with TypeScript, React 19, and Tailwind CSS 4.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <span className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
            Steel Thread Complete
          </span>
        </div>
      </div>
    </main>
  );
}
