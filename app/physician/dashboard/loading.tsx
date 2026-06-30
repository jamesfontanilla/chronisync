export default function PhysicianDashboardLoading() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8" aria-busy="true">
      <div className="loading-card loading-card--hero">
        <div className="loading-bar loading-bar--eyebrow" />
        <div className="loading-bar loading-bar--title" />
        <div className="loading-bar loading-bar--line" />
        <div className="loading-bar loading-bar--line loading-bar--short" />
        <div className="loading-actions">
          <div className="loading-pill" />
          <div className="loading-pill loading-pill--wide" />
        </div>
      </div>

      <div className="loading-grid">
        <div className="loading-card loading-card--panel" />
        <div className="loading-card loading-card--panel" />
      </div>

      <style jsx>{`
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .loading-card {
          overflow: hidden;
          border-radius: var(--ui-radius-xl);
          border: 1px solid var(--ui-border);
          background: var(--ui-surface);
          box-shadow: var(--ui-shadow);
          backdrop-filter: blur(20px);
        }

        .loading-card--hero {
          min-height: 16rem;
          padding: clamp(1.25rem, 3vw, 2rem);
        }

        .loading-card--panel {
          min-height: 28rem;
        }

        .loading-bar,
        .loading-pill {
          position: relative;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(130, 150, 158, 0.16);
        }

        .loading-bar::after,
        .loading-pill::after,
        .loading-card--panel::after {
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

        .loading-bar--eyebrow {
          width: 10rem;
          height: 0.7rem;
          margin-bottom: 1rem;
        }

        .loading-bar--title {
          width: min(100%, 28rem);
          height: 3.5rem;
          margin-bottom: 0.9rem;
          border-radius: 1.25rem;
        }

        .loading-bar--line {
          width: min(100%, 44rem);
          height: 1rem;
          margin-top: 0.7rem;
        }

        .loading-bar--short {
          width: min(100%, 24rem);
        }

        .loading-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .loading-pill {
          width: 8.5rem;
          height: 2.75rem;
        }

        .loading-pill--wide {
          width: 10.5rem;
        }

        .loading-card--panel {
          position: relative;
        }

        @keyframes shimmer {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        @media (max-width: 920px) {
          .loading-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
