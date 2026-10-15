
import React from 'react';

export default function SearchBar({
  search,
  category,
  sort,
  categories = [],
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onResetFilters,
  totalResults = 0,
}) {
  const hasActiveFilters = search.trim() !== '' || (category !== 'all' && category !== '') || sort !== '';

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        {/* Search Input with Icon */}
        <div style={styles.inputGroup}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            id="search-input"
            type="text"
            placeholder="Search products by title or keyword..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={styles.input}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              style={styles.clearInputBtn}
              title="Clear search text"
              aria-label="Clear search text"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown Filter */}
        <div style={styles.selectWrapper}>
          <label htmlFor="category-select" style={styles.label}>
            Category:
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Bonus Challenge: Price & Name Sorting Dropdown (+10 Marks) */}
        <div style={styles.selectWrapper}>
          <label htmlFor="sort-select" style={styles.label}>
            Sort By:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            style={styles.select}
          >
            <option value="">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High (₹)</option>
            <option value="price_desc">Price: High to Low (₹)</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        {/* Reset / Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            id="reset-filters-btn"
            onClick={onResetFilters}
            style={styles.resetBtn}
            title="Reset all active search and filter options"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Results Metadata Bar */}
      <div style={styles.metaRow}>
        <span style={styles.resultCount}>
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'product' : 'products'}
          {category && category !== 'all' ? ` in "${category}"` : ''}
          {search ? ` matching "${search}"` : ''}
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '20px 24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  topRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '16px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 300px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    fontSize: '16px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 38px 12px 42px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    boxSizing: 'border-box',
  },
  clearInputBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    whiteSpace: 'nowrap',
  },
  select: {
    padding: '11px 16px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  },
  resetBtn: {
    padding: '11px 16px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
  },
  resultCount: {
    fontSize: '13px',
    color: '#64748b',
  },
};
