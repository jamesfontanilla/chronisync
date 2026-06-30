export default function PhysicianPatientsLoading() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8" aria-busy="true">
      <div className="loading-card loading-card--hero" />
      <div className="loading-stack">
        <div className="loading-card loading-card--row" />
        <div className="loading-card loading-card--row" />
        <div className="loading-card loading-card--row" />
      </div>

      <style jsx>{`
        .loading-card {
          overflow: hidden;
          border-radius: var(--ui-radius-xl);
          border: 1px solid var(--ui-border);
          background: var(--ui-surface);
          box-shadow: var(--ui-shadow);
          backdrop-filter: blur(20px);
          position: relative;
        }

        .loading-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.45),
            transparent
          );
          transform: translateX(-100%);
          animation: shimmer 1.2s infinite;
        }

        .loading-card--hero {
          min-height: 11rem;
        }

        .loading-card--row {
          min-height: 22rem;
        }

        .loading-stack {
          display: grid;
          gap: 1rem;
        }

        @keyframes shimmer {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </main>
  );
}
