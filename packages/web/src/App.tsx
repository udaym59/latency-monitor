import { HealthIndicator } from './features/health/HealthIndicator';

export function App() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-[480px] rounded-xl border border-border bg-background p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Uptime Monitor</h1>
        <div className="mt-4">
          <HealthIndicator />
        </div>
      </section>
    </main>
  );
}
