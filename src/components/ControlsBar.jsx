
export default function ControlsBar({
  category,
  setCategory,
  searchQuery,
  setSearchQuery,
  selectedTheme,
  setSelectedTheme,
  selectedOrg,
  setSelectedOrg,
  sortBy,
  setSortBy,
  themes,
  organizations,
  onReset,
  hasActiveFilters,
}) {
  return (
    <div className="controls-section">
      {/* Category pills for mobile screens */}
      <div className="mobile-category-row" role="tablist" aria-label="Category selector">
        {['All', 'Software', 'Hardware'].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`pill-nav-btn${category === cat ? ' active' : ''}`}
            onClick={() => setCategory(cat)}
            role="tab"
            aria-selected={category === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="search-row">
        <div className="search-input-wrap">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="search-input"
            className="search-input"
            type="text"
            placeholder="Search by ID, title, description, theme, ministry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search problem statements"
          />
        </div>
      </div>

      <div className="filter-row">
        <select
          id="filter-theme"
          className="filter-select"
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          aria-label="Filter by theme"
        >
          <option value="">All Themes</option>
          {themes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          id="filter-org"
          className="filter-select"
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          aria-label="Filter by organization"
        >
          <option value="">All Organizations</option>
          {organizations.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <select
          id="sort-select"
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort problem statements"
        >
          <option value="serial">PS Number</option>
          <option value="title-asc">Title A–Z</option>
          <option value="title-desc">Title Z–A</option>
          <option value="theme">Theme</option>
          <option value="category">Category</option>
        </select>

        {hasActiveFilters && (
          <button
            id="reset-btn"
            className="reset-btn"
            onClick={onReset}
            aria-label="Reset all filters"
          >
            Reset All
          </button>
        )}
      </div>
    </div>
  );
}

