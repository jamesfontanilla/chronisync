export default function MedicationsLoading() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div className="grid gap-3">
        <div className="h-4 w-28 animate-pulse rounded-full bg-[color:var(--ui-border)]" />
        <div className="h-10 w-64 animate-pulse rounded-full bg-[color:var(--ui-border)]" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-[color:var(--ui-border)]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="h-[38rem] animate-pulse rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]" />
        <div className="grid gap-6">
          <div className="h-[24rem] animate-pulse rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]" />
          <div className="h-40 animate-pulse rounded-[2rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]" />
        </div>
      </div>
    </main>
  );
}
