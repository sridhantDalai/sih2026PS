
export default function PSCard({ ps, onClick }) {
  const categoryClass = ps.category.toLowerCase();

  return (
    <article className="ps-card" onClick={() => onClick(ps)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onClick(ps); }} aria-label={`Problem Statement ${ps.psNumber}: ${ps.title}`}>
      <div className="ps-card-header">
        <span className="ps-id-badge">{ps.psNumber}</span>
        <span className={`ps-category-badge ${categoryClass}`}>{ps.category}</span>
      </div>

      <h3 className="ps-card-title">{ps.title}</h3>

      <div className="ps-card-meta">
        <div className="ps-meta-row">
          <span className="ps-meta-label">Org</span>
          <span className="ps-meta-value">{ps.organization || '—'}</span>
        </div>
        <div className="ps-meta-row">
          <span className="ps-meta-label">Dept</span>
          <span className="ps-meta-value">{ps.department || '—'}</span>
        </div>
      </div>

      <span className="ps-card-theme">{ps.theme}</span>

      {ps.description && (
        <p className="ps-card-desc">{ps.description}</p>
      )}

      <div className="ps-card-footer">
        <button className="view-details-btn" onClick={(e) => { e.stopPropagation(); onClick(ps); }} tabIndex={-1}>
          View Details →
        </button>
      </div>
    </article>
  );
}
