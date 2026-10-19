import { useState, useMemo, useCallback } from 'react';
import data from './data/problemStatements.json';
import MarqueeBanner from './components/MarqueeBanner';
import TopNav from './components/TopNav';
import HeroSection from './components/HeroSection';
import ControlsBar from './components/ControlsBar';
import ResultsInfo from './components/ResultsInfo';
import PSCard from './components/PSCard';
import PSModal from './components/PSModal';
import EmptyState from './components/EmptyState';
import Pagination from './components/Pagination';
import './index.css';

const ITEMS_PER_PAGE = 24;

const allPS = data.problemStatements || [];
const allThemes = data.meta?.themes || [];
const allOrganizations = data.meta?.organizations || [];

function normalizeSearch(str) {
  return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function App() {
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [sortBy, setSortBy] = useState('serial');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPS, setSelectedPS] = useState(null);

  const resetAll = useCallback(() => {
    setCategory('All');
    setSearchQuery('');
    setSelectedTheme('');
    setSelectedOrg('');
    setSortBy('serial');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = category !== 'All' || searchQuery || selectedTheme || selectedOrg;

  // Filter
  const filtered = useMemo(() => {
    const q = normalizeSearch(searchQuery);
    return allPS.filter((ps) => {
      // Category filter
      if (category !== 'All' && ps.category !== category) return false;

      // Theme filter
      if (selectedTheme && ps.theme !== selectedTheme) return false;

      // Organization filter
      if (selectedOrg && ps.organization !== selectedOrg) return false;

      // Search
      if (q) {
        const searchFields = [
          ps.psNumber,
          ps.psId,
          ps.title,
          ps.description,
          ps.theme,
          ps.organization,
          ps.department,
          ps.category,
        ];
        const combined = normalizeSearch(searchFields.join(' '));
        if (!combined.includes(q)) return false;
      }

      return true;
    });
  }, [category, searchQuery, selectedTheme, selectedOrg]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'title-asc':
        arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title-desc':
        arr.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'theme':
        arr.sort((a, b) => (a.theme || '').localeCompare(b.theme || ''));
        break;
      case 'category':
        arr.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        break;
      case 'serial':
      default:
        arr.sort((a, b) => a.serialNo - b.serialNo);
        break;
    }
    return arr;
  }, [filtered, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = sorted.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleThemeChange = (t) => {
    setSelectedTheme(t);
    setCurrentPage(1);
  };

  const handleOrgChange = (o) => {
    setSelectedOrg(o);
    setCurrentPage(1);
  };

  const handleSortChange = (s) => {
    setSortBy(s);
    setCurrentPage(1);
  };

  return (
    <>
      <MarqueeBanner />
      <TopNav
        category={category}
        setCategory={handleCategoryChange}
        totalShown={sorted.length}
        totalAll={allPS.length}
      />
      <HeroSection />

      <ControlsBar
        category={category}
        setCategory={handleCategoryChange}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        selectedTheme={selectedTheme}
        setSelectedTheme={handleThemeChange}
        selectedOrg={selectedOrg}
        setSelectedOrg={handleOrgChange}
        sortBy={sortBy}
        setSortBy={handleSortChange}
        themes={allThemes}
        organizations={allOrganizations}
        onReset={resetAll}
        hasActiveFilters={hasActiveFilters}
      />

      <ResultsInfo
        count={sorted.length}
        total={allPS.length}
        category={category}
        selectedTheme={selectedTheme}
        selectedOrg={selectedOrg}
        searchQuery={searchQuery}
        onClearTheme={() => handleThemeChange('')}
        onClearOrg={() => handleOrgChange('')}
        onClearSearch={() => handleSearchChange('')}
      />

      <main className="cards-section">
        {sorted.length === 0 ? (
          <EmptyState onReset={resetAll} />
        ) : (
          <>
            <div className="cards-grid">
              {paginatedItems.map((ps) => (
                <PSCard key={ps.psNumber || ps.serialNo} ps={ps} onClick={setSelectedPS} />
              ))}
            </div>
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>

      <footer className="site-footer section-gray">
        <p>Smart India Hackathon 2026 — Problem Statements Explorer</p>
        <p>Data sourced from SIH 2026 official problem statements. Total: {allPS.length} PS</p>
      </footer>

      {selectedPS && (
        <PSModal ps={selectedPS} onClose={() => setSelectedPS(null)} />
      )}
    </>
  );
}

export default App;
