
export default function MarqueeBanner() {
  const message = 'SIH 2026 — Smart India Hackathon — Explore Problem Statements — Build. Innovate. Transform. — ';
  return (
    <div className="marquee-banner" role="banner">
      <div className="marquee-inner" aria-label="Scrolling announcement">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i}>{message}</span>
        ))}
      </div>
    </div>
  );
}
