export default function DashboardLoading() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="grid gap-3">
        <div className="h-4 w-28 animate-pulse rounded-full bg-[color:var(--ui-border)]" />
        <div className="h-10 w-48 animate-pulse rounded-full bg-[color:var(--ui-border)]" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-[color:var(--ui-border)]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-32 animate-pulse rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]" />
        <div className="h-32 animate-pulse rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]" />
        <div className="h-32 animate-pulse rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]" />
        <div className="h-32 animate-pulse rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]" />
        <div className="h-72 animate-pulse rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]" />
      </div>
    </main>
  );
}
