
export default function EmptyState({ onReset }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">🔍</div>
      <h2>No Problem Statements Found</h2>
      <p>Try adjusting your search or filters to find what you&apos;re looking for.</p>
      <button onClick={onReset}>Reset All Filters</button>
    </div>
  );
}
