import { FileQuestion } from 'lucide-react';
import { Link, Route, Routes } from 'react-router-dom';
import { Card } from './components/Card';
import { EmptyState } from './components/EmptyState';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { MonitorDetailPage } from './features/detail/MonitorDetailPage';
import { HealthIndicator } from './features/health/HealthIndicator';
import { Sidebar } from './features/layout/Sidebar';
import { TopBar } from './features/layout/TopBar';

export function App() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar footer={<HealthIndicator />} />
      <main className="pl-60">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/monitors/:id" element={<MonitorDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <>
      <TopBar crumbs={[{ label: 'Not found' }]} />
      <div className="mx-auto max-w-[1440px] px-8 py-6">
        <Card>
          <EmptyState
            icon={FileQuestion}
            title="Page not found"
            description="The page you’re looking for doesn’t exist."
            action={<Link to="/" className="font-medium text-accent hover:underline">Go to dashboard</Link>}
          />
        </Card>
      </div>
    </>
  );
}
