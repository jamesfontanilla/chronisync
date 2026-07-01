"use client";

export default function Loading() {
  return (
    <main className="loading-shell" aria-busy="true" aria-live="polite">
      <div className="loading-grid">
        <div className="loading-card loading-card--hero">
          <div className="loading-bar loading-bar--eyebrow" />
          <div className="loading-bar loading-bar--title" />
          <div className="loading-bar loading-bar--line" />
          <div className="loading-bar loading-bar--line loading-bar--short" />

          <div className="loading-actions">
            <div className="loading-pill" />
            <div className="loading-pill loading-pill--wide" />
          </div>

          <div className="loading-stats">
            <div className="loading-stat" />
            <div className="loading-stat" />
            <div className="loading-stat" />
          </div>
        </div>

        <div className="loading-card loading-card--sidebar">
          <div className="loading-bar loading-bar--eyebrow" />
          <div className="loading-bar loading-bar--section" />
          <div className="loading-stack">
            <div className="loading-row" />
            <div className="loading-row" />
            <div className="loading-row" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .loading-shell {
          min-height: 100vh;
          padding: 1.25rem;
        }

        .loading-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
          gap: 1.25rem;
          width: min(1240px, 100%);
          margin: 0 auto;
        }

        .loading-card {
          border-radius: var(--ui-radius-xl);
          border: 1px solid var(--ui-border);
          background: var(--ui-surface);
          box-shadow: var(--ui-shadow);
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .loading-card--hero {
          padding: clamp(1.5rem, 4vw, 2.25rem);
          min-height: 36rem;
        }

        .loading-card--sidebar {
          padding: clamp(1.25rem, 3vw, 1.75rem);
          min-height: 36rem;
        }

        .loading-bar,
        .loading-pill,
        .loading-stat,
        .loading-row {
          position: relative;
          overflow: hidden;
          background: rgba(130, 150, 158, 0.16);
        }

        .loading-bar::after,
        .loading-pill::after,
        .loading-stat::after,
        .loading-row::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.5),
            transparent
          );
          transform: translateX(-100%);
          animation: shimmer 1.25s infinite;
        }

        .loading-bar {
          border-radius: 999px;
        }

        .loading-bar--eyebrow {
          width: 10rem;
          height: 0.7rem;
          margin-bottom: 1rem;
        }

        .loading-bar--title {
          width: min(100%, 34rem);
          height: 4.25rem;
          margin-bottom: 1rem;
          border-radius: 1.5rem;
        }

        .loading-bar--line {
          width: min(100%, 46rem);
          height: 1rem;
          margin-top: 0.75rem;
        }

        .loading-bar--short {
          width: min(100%, 28rem);
        }

        .loading-bar--section {
          width: 12rem;
          height: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .loading-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.75rem;
        }

        .loading-pill {
          width: 8.5rem;
          height: 2.8rem;
          border-radius: 999px;
        }

        .loading-pill--wide {
          width: 11.5rem;
        }

        .loading-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 2rem;
        }

        .loading-stat {
          border-radius: var(--ui-radius-md);
          min-height: 7rem;
        }

        .loading-stack {
          display: grid;
          gap: 0.75rem;
        }

        .loading-row {
          height: 4.25rem;
          border-radius: 1.25rem;
        }

        @keyframes shimmer {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        @media (max-width: 960px) {
          .loading-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .loading-shell {
            padding: 0.75rem;
          }

          .loading-card--hero,
          .loading-card--sidebar {
            min-height: auto;
          }

          .loading-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
