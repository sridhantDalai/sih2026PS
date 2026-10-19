
export default function TopNav({ category, setCategory, totalShown, totalAll }) {
  return (
    <nav className="top-nav" aria-label="Main navigation">
      <a className="nav-logo" href="/" title="SIH 2026 Home" aria-label="Home">
        S
      </a>
      <div className="nav-center">
        {['All', 'Software', 'Hardware'].map((cat) => (
          <button
            key={cat}
            className={`pill-nav-btn${category === cat ? ' active' : ''}`}
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            id={`nav-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="nav-count-badge" aria-live="polite">
        {totalShown} / {totalAll} PS
      </div>
    </nav>
  );
}
