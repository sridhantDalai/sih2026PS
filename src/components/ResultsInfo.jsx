
export default function ResultsInfo({
  count,
  total,
  category,
  selectedTheme,
  selectedOrg,
  searchQuery,
  onClearTheme,
  onClearOrg,
  onClearSearch,
}) {
  const activeTags = [];
  if (category !== 'All') {
    activeTags.push({ label: category, onClear: null }); // category cleared from nav
  }
  if (selectedTheme) {
    activeTags.push({ label: selectedTheme, onClear: onClearTheme });
  }
  if (selectedOrg) {
    activeTags.push({ label: selectedOrg, onClear: onClearOrg });
  }
  if (searchQuery) {
    activeTags.push({ label: `"${searchQuery}"`, onClear: onClearSearch });
  }

  return (
    <div className="results-info" aria-live="polite">
      <div className="results-count">
        Showing <span>{count}</span> of {total} Problem Statements
      </div>
      {activeTags.length > 0 && (
        <div className="active-filters">
          {activeTags.map((tag, i) => (
            <span key={i} className="active-filter-tag">
              {tag.label}
              {tag.onClear && (
                <button onClick={tag.onClear} aria-label={`Remove ${tag.label} filter`}>
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
