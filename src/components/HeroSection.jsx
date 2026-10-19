
export default function HeroSection() {
  return (
    <section className="hero-section" aria-label="Hero banner">
      {/* 3D Ribbon elements */}
      <div className="hero-ribbon" aria-hidden="true" />
      <div className="hero-ribbon-2" aria-hidden="true" />

      {/* Sticker decorations */}
      <div className="sticker sticker-rocket" aria-hidden="true">🚀</div>
      <div className="sticker sticker-coin" aria-hidden="true">🪙</div>
      <div className="sticker sticker-check" aria-hidden="true">✓</div>
      <div className="sticker sticker-wallet" aria-hidden="true">💼</div>
      <div className="sticker sticker-star" aria-hidden="true">⭐</div>

      <h1 className="hero-display">SIH 2026</h1>
      <p className="hero-tagline">
        Explore all Problem Statements — Search, Filter, and Find your challenge
      </p>
    </section>
  );
}
